# Frontend-Backend Integration Verification

This document provides a comprehensive guide to verifying that the frontend and backend are correctly integrated and fully operational.

## Overview

The application consists of:
- **Frontend**: React/TypeScript application (port 3000)
- **Backend**: Express/TypeScript API server (port 5000)
- **Integration**: RESTful API communication via HTTP

## Backend Endpoints

All backend endpoints are located at `http://localhost:5000`:

| Endpoint | Method | Purpose | Request Body |
|----------|--------|---------|--------------|
| `/health` | GET | Health check and model availability | None |
| `/api/generate-content` | POST | Generate AI content (chat, notes, etc.) | `{ prompt, model }` |
| `/api/resolve-doubt` | POST | Resolve student doubts | `{ question, context, model }` |
| `/api/generate-teaching-content` | POST | Generate structured lessons | `{ topic, model }` |
| `/api/generate-quiz` | POST | Generate quizzes | `{ topic, context, model }` |

## Verification Steps

### 1. Start the Backend Server

```bash
cd backend
npm install  # If not already done
npm run dev  # Development mode with auto-reload
```

Expected output:
```
🚀 AI Backend running on http://localhost:5000
📡 Health check: http://localhost:5000/health
🔧 Environment: development
🤖 Available models: LLaMA=✓, Mistral=✗
```

### 2. Run Integration Tests

In a new terminal:

```bash
cd backend
npm run verify
```

This will test all endpoints and verify connectivity.

### 3. Start the Frontend

In another terminal:

```bash
npm install  # If not already done
npm run dev
```

The frontend should start on `http://localhost:3000`.

### 4. Verify Frontend-Backend Connection

1. Open the browser console (F12)
2. Navigate to the application
3. Check for any network errors
4. The app should automatically check backend health on startup

## Integration Features

### Health Monitoring

The frontend automatically monitors backend health:
- Initial health check on app startup
- Periodic health checks every 60 seconds
- Automatic fallback when backend is unavailable

### Error Handling

Both frontend and backend include comprehensive error handling:

**Backend:**
- Request validation
- Timeout handling (60 seconds default)
- Detailed error logging
- CORS support for cross-origin requests

**Frontend:**
- Network error detection
- Automatic retry with exponential backoff
- Fallback model switching (LLaMA ↔ Mistral)
- User-friendly error messages

### Request Timeouts

- **Default timeout**: 60 seconds
- **Health check timeout**: 5 seconds
- Configurable via environment variables

## Configuration

### Backend Environment Variables

Create `backend/.env`:

```env
# AI Provider Configuration
OPENROUTER_API_KEY=your_key_here
AI_PROVIDER=openrouter

# Optional
PORT=5000
REQUEST_TIMEOUT_MS=60000
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables

Create `.env` (optional, defaults to localhost:5000):

```env
VITE_API_URL=http://localhost:5000
```

## Troubleshooting

### Backend Not Starting

1. Check if port 5000 is available:
   ```bash
   # Windows
   netstat -ano | findstr :5000
   
   # Linux/Mac
   lsof -i :5000
   ```

2. Verify dependencies are installed:
   ```bash
   cd backend
   npm install
   ```

3. Check for TypeScript compilation errors:
   ```bash
   cd backend
   npx tsc --noEmit
   ```

### Frontend Cannot Connect to Backend

1. Verify backend is running:
   ```bash
   curl http://localhost:5000/health
   ```

2. Check CORS configuration in `backend/src/server.ts`

3. Verify `VITE_API_URL` in frontend environment

4. Check browser console for CORS errors

### API Requests Failing

1. Check backend logs for error messages
2. Verify API keys are configured in `backend/.env`
3. Test endpoints directly:
   ```bash
   curl -X POST http://localhost:5000/api/generate-content \
     -H "Content-Type: application/json" \
     -d '{"prompt":"Hello","model":"llama"}'
   ```

### Models Not Available

1. Check backend health endpoint:
   ```bash
   curl http://localhost:5000/health
   ```

2. Verify API keys in `backend/.env`:
   - `OPENROUTER_API_KEY` for LLaMA
   - `MISTRAL_API_KEY` for Mistral

3. Check backend logs for authentication errors

## Testing Checklist

- [ ] Backend starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] All models are available (LLaMA or Mistral)
- [ ] Frontend starts without errors
- [ ] Frontend can connect to backend
- [ ] Health monitoring shows backend as online
- [ ] Generate content endpoint works
- [ ] Resolve doubt endpoint works
- [ ] Generate teaching content endpoint works
- [ ] Generate quiz endpoint works
- [ ] Error handling works (test with backend stopped)
- [ ] Timeout handling works (test with slow responses)

## Performance Monitoring

The integration includes built-in performance monitoring:

- **Latency tracking**: All requests track response time
- **Health status**: Real-time backend availability
- **Error tracking**: Comprehensive error logging
- **Request logging**: All API calls are logged

## Next Steps

After verification:

1. Configure production API keys
2. Set up environment-specific configurations
3. Deploy backend to production server
4. Update frontend `VITE_API_URL` for production
5. Test all features end-to-end

## Support

For issues or questions:
1. Check backend logs in terminal
2. Check browser console for frontend errors
3. Review this documentation
4. Run `npm run verify` in backend directory
