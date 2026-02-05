import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { aiService, getAvailableModels, AI_PROMPT_MAX_LENGTH } from './services/aiService';
import { verifyIdToken } from './services/firebase';

// Load backend/.env first, then parent (AIra/.env) so one .env can drive both frontend and backend
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

// In-memory rate limit (per uid); use Firestore or Redis in multi-instance deployments
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_WINDOW_MS = 60000;
const RATE_MAX_REQUESTS = 30;
function getRateLimitKey(uid: string): string {
  return uid;
}
function checkRateLimitInMemory(uid: string): boolean {
  const now = Date.now();
  const key = getRateLimitKey(uid);
  const entry = rateLimitMap.get(key);
  if (!entry) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart > RATE_WINDOW_MS) {
    rateLimitMap.set(key, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_MAX_REQUESTS) return false;
  entry.count++;
  return true;
}

const app = express();
const port = process.env.PORT || 5000;

// Enhanced CORS configuration - supports multiple origins and development/production
const getAllowedOrigins = (): string[] => {
    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
        // Support comma-separated URLs
        return frontendUrl.split(',').map(url => url.trim());
    }
    // Default origins: include Firebase Hosting URLs and all common local dev origins
    return [
        // Firebase Hosting (production)
        'https://aira-learning-a3884.web.app',
        'https://aira-learning-a3884.firebaseapp.com',
        'https://aira-education-c822b.web.app',
        'https://aira-education-c822b.firebaseapp.com',
        'https://airaedtech.web.app',
        'https://airaedtech.firebaseapp.com',
        // Local development (Vite uses 5173 by default; may use 5174–5176 if port busy)
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:5175',
        'http://localhost:5176',
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'http://127.0.0.1:5174',
        'http://127.0.0.1:5175',
        'http://127.0.0.1:5176',
        'http://127.0.0.1:3001',
        'http://127.0.0.1:3002',
    ];
};

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
            return callback(null, true);
        }
        const allowedOrigins = getAllowedOrigins();
        if (allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
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

// Firebase Authentication middleware (allows guest access with rate limiting)
async function verifyFirebaseAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const authHeader = req.headers.authorization;
    const clientIp = (req.ip || req.headers['x-forwarded-for'] || 'unknown').toString();

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
        const decoded = await verifyIdToken(idToken);
        if (decoded) {
            (req as any).uid = decoded.uid;
            (req as any).isGuest = false;
            (req as any).user = decoded;
        } else {
            (req as any).uid = `guest_${clientIp}`;
            (req as any).isGuest = true;
        }
    } catch (err: any) {
        console.error('Firebase Auth verification error:', err?.message || err);
        (req as any).uid = `guest_${clientIp}`;
        (req as any).isGuest = true;
    }
    next();
}

// Rate limiting middleware (in-memory)
function checkRateLimit(req: Request, res: Response, next: NextFunction): void {
    const uid = (req as any).uid;
    if (!uid) return next();

    if (!checkRateLimitInMemory(uid)) {
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: `Maximum ${RATE_MAX_REQUESTS} requests per minute. Please try again later.`
        });
        return;
    }
    next();
}

// Request timeout middleware (60 seconds default, configurable via AI_REQUEST_TIMEOUT_MS)
const REQUEST_TIMEOUT_MS = Math.max(
    5000, // Minimum 5 seconds
    parseInt(process.env.AI_REQUEST_TIMEOUT_MS || process.env.REQUEST_TIMEOUT_MS || '60000', 10)
);

// Enhanced timeout handler with proper cleanup
const timeoutHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.status(504).json({
                error: 'Request timeout',
                message: `Request exceeded timeout of ${REQUEST_TIMEOUT_MS}ms`
            });
        }
    }, REQUEST_TIMEOUT_MS);

    // Clear timeout when response is sent
    res.on('finish', () => clearTimeout(timeout));
    res.on('close', () => clearTimeout(timeout));

    next();
};

app.use(timeoutHandler);

function isValidationError(message: string): boolean {
    return (
        message.includes('cannot be empty') ||
        message.includes('exceeds maximum length') ||
        message.includes('maximum length')
    );
}

app.get('/health', (req, res) => {
    try {
        const models = getAvailableModels();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            provider: process.env.AI_PROVIDER || 'openrouter',
            models: { llama: models.llama, mistral: models.mistral },
            limits: { maxPromptLength: AI_PROMPT_MAX_LENGTH },
            version: '1.0.0',
        });
    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            status: 'error',
            error: 'Health check failed',
        });
    }
});

app.post('/api/resolve-doubt', verifyFirebaseAuth, checkRateLimit, async (req, res) => {
    const startTime = Date.now();
    const { question, context, model } = req.body;

    if (question === undefined || question === null) {
        return res.status(400).json({ error: 'Question is required' });
    }
    if (typeof question === 'string' && question.length > AI_PROMPT_MAX_LENGTH) {
        return res.status(400).json({ error: `Question exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)` });
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
            return res.status(400).json({ error: message });
        }
        console.error(`[Resolve Doubt] Error (${latency}ms):`, error);
        res.status(500).json({
            error: 'Failed to resolve doubt',
            message: process.env.NODE_ENV === 'development' ? message : undefined,
        });
    }
});

app.post('/api/generate-content', verifyFirebaseAuth, checkRateLimit, async (req, res) => {
    const startTime = Date.now();
    const { prompt, model } = req.body;

    if (prompt === undefined || prompt === null) {
        return res.status(400).json({ error: 'Prompt is required' });
    }
    if (typeof prompt === 'string' && prompt.length > AI_PROMPT_MAX_LENGTH) {
        return res.status(400).json({ error: `Prompt exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)` });
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
            return res.status(400).json({ error: message });
        }
        console.error(`[Generate Content] Error (${latency}ms):`, error);
        res.status(500).json({
            error: 'Failed to generate content',
            message: process.env.NODE_ENV === 'development' ? message : undefined,
        });
    }
});

app.post('/api/generate-teaching-content', verifyFirebaseAuth, checkRateLimit, async (req, res) => {
    const startTime = Date.now();
    const { topic, model } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
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

app.post('/api/generate-quiz', verifyFirebaseAuth, checkRateLimit, async (req, res) => {
    const startTime = Date.now();
    const { topic, context, model } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('Unhandled error:', err);
    if (!res.headersSent) {
        res.status(500).json({
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
    }
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found', path: req.path });
});

// Export middleware functions
export { verifyFirebaseAuth, checkRateLimit };

// Graceful shutdown handler
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

const server = app.listen(port, () => {
    console.log(`\n🚀 AI Backend running on http://localhost:${port}`);
    console.log(`📡 Health check: http://localhost:${port}/health`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`⏱️  Request timeout: ${REQUEST_TIMEOUT_MS}ms`);
    const models = getAvailableModels();
    console.log(`🤖 Available models: LLaMA=${models.llama ? '✓' : '✗'}, Mistral=${models.mistral ? '✓' : '✗'}`);
    console.log(`🌐 Allowed origins: ${getAllowedOrigins().join(', ')}\n`);

    if (!models.llama && !models.mistral) {
        console.warn('⚠️  WARNING: No AI models are configured. Please set OPENROUTER_API_KEY or MISTRAL_API_KEY in backend/.env');
    }
});

// Graceful shutdown for server
const gracefulShutdown = () => {
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });

    // Force close after 10 seconds
    setTimeout(() => {
        console.error('Forcing shutdown after timeout');
        process.exit(1);
    }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
