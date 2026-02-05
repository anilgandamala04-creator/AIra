# Quick Start Commands

## 📁 Directory Structure

```
Project AIra/
└── AIra/              ← Frontend code is here
    ├── package.json   ← Frontend package.json
    ├── src/
    └── ...
└── AIra/backend/      ← Backend code is here
    ├── package.json   ← Backend package.json
    └── src/
```

## 🚀 Starting the Application

### Option 1: Using Full Paths (Recommended)

**Terminal 1 - Frontend:**
```powershell
cd "C:\Users\HP\Downloads\Project AIra\AIra"
npm run dev
```

**Terminal 2 - Backend:**
```powershell
cd "C:\Users\HP\Downloads\Project AIra\AIra\backend"
npm run dev
```

### Option 2: Navigate First, Then Run

**For Frontend:**
```powershell
cd "C:\Users\HP\Downloads\Project AIra\AIra"
npm install    # Only needed first time
npm run dev
```

**For Backend:**
```powershell
cd "C:\Users\HP\Downloads\Project AIra\AIra\backend"
npm install    # Only needed first time
npm run dev
```

## ✅ Verification

### Check Frontend is Running:
- Open: http://localhost:3000 or http://localhost:5173
- You should see the login page

### Check Backend is Running:
- Open: http://localhost:5000/health
- You should see JSON response with `"status": "ok"`

## 🔧 Common Commands

### Frontend (in `AIra/` directory):
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
```

### Backend (in `AIra/backend/` directory):
```powershell
npm run dev          # Start development server (with auto-reload)
npm run start        # Start production server
```

## ⚠️ Important Notes

1. **Always navigate to the correct directory first:**
   - Frontend commands → `AIra/` directory
   - Backend commands → `AIra/backend/` directory

2. **Two terminals needed:**
   - One for frontend (`npm run dev` in `AIra/`)
   - One for backend (`npm run dev` in `AIra/backend/`)

3. **Current working directory:**
   - The error you saw happens when running npm from `Project AIra/` instead of `Project AIra/AIra/`
   - Always check: `Get-Location` to see where you are

## 🎯 Quick Reference

| Command | Directory | Purpose |
|---------|-----------|---------|
| `npm run dev` | `AIra/` | Start frontend |
| `npm run dev` | `AIra/backend/` | Start backend |
| `npm install` | `AIra/` | Install frontend deps |
| `npm install` | `AIra/backend/` | Install backend deps |
