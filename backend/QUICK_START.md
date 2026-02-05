# Backend Quick Start

## 🚀 Setup in 2 Minutes

### Step 1: Create .env File

**Windows PowerShell:**
```powershell
cd backend
.\setup-env.ps1
```

Or manually:
```powershell
@"
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
PORT=5000
FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
NODE_ENV=development
"@ | Out-File -FilePath .env -Encoding utf8
```

**Linux/Mac/Git Bash:**
```bash
cd backend
npm run setup
```

Or manually:
```bash
cat > .env << 'EOF'
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
PORT=5000
FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
NODE_ENV=development
EOF
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Start Server

```bash
# Development (with auto-reload)
npm run dev

# Or production build
npm run build
npm start
```

### Step 4: Test

```bash
# Test health endpoint
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "ok",
  "models": {
    "llama": true,
    "mistral": true
  }
}
```

---

## ✅ Done!

Your backend server is now running with API keys configured.

---

## For Production Deployment

When deploying to Render/Railway/Heroku, set these environment variables:

```
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
PORT=5000
FRONTEND_URL=https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
NODE_ENV=production
```

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.
