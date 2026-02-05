# Spark Plan Deployment Guide

## ✅ Architecture for Spark Plan

The application is configured to work **exclusively on the Firebase Spark (free) plan**:

### Services on Firebase (Spark Plan ✅)

- ✅ **Firebase Hosting** - Frontend deployment (Spark plan ✅)
- ✅ **Firebase Authentication** - User authentication (Spark plan ✅)
- ✅ **Cloud Firestore** - Database (Spark plan ✅)
- ✅ **Firebase Storage** - File storage (Spark plan ✅)

### Backend API (Separate Server)

- ✅ **Express Backend Server** - AI processing (deployed separately)
  - Can be deployed on: Render, Railway, Heroku, DigitalOcean, etc.
  - No Firebase plan requirement

---

## 🚀 Deployment Steps

### Step 1: Deploy Backend Server

The backend server needs to be deployed separately. Choose one of these platforms:

#### Option A: Render (Recommended - Free Tier Available)

1. **Create account**: https://render.com
2. **Create new Web Service**
3. **Connect your repository** or deploy from:
   ```bash
   cd backend
   # Set environment variables in Render dashboard:
   # OPENROUTER_API_KEY=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
   # MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
   # PORT=5000
   ```
4. **Build command**: `npm install && npm run build`
5. **Start command**: `npm start`
6. **Copy the URL** (e.g., `https://your-backend.onrender.com`)

#### Option B: Railway

1. **Create account**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select backend directory**
4. **Set environment variables** in Railway dashboard
5. **Deploy** and copy the URL

#### Option C: Heroku

1. **Create account**: https://heroku.com
2. **Create new app**
3. **Deploy** using Heroku CLI or GitHub
4. **Set config vars** in Heroku dashboard
5. **Copy the URL**

### Step 2: Configure Frontend

Update the frontend to use your backend URL:

**Option 1: Environment Variable (Recommended)**

Create `.env` file in project root:
```env
VITE_API_URL=https://your-backend.onrender.com
```

**Option 2: Update Code**

Edit `src/services/aiApi.ts` and replace the production URL:
```typescript
const backendUrl = 'https://your-backend.onrender.com';
```

### Step 3: Deploy Frontend to Firebase Hosting

```bash
# Build frontend
npm run build

# Deploy to Firebase Hosting (Spark plan ✅)
firebase deploy --only hosting
```

### Step 4: Configure Backend CORS

Make sure your backend allows requests from your Firebase Hosting domain.

In `backend/src/server.ts`, update CORS origins:
```typescript
const getAllowedOrigins = (): string[] => {
    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
        return frontendUrl.split(',').map(url => url.trim());
    }
    return [
        'https://aira-learning-a3884.web.app',
        'https://aira-learning-a3884.firebaseapp.com',
        'http://localhost:3000',
        'http://localhost:5173',
    ];
};
```

Set `FRONTEND_URL` in your backend deployment:
```
FRONTEND_URL=https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
```

---

## 📋 Complete Deployment Checklist

### Backend Server

- [ ] Backend deployed on Render/Railway/Heroku
- [ ] Environment variables set:
  - [ ] `OPENROUTER_API_KEY`
  - [ ] `MISTRAL_API_KEY`
  - [ ] `FRONTEND_URL` (for CORS)
- [ ] Backend URL obtained (e.g., `https://your-backend.onrender.com`)
- [ ] Health endpoint tested: `curl https://your-backend.onrender.com/health`

### Frontend

- [ ] `.env` file created with `VITE_API_URL`
- [ ] Frontend built: `npm run build`
- [ ] Firebase project on Spark plan
- [ ] Frontend deployed: `firebase deploy --only hosting`
- [ ] Application accessible at: `https://aira-learning-a3884.web.app`

### Verification

- [ ] Application loads correctly
- [ ] Authentication works
- [ ] AI features functional (test content generation)
- [ ] Database operations work
- [ ] File uploads work

---

## 🔧 Backend Server Setup

### Local Development

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

# Install dependencies
npm install

# Run development server
npm run dev
```

### Production Deployment

**For Render/Railway/Heroku**, set these environment variables:

```env
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
PORT=5000
FRONTEND_URL=https://aira-learning-a3884.web.app,https://aira-learning-a3884.firebaseapp.com
NODE_ENV=production
```

---

## 📊 Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│              Firebase Spark Plan (Free)                  │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Auth        │  │  Firestore  │  │  Storage     │ │
│  │  (Spark ✅)  │  │  (Spark ✅)  │  │  (Spark ✅)  │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Firebase Hosting (Frontend)              │  │
│  │         (Spark ✅)                                │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
         │
         │ API Calls
         ▼
┌─────────────────────────────────────────────────────────┐
│         Separate Backend Server                          │
│         (Render/Railway/Heroku/etc.)                    │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Express Server                           │  │
│  │  - AI Processing (LLaMA/Mistral)                 │  │
│  │  - API Endpoints                                  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 💰 Cost Breakdown

### Firebase (Spark Plan)
- **Cost**: $0/month
- **Services**: Hosting, Auth, Firestore, Storage
- **Limits**: Generous free tier for small-medium apps

### Backend Server
- **Render Free Tier**: $0/month (with limitations)
- **Railway**: $5/month (after free trial)
- **Heroku**: $7/month (after free tier)
- **DigitalOcean**: $4-6/month

**Total Estimated Cost**: $0-7/month depending on backend hosting choice

---

## ✅ Benefits of This Architecture

1. ✅ **Stays on Spark Plan** - No Firebase upgrade needed
2. ✅ **Flexible Backend** - Choose any hosting provider
3. ✅ **Cost Effective** - Can use free tiers
4. ✅ **Scalable** - Easy to scale backend independently
5. ✅ **No Vendor Lock-in** - Backend can be moved easily

---

## 🚨 Important Notes

1. **Backend URL**: Make sure to set `VITE_API_URL` in your frontend environment
2. **CORS**: Configure backend to allow requests from Firebase Hosting domain
3. **Environment Variables**: Never commit API keys to version control
4. **Health Monitoring**: Backend health checks will point to your backend server
5. **Error Messages**: Updated to reflect backend server instead of Cloud Functions

---

## 📚 Next Steps

1. ✅ Deploy backend server (Render/Railway/Heroku)
2. ✅ Set `VITE_API_URL` environment variable
3. ✅ Deploy frontend: `firebase deploy --only hosting`
4. ✅ Test all features
5. ✅ Monitor backend server health

---

**Status**: ✅ Configured for Spark Plan
**Architecture**: Frontend on Firebase, Backend on separate server
