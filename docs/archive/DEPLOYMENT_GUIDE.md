# Complete Deployment Guide

This guide ensures your application is fully integrated, correctly configured, and ready for deployment on Firebase.

## Prerequisites

1. **Firebase CLI installed**: `npm install -g firebase-tools`
2. **Firebase project initialized**: `firebase login` and `firebase init`
3. **Node.js 18+** installed
4. **All dependencies installed**: `npm install` (root and functions)

## Pre-Deployment Verification

Run the verification script to check all configurations:

```bash
npm run verify
```

This checks:
- ✅ Firebase configuration (firebase.json)
- ✅ Security rules (firestore.rules, storage.rules)
- ✅ Functions configuration
- ✅ Frontend build readiness
- ✅ AI integration setup
- ✅ Error handling components

## Environment Configuration

### Firebase Functions Environment Variables

Set these using Firebase CLI:

```bash
# Set OpenRouter API key (for LLaMA models)
firebase functions:config:set openrouter.api_key="your-openrouter-api-key"
firebase functions:config:set openrouter.model="qwen/qwen-2.5-7b-instruct"

# Set Mistral API key (optional, for Mistral models)
firebase functions:config:set mistral.api_key="your-mistral-api-key"
firebase functions:config:set mistral.model="mistral-small-latest"

# Set AI provider
firebase functions:config:set ai.provider="openrouter"
firebase functions:config:set ai.request_timeout_ms="60000"
```

### Frontend Environment Variables (Optional)

Create a `.env` file in the root directory (optional - defaults are provided):

```env
# Firebase Configuration (optional - defaults are in firebase.ts)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=aira-b2eb4.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aira-b2eb4
VITE_FIREBASE_STORAGE_BUCKET=aira-b2eb4.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=730991700515
VITE_FIREBASE_APP_ID=1:730991700515:web:10c2f03bb996ffe2b89f96
VITE_FIREBASE_MEASUREMENT_ID=G-C9WJGMJ3TT

# AI Backend URL (optional - auto-detects Firebase Functions in production)
VITE_API_URL=https://us-central1-aira-b2eb4.cloudfunctions.net/api
```

**Note**: The frontend automatically detects Firebase Functions URL in production, so `VITE_API_URL` is only needed for custom deployments.

## Build Process

### 1. Build Frontend

```bash
npm run build
```

This creates the `dist` directory with optimized production files.

### 2. Build Functions

```bash
cd functions
npm run build
cd ..
```

## Deployment Steps

### Option 1: Deploy Everything

```bash
npm run deploy:all
```

This:
1. Verifies configuration
2. Builds the frontend
3. Deploys hosting, functions, and security rules

### Option 2: Deploy Separately

```bash
# Deploy frontend only
npm run deploy:hosting

# Deploy functions only
npm run deploy:functions

# Deploy security rules only
npm run deploy:rules
```

## Post-Deployment Verification

### 1. Check Firebase Hosting

Visit your Firebase Hosting URL:
- `https://aira-b2eb4.web.app`
- `https://aira-b2eb4.firebaseapp.com`

### 2. Verify Functions

Check the Functions URL:
```bash
curl https://us-central1-aira-b2eb4.cloudfunctions.net/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-...",
  "provider": "openrouter",
  "models": {
    "llama": true,
    "mistral": false
  },
  "limits": {
    "maxPromptLength": 32000
  },
  "version": "1.0.0",
  "environment": "production"
}
```

### 3. Test AI Integration

1. Open the application
2. Check the AI status indicator (should show "AI Ready")
3. Try generating content in the Chat panel
4. Try resolving a doubt in the Teaching panel
5. Try generating a quiz in the Studio panel

### 4. Verify Error Handling

- All routes should have error boundaries
- Network errors should show user-friendly messages
- AI failures should gracefully degrade

## Troubleshooting

### Functions Not Deploying

1. Check Node.js version: `node --version` (should be 18+)
2. Build functions: `cd functions && npm run build`
3. Check Firebase config: `firebase functions:config:get`

### CORS Errors

If you see CORS errors:
1. Verify functions CORS configuration in `functions/src/index.ts`
2. Check allowed origins match your Firebase Hosting domain
3. Redeploy functions: `npm run deploy:functions`

### AI Backend Not Connecting

1. Check Functions health endpoint (see above)
2. Verify API keys are set: `firebase functions:config:get`
3. Check browser console for connection errors
4. Verify the Functions URL matches your project ID

### Build Errors

1. Run `npm install` in root and `functions` directories
2. Clear node_modules and reinstall if needed
3. Check TypeScript errors: `npm run build`
4. Verify all dependencies are compatible

## Monitoring

### Firebase Console

Monitor your deployment:
- **Hosting**: Firebase Console → Hosting
- **Functions**: Firebase Console → Functions
- **Firestore**: Firebase Console → Firestore
- **Storage**: Firebase Console → Storage

### Application Logs

- **Functions logs**: `firebase functions:log`
- **Browser console**: Check for client-side errors
- **Network tab**: Verify API requests are successful

## Security Checklist

- ✅ Firestore rules deployed
- ✅ Storage rules deployed
- ✅ Functions have proper CORS configuration
- ✅ API keys are stored in Firebase config (not in code)
- ✅ Authentication is required for protected routes
- ✅ User data is properly isolated

## Performance Optimization

1. **Frontend**: Already optimized with code splitting and lazy loading
2. **Functions**: Configured with 60s timeout and 512MB memory
3. **Caching**: Static assets cached for 1 year, HTML no-cache
4. **CDN**: Firebase Hosting uses global CDN automatically

## Continuous Deployment

For CI/CD integration:

```yaml
# Example GitHub Actions workflow
name: Deploy to Firebase
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: cd functions && npm install && cd ..
      - run: npm run deploy:all
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## Support

If you encounter issues:
1. Check the verification script output: `npm run verify`
2. Review Firebase Console for errors
3. Check browser console for client-side issues
4. Review function logs: `firebase functions:log`

## Success Criteria

Your deployment is successful when:
- ✅ All verification checks pass
- ✅ Application loads without errors
- ✅ AI backend health check returns "ok"
- ✅ All panels (Chat, Teaching, Studio, Home, Profile) work correctly
- ✅ Authentication works
- ✅ Real-time sync works
- ✅ No console errors
- ✅ No network errors

---

**Last Updated**: 2024
**Project**: AIra - AI-Powered Learning Platform
