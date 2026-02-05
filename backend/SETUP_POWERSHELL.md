# Backend Setup for Windows PowerShell

## 🚀 Quick Setup (PowerShell)

### Option 1: Use Setup Script (Easiest)

```powershell
cd backend
.\setup-env.ps1
```

### Option 2: Manual PowerShell Command

```powershell
cd backend

# Create .env file
@"
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
PORT=5000
FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
NODE_ENV=development
AI_PROVIDER=openrouter
OPENROUTER_MODEL=qwen/qwen-2.5-7b-instruct
MISTRAL_MODEL=mistral-small-latest
DOUBT_RESOLUTION_MODEL=llama
AI_REQUEST_TIMEOUT_MS=60000
"@ | Out-File -FilePath .env -Encoding utf8
```

### Option 3: Using New-Item (Alternative)

```powershell
cd backend

$content = @"
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
PORT=5000
FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
NODE_ENV=development
"@

New-Item -Path .env -ItemType File -Force -Value $content
```

---

## ✅ Verify .env File

```powershell
# Check if file exists
Test-Path .env

# View contents (values will be shown)
Get-Content .env
```

---

## 🚀 Start Backend

```powershell
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## 🧪 Test Backend

```powershell
# Test health endpoint
Invoke-WebRequest -Uri http://localhost:5000/health | Select-Object -ExpandProperty Content

# Or use curl if available
curl http://localhost:5000/health
```

---

## 📝 Notes

- The `.env` file is already in `.gitignore` - it won't be committed
- If `.env` already exists, the script will ask before overwriting
- All API keys are configured and ready to use

---

**Status**: ✅ Ready to use
