import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { aiService, getAvailableModels, AI_PROMPT_MAX_LENGTH } from './services/aiService';

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
    // Production Firebase Hosting domains
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
app.use(express.json({ limit: '10mb' }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.path}`);
  next();
});

// Firebase Authentication middleware (optional auth - allows guests like Express backend)
// Verifies the Firebase ID token when present; attaches guest uid when absent
async function verifyFirebaseAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const forwarded = req.headers['x-forwarded-for'];
  const clientIp = (typeof forwarded === 'string' ? forwarded.split(',')[0]?.trim() : Array.isArray(forwarded) ? forwarded[0] : req.ip) || 'unknown';

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
      res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${maxRequests} requests per minute. Please try again later.`
      });
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

// Request timeout middleware (60 seconds)
const REQUEST_TIMEOUT_MS = 60000;
const timeoutHandler = (req: Request, res: Response, next: NextFunction) => {
  const timeout = setTimeout(() => {
    if (!res.headersSent) {
      res.status(504).json({
        error: 'Request timeout',
        message: `Request exceeded timeout of ${REQUEST_TIMEOUT_MS}ms`
      });
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

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  try {
    const models = getAvailableModels();
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
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      error: 'Health check failed',
    });
  }
});

// Resolve doubt endpoint
app.post('/api/resolve-doubt', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { question, context, model } = req.body;

  if (question === undefined || question === null) {
    res.status(400).json({ error: 'Question is required' });
    return;
  }
  if (typeof question === 'string' && question.length > AI_PROMPT_MAX_LENGTH) {
    res.status(400).json({ error: `Question exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)` });
    return;
  }

  const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';
  try {
    const resolution = await aiService.resolveDoubt(question, context || 'General Education', modelType);
    const latency = Date.now() - startTime;
    console.log(`[Resolve Doubt] Success (${latency}ms) - Model: ${modelType}`);
    res.json(resolution);
  } catch (error) {
    const latency = Date.now() - startTime;
    const message = error instanceof Error ? error.message : 'Failed to resolve doubt';
    if (isValidationError(message)) {
      res.status(400).json({ error: message });
      return;
    }
    console.error(`[Resolve Doubt] Error (${latency}ms):`, error);
    res.status(500).json({
      error: 'Failed to resolve doubt',
      message: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
});

// Generate content endpoint
app.post('/api/generate-content', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { prompt, model } = req.body;

  if (prompt === undefined || prompt === null) {
    res.status(400).json({ error: 'Prompt is required' });
    return;
  }
  if (typeof prompt === 'string' && prompt.length > AI_PROMPT_MAX_LENGTH) {
    res.status(400).json({ error: `Prompt exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)` });
    return;
  }

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
      res.status(400).json({ error: message });
      return;
    }
    console.error(`[Generate Content] Error (${latency}ms):`, error);
    res.status(500).json({
      error: 'Failed to generate content',
      message: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
});

// Generate teaching content endpoint
app.post('/api/generate-teaching-content', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { topic, model } = req.body;

  if (!topic) {
    res.status(400).json({ error: 'Topic is required' });
    return;
  }

  const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';
  try {
    const content = await aiService.generateTeachingContent(topic, modelType);
    const latency = Date.now() - startTime;
    console.log(`[Generate Teaching Content] Success (${latency}ms) - Model: ${modelType}, Topic: ${topic}`);
    res.json(content);
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[Generate Teaching Content] Error (${latency}ms):`, error);
    const message = error instanceof Error ? error.message : 'Failed to generate teaching content';
    res.status(500).json({
      error: 'Failed to generate teaching content',
      message: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
});

// Generate quiz endpoint
app.post('/api/generate-quiz', async (req: Request, res: Response): Promise<void> => {
  const startTime = Date.now();
  const { topic, context, model } = req.body;

  if (!topic) {
    res.status(400).json({ error: 'Topic is required' });
    return;
  }

  const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';
  try {
    const quiz = await aiService.generateQuiz(topic, context || 'General Education', modelType);
    const latency = Date.now() - startTime;
    console.log(`[Generate Quiz] Success (${latency}ms) - Model: ${modelType}, Topic: ${topic}`);
    res.json(quiz);
  } catch (error) {
    const latency = Date.now() - startTime;
    console.error(`[Generate Quiz] Error (${latency}ms):`, error);
    const message = error instanceof Error ? error.message : 'Failed to generate quiz';
    res.status(500).json({
      error: 'Failed to generate quiz',
      message: process.env.NODE_ENV === 'development' ? message : undefined,
    });
  }
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  if (!res.headersSent) {
    res.status(500).json({
      error: 'Internal server error',
      message: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  }
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Export Firebase Admin instances for use in other Cloud Functions
export { db, storage, admin };

// Export middleware functions for optional use
export { verifyFirebaseAuth, checkRateLimit };

// Export as Firebase Cloud Function
export const api = functions
  .region('us-central1')
  .runWith({
    timeoutSeconds: 60,
    memory: '512MB',
  })
  .https.onRequest(app);
