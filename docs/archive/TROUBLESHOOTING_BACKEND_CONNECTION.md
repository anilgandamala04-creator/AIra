# Troubleshooting: Backend Connection Issues

## Quick Fixes

### 1. Hard Refresh Your Browser
The frontend might be caching the error state. Try:
- **Chrome/Edge**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Firefox**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Safari**: `Cmd + Shift + R`

### 2. Check Browser Console
Open browser DevTools (F12) and check:
- **Console tab**: Look for any error messages
- **Network tab**: Check if requests to `http://localhost:5000/health` are being made
- Look for CORS errors or connection refused errors

### 3. Verify Backend is Running
Open a new terminal and run:
```bash
curl http://localhost:5000/health
```

You should see:
```json
{
  "status": "ok",
  "timestamp": "...",
  "provider": "openrouter",
  "models": { "llama": true, "mistral": false },
  "limits": { "maxPromptLength": 32000 },
  "version": "1.0.0"
}
```

### 4. Check Frontend Port
Make sure your frontend is running on one of these ports:
- `http://localhost:3000` (Vite default)
- `http://localhost:5173` (Vite alternative)
- `http://localhost:3001`

The backend CORS is configured for these ports.

### 5. Manual Health Check
Open your browser and navigate to:
```
http://localhost:5000/health
```

You should see the JSON response. If you see an error, the backend might not be running.

## Common Issues

### Issue: "CORS Error"
**Solution**: Make sure `FRONTEND_URL` in `backend/.env` includes your frontend URL:
```env
FRONTEND_URL=http://localhost:3000,http://localhost:5173
```

### Issue: "Connection Refused"
**Solution**: 
1. Check if backend is running: `Get-Process | Where-Object { $_.ProcessName -eq "node" }`
2. Restart the backend: `cd backend && npm run dev`

### Issue: "Timeout"
**Solution**: 
1. Check your internet connection
2. Verify API keys in `backend/.env` are valid
3. Check if OpenRouter/Mistral services are accessible

### Issue: Frontend Shows Old Error
**Solution**:
1. Hard refresh browser (Ctrl+Shift+R)
2. Clear browser cache
3. Restart frontend dev server

## Debug Steps

### Step 1: Check Backend Logs
Look at the terminal where the backend is running. You should see:
```
🚀 AI Backend running on http://localhost:5000
📡 Health check: http://localhost:5000/health
```

### Step 2: Test from Browser Console
Open browser DevTools (F12) → Console tab, and run:
```javascript
fetch('http://localhost:5000/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

If this works, the backend is accessible. If not, check CORS or firewall.

### Step 3: Check Frontend URL Detection
In browser console, check what URL the frontend is using:
```javascript
// This will show in console logs
// Look for: "[AI API] Using local development URL: http://localhost:5000"
```

### Step 4: Force Health Check Refresh
The frontend has a health check that runs every 60 seconds. You can manually trigger it by:
1. Looking for the AI status indicator in the UI
2. Clicking the refresh button if available
3. Or wait for the automatic check

## Still Not Working?

1. **Restart Both Services**:
   - Stop backend (Ctrl+C in backend terminal)
   - Stop frontend (Ctrl+C in frontend terminal)
   - Start backend: `cd backend && npm run dev`
   - Start frontend: `npm run dev` (in root)

2. **Check Port Conflicts**:
   - Make sure port 5000 is not used by another application
   - Check: `netstat -ano | findstr :5000`

3. **Verify .env File**:
   - Make sure `backend/.env` exists
   - Contains at least: `OPENROUTER_API_KEY=your_key_here`

4. **Check Firewall**:
   - Windows Firewall might be blocking localhost connections
   - Try disabling firewall temporarily to test

## Current Status

✅ **Backend is running** on http://localhost:5000
✅ **Health endpoint responds** correctly
✅ **CORS is configured** for localhost:3000 and localhost:5173

If you're still seeing the error, try:
1. Hard refresh (Ctrl+Shift+R)
2. Check browser console for errors
3. Verify frontend is on port 3000 or 5173
