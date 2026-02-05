# Quick Start: Backend Server

## 🚀 Starting the AI Backend Server

The backend server must be running for AI features to work. Follow these steps:

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies (if not already installed)

```bash
npm install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the `backend` directory with at least one AI provider:

**Option A: OpenRouter (Recommended - Easiest Setup)**
```env
PORT=5000
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_openrouter_api_key_here
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

Get your OpenRouter API key from: https://openrouter.ai

**Option B: Mistral AI**
```env
PORT=5000
MISTRAL_API_KEY=your_mistral_api_key_here
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

Get your Mistral API key from: https://console.mistral.ai

**Option C: Ollama (Local - No API Key Needed)**
```env
PORT=5000
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434/v1
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

### Step 4: Start the Backend Server

**For Development (with auto-reload):**
```bash
npm run dev
```

**For Production:**
```bash
npm run start
```

### Step 5: Verify Server is Running

You should see output like:
```
🚀 AI Backend running on http://localhost:5000
📡 Health check: http://localhost:5000/health
🔧 Environment: development
⏱️  Request timeout: 60000ms
🤖 Available models: LLaMA=✓, Mistral=✗
🌐 Allowed origins: http://localhost:3000, http://localhost:5173
```

### Step 6: Test the Health Endpoint

Open in your browser or use curl:
```bash
curl http://localhost:5000/health
```

You should get a JSON response with server status.

## 🔧 Troubleshooting

### Port Already in Use
If port 5000 is already in use, change it in `.env`:
```env
PORT=5001
```

Then update frontend `.env`:
```env
VITE_API_URL=http://localhost:5001
```

### No Models Available
If you see `LLaMA=✗, Mistral=✗`, check:
1. Your API key is correct in `.env`
2. The API key has sufficient credits/quota
3. Your internet connection is working

### CORS Errors
Make sure `FRONTEND_URL` in backend `.env` includes your frontend URL:
```env
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

## 📝 Quick Reference

- **Backend URL**: http://localhost:5000
- **Health Check**: http://localhost:5000/health
- **Development Command**: `npm run dev` (in backend directory)
- **Production Command**: `npm run start` (in backend directory)

## ⚠️ Important Notes

1. **Keep the backend running** - The frontend needs the backend to be running at all times for AI features
2. **Two terminals needed** - One for frontend (`npm run dev` in root), one for backend (`npm run dev` in backend/)
3. **API Keys required** - At least one AI provider (OpenRouter, Mistral, or Ollama) must be configured
