# Backend Server Deployment Guide

## 🚀 Deploy Backend for Spark Plan Architecture

This guide helps you deploy the Express backend server separately so the frontend can stay on Firebase Spark plan.

---

## Quick Deployment Options

### Option 1: Render (Recommended - Free Tier Available) ⭐

1. **Sign up**: https://render.com
2. **Create New Web Service**
3. **Connect Repository** or deploy manually:
   - **Name**: `aira-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Root Directory**: `backend`

4. **Set Environment Variables**:
   ```
   OPENROUTER_API_KEY=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
   MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
   PORT=5000
   FRONTEND_URL=https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
   NODE_ENV=production
   ```

5. **Deploy** and copy the URL (e.g., `https://aira-backend.onrender.com`)

**Free Tier**: 750 hours/month (enough for always-on service)

---

### Option 2: Railway

1. **Sign up**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select `backend` directory**
4. **Set Environment Variables** (same as above)
5. **Deploy** and copy URL

**Pricing**: $5/month after free trial

---

### Option 3: Heroku

1. **Sign up**: https://heroku.com
2. **Create new app**
3. **Deploy**:
   ```bash
   cd backend
   heroku create aira-backend
   heroku config:set OPENROUTER_API_KEY=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
   heroku config:set MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
   heroku config:set FRONTEND_URL=https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
   git push heroku main
   ```

**Pricing**: $7/month (after free tier)

---

### Option 4: DigitalOcean App Platform

1. **Sign up**: https://digitalocean.com
2. **Create App** → **GitHub**
3. **Select `backend` directory**
4. **Set Environment Variables**
5. **Deploy**

**Pricing**: $5-12/month

---

## Environment Variables

Set these in your deployment platform:

```env
# Required
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key
PORT=5000

# CORS Configuration
FRONTEND_URL=https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com

# Optional
NODE_ENV=production
AI_PROVIDER=openrouter
AI_REQUEST_TIMEOUT_MS=60000
```

---

## Update Frontend Configuration

After deploying backend, update frontend:

### Option 1: Environment Variable (Recommended)

Create `.env` in project root:
```env
VITE_API_URL=https://your-backend.onrender.com
```

### Option 2: Update Code

Edit `src/services/aiApi.ts`:
```typescript
const backendUrl = 'https://your-backend.onrender.com';
```

---

## Verify Deployment

1. **Test Backend Health**:
   ```bash
   curl https://your-backend.onrender.com/health
   ```

2. **Expected Response**:
   ```json
   {
     "status": "ok",
     "models": {
       "llama": true,
       "mistral": true
     }
   }
   ```

3. **Test from Frontend**:
   - Deploy frontend: `firebase deploy --only hosting`
   - Visit: `https://aira-learning-a3884.web.app`
   - Test AI features

---

## Local Development

```bash
# Navigate to backend
cd backend

# Create .env file
cat > .env << EOF
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
PORT=5000
FRONTEND_URL=http://localhost:5173,http://localhost:3000
EOF

# Install and run
npm install
npm run dev
```

---

## Troubleshooting

### CORS Errors

- Make sure `FRONTEND_URL` includes your Firebase Hosting domain
- Check backend logs for CORS errors
- Verify frontend is using correct backend URL

### Backend Not Responding

- Check backend deployment logs
- Verify environment variables are set
- Test health endpoint directly
- Check backend server status in deployment platform

### API Keys Not Working

- Verify keys are set correctly in deployment platform
- Check backend logs for API key errors
- Test keys directly with API providers

---

## Cost Comparison

| Platform | Free Tier | Paid Tier | Best For |
|----------|-----------|-----------|----------|
| **Render** | 750 hrs/month | $7/month | Small apps, free tier |
| **Railway** | Trial period | $5/month | Easy deployment |
| **Heroku** | Limited | $7/month | Established platform |
| **DigitalOcean** | None | $5-12/month | More control |

**Recommendation**: Start with Render free tier, upgrade if needed.

---

**Status**: Ready for deployment
**Architecture**: Separate backend server (Spark plan compatible)
