# Simple PowerShell Setup

## ✅ Easiest Method: Use the Script

```powershell
cd backend
.\create-env.ps1
```

---

## Alternative: Manual One-Line Command

If the script doesn't work, use this single command:

```powershell
cd backend; @("OPENROUTER_API_KEY=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","MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862","PORT=5000","FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com","NODE_ENV=development","AI_PROVIDER=openrouter","OPENROUTER_MODEL=qwen/qwen-2.5-7b-instruct","MISTRAL_MODEL=mistral-small-latest","DOUBT_RESOLUTION_MODEL=llama","AI_REQUEST_TIMEOUT_MS=60000") | Out-File -FilePath .env -Encoding utf8
```

---

## Step-by-Step Manual Method

If you prefer to create it manually:

```powershell
cd backend

# Create empty file
New-Item -Path .env -ItemType File -Force

# Add each line
Add-Content -Path .env -Value "OPENROUTER_API_KEY=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"
Add-Content -Path .env -Value "MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862"
Add-Content -Path .env -Value "PORT=5000"
Add-Content -Path .env -Value "FRONTEND_URL=http://localhost:5173,http://localhost:3000,https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com"
Add-Content -Path .env -Value "NODE_ENV=development"
Add-Content -Path .env -Value "AI_PROVIDER=openrouter"
Add-Content -Path .env -Value "OPENROUTER_MODEL=qwen/qwen-2.5-7b-instruct"
Add-Content -Path .env -Value "MISTRAL_MODEL=mistral-small-latest"
Add-Content -Path .env -Value "DOUBT_RESOLUTION_MODEL=llama"
Add-Content -Path .env -Value "AI_REQUEST_TIMEOUT_MS=60000"
```

---

## Verify

```powershell
# Check file exists
Test-Path .env

# View contents
Get-Content .env
```

---

## Start Backend

```powershell
npm install
npm run dev
```
