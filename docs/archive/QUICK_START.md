# 🚀 Quick Start Guide

## Starting the Application

The application requires **two servers** to be running:

### 1. Backend Server (AI Service)

**Open a terminal and run:**

```bash
cd backend
npm install  # Only needed first time
npm run dev
```

**First time setup:** Create `backend/.env` file:
```env
PORT=5000
AI_PROVIDER=openrouter
OPENROUTER_API_KEY=your_key_here
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

Get OpenRouter API key: https://openrouter.ai

### 2. Frontend Server

**Open another terminal and run:**

```bash
npm install  # Only needed first time
npm run dev
```

The frontend will open at: http://localhost:3000

## ✅ Verification

1. **Backend is running** when you see:
   ```
   🚀 AI Backend running on http://localhost:5000
   🤖 Available models: LLaMA=✓
   ```

2. **Frontend connects** when AI features work (chat, doubt resolution, etc.)

3. **Test health endpoint**: http://localhost:5000/health

## 🔧 Troubleshooting

### "Unable to connect to AI service"
- ✅ Check backend is running (`npm run dev` in `backend/` directory)
- ✅ Check backend shows `LLaMA=✓` or `Mistral=✓`
- ✅ Verify `VITE_API_URL=http://localhost:5000` in root `.env` (optional, defaults to localhost:5000)

### Backend won't start
- ✅ Check `backend/.env` exists with at least one API key
- ✅ Run `npm install` in `backend/` directory
- ✅ Check port 5000 is not in use

### No AI models available
- ✅ Verify API key is correct in `backend/.env`
- ✅ Check API key has credits/quota
- ✅ Try a different provider (OpenRouter, Mistral, or Ollama)

## 📁 Project Structure

```
AIra/
├── backend/          # AI backend server (port 5000)
│   ├── src/
│   └── .env         # Backend configuration
├── src/             # Frontend React app
└── .env             # Frontend configuration (optional)
```

## 🎯 Next Steps

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `npm run dev` (in root)
3. Open browser: http://localhost:3000
4. Enjoy AI-powered learning! 🎓
