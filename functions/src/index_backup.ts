import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import compression from 'compression';
import { aiService, getAvailableModels, AI_PROMPT_MAX_LENGTH } from './services/aiService';
import {
  validateBody,
  resolveDoubtSchema,
  generateContentSchema,
  generateTeachingContentSchema,
  generateQuizSchema,
} from './validation';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp();
}

// Get Firestore and Storage instances
const db = admin.firestore();
const storage = admin.storage();

// Initialize Express app
const app = express();

// CORS configuration for Firebase Hosting
// Allow all Firebase Hosting domains and local development
const getAllowedOrigins = (): string[] => {
  const origins: string[] = [
    // Production Firebase Hosting (primary project)
    'https://airaedtech-48213.web.app',
    'https://airaedtech-48213.firebaseapp.com',
    'https://aira-education-c822b.web.app',
    'https://aira-education-c822b.firebaseapp.com',
    'https://aira-learning-a3884.web.app',
    'https://aira-learning-a3884.firebaseapp.com',
    'https://airaedtech.web.app',
    'https://airaedtech.firebaseapp.com',
    // Local development
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'http://localhost:5176',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:5175',
    'http://127.0.0.1:5176',
  ];

  // Add any additional origins from environment
  const additionalOrigins = process.env.ALLOWED_ORIGINS;
  if (additionalOrigins) {
    origins.push(...additionalOrigins.split(',').map(o => o.trim()));
  }

  return origins;
};

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    const allowedOrigins = getAllowedOrigins();

    // Check if origin is allowed
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // In production, be strict; in development, allow localhost
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      if (isLocalhost && process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        console.warn(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Request-Id'],
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// Structured logging helper for Cloud Functions
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  // Cloud Functions naturally handles JSON logs if objects are logged
  console.log(JSON.stringify({ timestamp, level, message, ...data }));
};

// Model status caching (TTL: 5 minutes)
let cachedModels: { llama: boolean; mistral: boolean } | null = null;
let lastModelCheck = 0;
const MODEL_CACHE_TTL = 300_000;

function getAvailableModelsCached() {
  const now = Date.now();
  if (cachedModels && (now - lastModelCheck < MODEL_CACHE_TTL)) {
    return cachedModels;
  }
  const models = getAvailableModels();
  cachedModels = models;
  lastModelCheck = now;
  return models;
}

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    log('info', 'Request processed', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      uid: (req as any).uid || 'unknown'
    });
  });
  next();
});

// Firebase Authentication middleware (optional auth - allows guests like Express backend)
// Verifies the Firebase ID token when present; attaches guest uid when absent
async function verifyFirebaseAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const forwarded = req.headers['x-forwarded-for'];
  const ipRaw = forwarded || req.ip || req.socket?.remoteAddress || 'unknown';
  const ipString = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw;
  const clientIp = String(ipString).split(',')[0].trim();

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    (req as any).uid = `guest_${clientIp}`;
    (req as any).isGuest = true;
    return next();
  }

  const idToken = authHeader.split('Bearer ')[1];
  if (!idToken) {
    (req as any).uid = `guest_${clientIp}`;
    (req as any).isGuest = true;
    return next();
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    (req as any).user = decodedToken;
    (req as any).uid = decodedToken.uid;
    (req as any).isGuest = false;
    next();
  } catch (error) {
    console.error('Firebase Auth verification error:', error);
    (req as any).uid = `guest_${clientIp}`;
    (req as any).isGuest = true;
    next();
  }
}

// Optional: Rate limiting middleware using Firestore
async function checkRateLimit(req: Request, res: Response, next: NextFunction): Promise<void> {
  const uid = (req as any).uid;
  if (!uid) {
    // Skip rate limiting if no user
    next();
    return;
  }

  try {
    const now = Date.now();
    const windowMs = 60000; // 1 minute window
    const maxRequests = 30; // Max 30 requests per minute

    const rateLimitRef = db.collection('rate_limits').doc(uid);
    const rateLimitDoc = await rateLimitRef.get();

    if (!rateLimitDoc.exists) {
      await rateLimitRef.set({
        count: 1,
        windowStart: now,
      });
      next();
      return;
    }

    const data = rateLimitDoc.data();
    if (!data) {
      await rateLimitRef.set({
        count: 1,
        windowStart: now,
      });
      next();
      return;
    }

    const { count, windowStart } = data;

    if (now - windowStart > windowMs) {
      // Reset window
      await rateLimitRef.set({
        count: 1,
        windowStart: now,
      });
      next();
    } else if (count >= maxRequests) {
      const retryAfterSeconds = Math.ceil(windowMs / 1000);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      res.status(429).json(
        toStructuredError(
          `Maximum ${maxRequests} requests per minute. Please try again later.`,
          'RATE_LIMIT'
        )
      );
    } else {
      await rateLimitRef.update({
        count: admin.firestore.FieldValue.increment(1),
      });
      next();
    }
  } catch (error) {
    console.error('Rate limit check error:', error);
    // On error, allow request (fail open)
    next();
  }
}

// ---------------------------------------------------------------------------
// Structured error shape: { error: string, code?: string } — no stack to client
// ---------------------------------------------------------------------------
export type AppErrorCode = 'VALIDATION' | 'RATE_LIMIT' | 'TIMEOUT' | 'UNAUTHORIZED' | 'NOT_FOUND' | 'SERVICE_UNAVAILABLE' | 'INTERNAL';

export function toStructuredError(error: string, code?: AppErrorCode): { error: string; code?: string } {
  return code ? { error, code } : { error };
}

// Request timeout middleware (60 seconds)
const REQUEST_TIMEOUT_MS = 60000;
const timeoutHandler = (req: Request, res: Response, next: NextFunction) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json(toStructuredError(`Request exceeded timeout of ${REQUEST_TIMEOUT_MS}ms`, 'TIMEOUT'));
    }
  }, REQUEST_TIMEOUT_MS);

  res.on('finish', () => clearTimeout(timeout));
  res.on('close', () => clearTimeout(timeout));

  next();
};

app.use(timeoutHandler);

// Apply optional auth to all API routes (health stays open)
app.use('/api', verifyFirebaseAuth);
app.use('/api', checkRateLimit);

function isValidationError(message: string): boolean {
  return (
    message.includes('cannot be empty') ||
    message.includes('exceeds maximum length') ||
    message.includes('maximum length')
  );
}

// Health check endpoint (liveness: is the process up?)
app.get('/health', (req: Request, res: Response) => {
  try {
    const models = getAvailableModelsCached();
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      provider: process.env.AI_PROVIDER || 'openrouter',
      models: { llama: models.llama, mistral: models.mistral },
      limits: { maxPromptLength: AI_PROMPT_MAX_LENGTH },
      version: '1.0.0',
      environment: 'production',
    });
  } catch (error) {
    log('error', 'Health check failed', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json(toStructuredError('Health check failed', 'INTERNAL'));
  }
});

// Readiness endpoint: fails if critical deps (e.g. Firestore) are down — for load balancer / monitoring
app.get('/health/ready', async (req: Request, res: Response) => {
  const start = Date.now();
  try {
    await Promise.race([
      db.collection('_readiness').limit(1).get(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Firestore ping timeout')), 5000)),
    ]);
    const latency = Date.now() - start;
    res.json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      firestore: 'ok',
      latencyMs: latency,
    });
  } catch (error) {
    console.error('Readiness check error:', error);
    res.status(503).json(
      toStructuredError('Service not ready; dependency check failed', 'SERVICE_UNAVAILABLE')
    );
  }
});

// Resolve doubt endpoint (body validated by Zod in validateBody)
app.post('/api/resolve-doubt', validateBody(resolveDoubtSchema), async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { question, context, curriculumContext, model } = req.body as any;

  const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';
  try {
    const resolution = await aiService.resolveDoubt(question, context || 'General Education', curriculumContext, modelType);
    const latency = Date.now() - startTime;
    console.log(`[Resolve Doubt] Success (${latency}ms) - Model: ${modelType}`);
    res.json(resolution);
  } catch (error) {
    const latency = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Failed to resolve doubt';
    if (isValidationError(message)) {
      res.status(400).json(toStructuredError(message, 'VALIDATION'));
      return;
    }
    console.error(`[Resolve Doubt] Error (${latency}ms):`, error);
    res.status(500).json(toStructuredError('Failed to resolve doubt', 'INTERNAL'));
  }
});

// Generate content endpoint (body validated by Zod)
app.post('/api/generate-content', validateBody(generateContentSchema), async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { prompt, model } = req.body as { prompt: string; model?: string };

  const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';
  try {
    const content = await aiService.generateResponse(prompt, modelType);
    const latency = Date.now() - startTime;
    console.log(`[Generate Content] Success (${latency}ms) - Model: ${modelType}, Prompt length: ${typeof prompt === 'string' ? prompt.length : 0}`);
    res.json({ content, model: modelType });
  } catch (error) {
    const latency = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Failed to generate content';
    if (isValidationError(message)) {
      res.status(400).json(toStructuredError(message, 'VALIDATION'));
      return;
    }
    console.error(`[Generate Content] Error (${latency}ms):`, error);
    res.status(500).json(toStructuredError('Failed to generate content', 'INTERNAL'));
  }
});

// Generate teaching content endpoint (body validated by Zod)
app.post('/api/generate-teaching-content', validateBody(generateTeachingContentSchema), async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { topic, prompt: fullPrompt, curriculumContext, model } = req.body as any;

  const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';

  if (fullPrompt && typeof fullPrompt === 'string' && fullPrompt.trim().length > 0) {
    try {
      const content = await aiService.generateTeachingContentFromPrompt(fullPrompt.trim(), modelType);
      const latency = Date.now() - startTime;
      console.log(`[Generate Teaching Content] Success from prompt (${latency}ms) - Model: ${modelType}`);
      res.json(content);
    } catch (error) {
      const latency = Date.now() - startTime;
      console.error(`[Generate Teaching Content] Error (${latency}ms):`, error);
      res.status(500).json(toStructuredError('Failed to generate teaching content', 'INTERNAL'));
    }
    return;
  }

  try {
    const content = await aiService.generateTeachingContent(topic, curriculumContext, modelType);
    const latency = Date.now() - startTime;
    console.log(`[Generate Teaching Content] Success (${latency}ms) - Model: ${modelType}, Topic: ${topic}`);
    res.json(content);
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[Generate Teaching Content] Error (${latency}ms):`, error);
    res.status(500).json(toStructuredError('Failed to generate teaching content', 'INTERNAL'));
  }
});

// Generate quiz endpoint (body validated by Zod)
app.post('/api/generate-quiz', validateBody(generateQuizSchema), async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { topic, context, curriculumContext, model } = req.body as any;

  const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';
  try {
    const quiz = await aiService.generateQuiz(topic, context || 'General Education', curriculumContext, modelType);
    const latency = Date.now() - startTime;
    console.log(`[Generate Quiz] Success (${latency}ms) - Model: ${modelType}, Topic: ${topic}`);
    res.json(quiz);
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[Generate Quiz] Error (${latency}ms):`, error);
    res.status(500).json(toStructuredError('Failed to generate quiz', 'INTERNAL'));
  }
});

// Central error handling middleware: no raw stack to client; consistent { error, code? }; log full error server-side only
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err?.message ?? err, err?.stack ?? '');
  if (!res.headersSent) {
    res.status(500).json(toStructuredError('Internal server error', 'INTERNAL'));
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json(toStructuredError('Endpoint not found', 'NOT_FOUND'));
});

// Export Firebase Admin instances for use in other Cloud Functions
export { db, storage, admin };

// Export middleware functions for optional use
export { verifyFirebaseAuth, checkRateLimit };

// Export as Firebase Cloud Function (2nd gen)
export const api = onRequest(
  {
    region: 'us-central1',
    timeoutSeconds: 120,
    memory: '512MiB',
  },
  app
);
