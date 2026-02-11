import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import path from 'path';
import { aiService, getAvailableModels, AI_PROMPT_MAX_LENGTH } from './services/aiService';

// Load backend/.env first, then parent (AIra/.env) so one .env can drive both frontend and backend.
// When run via "npm run dev:backend" from project root, cwd is AIra/backend so parent is AIra/.env.
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });

// In-memory rate limit (per uid); use Redis or similar in multi-instance deployments
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_WINDOW_MS = 60000;
const RATE_MAX_REQUESTS = 30;

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
    // Default origins: production frontend URLs and local dev
    return [
        // Production (add your frontend URLs here)
        'https://aira-learning-a3884.web.app',
        'https://aira-education-c822b.web.app',
        'https://airaedtech.web.app',
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
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        // In development, allow localhost, 127.0.0.1, and private IPs (same-network mobile testing)
        const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
        try {
            const url = new URL(origin);
            const isLocal = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
            const isPrivateIP = /^10\.|^172\.(1[6-9]|2\d|3[01])\.|^192\.168\./.test(url.hostname);
            if (isDev && (isLocal || isPrivateIP)) {
                return callback(null, true);
            }
        } catch {
            // invalid origin
        }
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Length', 'X-Request-Id'],
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours
};

app.disable('x-powered-by');
app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? true : false, // Fixed: use boolean, not undefined
}));
app.use(compression());
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

// Structured logging helper
const log = (level: 'info' | 'warn' | 'error', message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    if (process.env.NODE_ENV === 'production') {
        process.stdout.write(JSON.stringify({ timestamp, level, message, ...data }) + '\n');
    } else {
        const dataStr = data ? ` | ${JSON.stringify(data)}` : '';
        console.log(`[${timestamp}] ${level.toUpperCase()}: ${message}${dataStr}`);
    }
};

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

// Auth middleware: no external provider; use guest identity for rate limiting.
function authMiddleware(req: Request, res: Response, next: NextFunction): void {
    const cfIp = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'];
    const ipRaw = cfIp || req.ip || req.socket?.remoteAddress || 'unknown';
    const ipString = Array.isArray(ipRaw) ? ipRaw[0] : ipRaw;
    const ipParts = String(ipString).split(',');
    const clientIp = (ipParts[0] || 'unknown').trim();
    (req as any).uid = `guest_${clientIp}`;
    (req as any).isGuest = true;
    next();
}

// Rate limiting middleware (in-memory)
function checkRateLimit(req: Request, res: Response, next: NextFunction): void {
    const uid = (req as any).uid;
    if (!uid) {
        log('warn', 'Missing UID in rate limit check');
        return next();
    }

    if (!checkRateLimitInMemory(uid)) {
        res.setHeader('Retry-After', '60');
        res.status(429).json({
            error: 'Rate limit exceeded',
            message: `Maximum ${RATE_MAX_REQUESTS} requests per minute. Please try again later.`
        });
        return;
    }
    next();
}

// Request timeout middleware (120s default for long teaching content, configurable via AI_REQUEST_TIMEOUT_MS)
const parsedTimeout = parseInt(process.env.AI_REQUEST_TIMEOUT_MS || process.env.REQUEST_TIMEOUT_MS || '120000', 10);
const REQUEST_TIMEOUT_MS = Math.max(5000, Number.isFinite(parsedTimeout) ? parsedTimeout : 120000);

// Enhanced timeout handler with proper cleanup
const timeoutHandler = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const timeout = setTimeout(() => {
        if (!res.headersSent) {
            res.setHeader('Retry-After', '30');
            res.status(504).json({
                error: 'Request timeout',
                message: `Request exceeded timeout of ${REQUEST_TIMEOUT_MS}ms. You can try again shortly.`
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

app.get('/health', (_req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
    try {
        const models = getAvailableModelsCached();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            provider: process.env.AI_PROVIDER || 'openrouter',
            models: { llama: models.llama, mistral: models.mistral },
            limits: { maxPromptLength: AI_PROMPT_MAX_LENGTH },
            version: '1.0.0',
        });
    } catch (error) {
        log('error', 'Health check failed', { error: error instanceof Error ? error.message : 'Unknown' });
        res.status(500).json({
            status: 'error',
            error: 'Health check failed',
            timestamp: new Date().toISOString(),
        });
    }
});

app.post('/api/resolve-doubt', authMiddleware, checkRateLimit, async (req, res) => {
    const startTime = Date.now();
    const { question, context, curriculumContext, model } = req.body;

    if (question === undefined || question === null) {
        return res.status(400).json({ error: 'Question is required' });
    }
    if (typeof question === 'string' && question.length > AI_PROMPT_MAX_LENGTH) {
        return res.status(400).json({ error: `Question exceeds maximum length (${AI_PROMPT_MAX_LENGTH} characters)` });
    }

    const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';
    try {
        const resolution = await aiService.resolveDoubt(question, context || 'General Education', curriculumContext, modelType);
        if (res.headersSent) return;
        const latency = Date.now() - startTime;
        console.log(`[Resolve Doubt] Success (${latency}ms) - Model: ${modelType}`);
        res.json(resolution);
    } catch (error) {
        if (res.headersSent) return;
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

app.post('/api/generate-content', authMiddleware, checkRateLimit, async (req, res) => {
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
        if (res.headersSent) return;
        const latency = Date.now() - startTime;
        console.log(`[Generate Content] Success (${latency}ms) - Model: ${modelType}, Prompt length: ${typeof prompt === 'string' ? prompt.length : 0}`);
        res.json({ content, model: modelType });
    } catch (error) {
        if (res.headersSent) return;
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

app.post('/api/generate-teaching-content', authMiddleware, checkRateLimit, async (req, res) => {
    const startTime = Date.now();
    const { topic, prompt: fullPrompt, curriculumContext, model } = req.body;

    const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';

    if (fullPrompt && typeof fullPrompt === 'string' && fullPrompt.trim().length > 0) {
        // Frontend sent a full prompt (rich curriculum, 45+ min, etc.) – use it directly
        try {
            const content = await aiService.generateTeachingContentFromPrompt(fullPrompt.trim(), modelType);
            if (res.headersSent) return;
            const latency = Date.now() - startTime;
            console.log(`[Generate Teaching Content] Success from prompt (${latency}ms) - Model: ${modelType}`);
            res.json(content);
        } catch (error) {
            if (res.headersSent) return;
            const latency = Date.now() - startTime;
            console.error(`[Generate Teaching Content] Error (${latency}ms):`, error);
            const message = error instanceof Error ? error.message : 'Failed to generate teaching content';
            res.status(500).json({
                error: 'Failed to generate teaching content',
                message: process.env.NODE_ENV === 'development' ? message : undefined,
            });
        }
        return;
    }

    if (!topic) {
        return res.status(400).json({ error: 'Topic or prompt is required' });
    }

    try {
        const content = await aiService.generateTeachingContent(topic, curriculumContext, modelType);
        if (res.headersSent) return;
        const latency = Date.now() - startTime;
        console.log(`[Generate Teaching Content] Success (${latency}ms) - Model: ${modelType}, Topic: ${String(topic).slice(0, 80)}`);
        res.json(content);
    } catch (error) {
        if (res.headersSent) return;
        const latency = Date.now() - startTime;
        console.error(`[Generate Teaching Content] Error (${latency}ms):`, error);
        const message = error instanceof Error ? error.message : 'Failed to generate teaching content';
        res.status(500).json({
            error: 'Failed to generate teaching content',
            message: process.env.NODE_ENV === 'development' ? message : undefined,
        });
    }
});

app.post('/api/generate-quiz', authMiddleware, checkRateLimit, async (req, res) => {
    const startTime = Date.now();
    const { topic, context, curriculumContext, model } = req.body;

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const modelType = (model === 'mistral' ? 'mistral' : 'llama') as 'llama' | 'mistral';
    try {
        const quiz = await aiService.generateQuiz(topic, context || 'General Education', curriculumContext, modelType);
        if (res.headersSent) return;
        const latency = Date.now() - startTime;
        console.log(`[Generate Quiz] Success (${latency}ms) - Model: ${modelType}, Topic: ${topic}`);
        res.json(quiz);
    } catch (error) {
        if (res.headersSent) return;
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
export { authMiddleware, checkRateLimit };

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
    const models = getAvailableModelsCached();
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

// Graceful shutdown: close server then exit (no immediate exit so server can drain)
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    gracefulShutdown();
});
process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    gracefulShutdown();
});
