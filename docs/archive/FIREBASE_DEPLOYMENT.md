# Firebase Deployment Guide - Complete Setup

This guide covers deploying both the **frontend** (Firebase Hosting) and **backend** (Firebase Cloud Functions) to Firebase.

## 🎯 Overview

- **Frontend**: Deployed to Firebase Hosting (SPA)
- **Backend API**: Deployed as Firebase Cloud Functions
- **Database**: Firestore (already configured)
- **Storage**: Firebase Storage (already configured)

## 📋 Prerequisites

1. **Node.js** (v18+ recommended)
2. **Firebase CLI**: `npm install -g firebase-tools`
3. **Firebase Project**: `aira-27a47` (or your project)
4. **API Keys**: OpenRouter, Mistral, or other AI provider

## 🔧 Step 1: Install Dependencies

### Install Firebase CLI (if not already installed)
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```

### Install Function Dependencies
```bash
cd functions
npm install
cd ..
```

## 🔑 Step 2: Configure Environment Variables

Firebase Functions use `firebase functions:config:set` for configuration. Set your API keys:

### Option A: OpenRouter (Recommended)
```bash
firebase functions:config:set openrouter.api_key="your_openrouter_api_key_here"
firebase functions:config:set openrouter.model="qwen/qwen-2.5-7b-instruct"
firebase functions:config:set ai.provider="openrouter"
firebase functions:config:set app.origin="https://aira-27a47.web.app"
```

### Option B: Mistral AI
```bash
firebase functions:config:set mistral.api_key="your_mistral_api_key_here"
firebase functions:config:set mistral.model="mistral-small-latest"
firebase functions:config:set ai.provider="mistral"
firebase functions:config:set app.origin="https://aira-27a47.web.app"
```

### Option C: Both (with fallback)
```bash
firebase functions:config:set openrouter.api_key="your_openrouter_api_key"
firebase functions:config:set mistral.api_key="your_mistral_api_key"
firebase functions:config:set ai.provider="openrouter"
firebase functions:config:set ai.doubt_resolution_model="llama"
firebase functions:config:set app.origin="https://aira-27a47.web.app"
```

### View Current Config
```bash
firebase functions:config:get
```

## 🏗️ Step 3: Build Frontend

```bash
# Clean previous build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Build for production
npm run build
```

## 🚀 Step 4: Deploy Everything

### Deploy All Services
```bash
firebase deploy
```

This will deploy:
- ✅ Firestore rules
- ✅ Storage rules
- ✅ Cloud Functions (backend API)
- ✅ Hosting (frontend)

### Deploy Individual Services

**Frontend only:**
```bash
firebase deploy --only hosting
```

**Backend only:**
```bash
firebase deploy --only functions
```

**Rules only:**
```bash
firebase deploy --only firestore:rules,storage:rules
```

## 🌐 Step 5: Update Frontend Configuration

After deployment, update the frontend to use the Firebase Functions URL:

### Option 1: Environment Variable (Recommended)

Create `.env.production` in the root:
```env
VITE_API_URL=https://us-central1-aira-27a47.cloudfunctions.net/api
```

Then rebuild:
```bash
npm run build
firebase deploy --only hosting
```

### Option 2: Update Code Directly

The frontend will automatically use the Firebase Functions URL if `VITE_API_URL` is not set and the app is running on the Firebase domain.

## 📝 Step 6: Configure Firebase Services

### 1. Enable Required APIs

In [Firebase Console](https://console.firebase.google.com/project/aira-27a47):

- ✅ **Cloud Functions API** (should be enabled automatically)
- ✅ **Cloud Firestore API**
- ✅ **Firebase Storage API**
- ✅ **Firebase Authentication**

### 2. Configure Authentication

1. Go to **Authentication** → **Settings** → **Authorized domains**
2. Add your hosting URLs:
   - `aira-27a47.web.app`
   - `aira-27a47.firebaseapp.com`
   - Your custom domain (if any)

### 3. Initialize Storage (if not done)

1. Go to **Storage** in Firebase Console
2. Click **Get Started**
3. Choose **"Start in production mode"**
4. Select location (e.g., `us-central1`)

### 4. Set Up Firestore Indexes (if needed)

If you see index errors, create the required indexes:
1. Go to **Firestore** → **Indexes**
2. Click **Create Index**
3. Follow the error message to create the required index

## 🔍 Step 7: Verify Deployment

### Check Function URL
```bash
# Get function URL
firebase functions:config:get

# Test health endpoint
curl https://us-central1-aira-27a47.cloudfunctions.net/api/health
```

### Check Hosting URL
Your frontend will be available at:
- `https://aira-27a47.web.app`
- `https://aira-27a47.firebaseapp.com`

### Test in Browser
1. Open your hosting URL
2. Check browser console for errors
3. Test AI features (chat, doubt resolution, etc.)

## 📊 Monitoring

### View Function Logs
```bash
firebase functions:log
```

### View Function Logs in Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/aira-27a47/functions)
2. Click on your function
3. View logs and metrics

### View Hosting Analytics
1. Go to [Firebase Console](https://console.firebase.google.com/project/aira-27a47/hosting)
2. View usage statistics

## 🔄 Update Deployment

### Update Functions Only
```bash
cd functions
npm install  # if dependencies changed
cd ..
firebase deploy --only functions
```

### Update Frontend Only
```bash
npm run build
firebase deploy --only hosting
```

### Update Everything
```bash
npm run build
firebase deploy
```

## 🛠️ Troubleshooting

### Functions Deployment Fails

**Error: "Functions did not deploy"**
- Check that `functions/package.json` is valid
- Ensure all dependencies are installed: `cd functions && npm install`
- Check Node.js version (should be 18+)

**Error: "API key not found"**
- Set configuration: `firebase functions:config:set openrouter.api_key="your_key"`
- Redeploy: `firebase deploy --only functions`

### Frontend Can't Connect to Backend

**Error: "Network error" or "CORS error"**
- Verify function is deployed: `firebase functions:list`
- Check function URL in frontend `.env.production`
- Verify CORS configuration in `functions/src/index.ts`

**Error: "Function not found"**
- Check function name matches in `firebase.json` rewrites
- Verify function is deployed: `firebase functions:list`

### Authentication Issues

**Error: "Unauthorized domain"**
- Add your domain to **Authentication** → **Settings** → **Authorized domains**

### Storage Issues

**Error: "Storage not initialized"**
- Initialize Storage in Firebase Console
- See `STORAGE_SETUP.md` for details

## 📦 Production Checklist

- [ ] Firebase CLI installed and logged in
- [ ] All environment variables configured
- [ ] Functions dependencies installed
- [ ] Frontend built successfully
- [ ] Functions deployed successfully
- [ ] Hosting deployed successfully
- [ ] Firestore rules deployed
- [ ] Storage rules deployed
- [ ] Authentication domains configured
- [ ] Storage initialized
- [ ] Frontend API URL updated
- [ ] Health endpoint responding
- [ ] All features tested in production

## 🔐 Security Notes

1. **Never commit API keys** to version control
2. Use `firebase functions:config:set` for secrets
3. Review Firestore and Storage rules before deploying
4. Enable Firebase App Check for additional security
5. Monitor function logs for suspicious activity

## 📚 Additional Resources

- [Firebase Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Hosting Documentation](https://firebase.google.com/docs/hosting)
- [Firebase Console](https://console.firebase.google.com/project/aira-27a47)

## 🎉 Success!

Once deployed, your application will be available at:
- **Frontend**: https://aira-27a47.web.app
- **Backend API**: https://us-central1-aira-27a47.cloudfunctions.net/api

All AI features should work seamlessly in production!
