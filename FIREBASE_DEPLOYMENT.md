# Firebase Deployment Guide

This guide ensures the AIra application is fully deployed on Firebase with all services correctly configured.

## Prerequisites

- Node.js 18+
- Firebase CLI: `npm install -g firebase-tools`
- Firebase project with Blaze (pay-as-you-go) plan (required for Cloud Functions)
- AI API keys: [OpenRouter](https://openrouter.ai/keys), [Mistral](https://console.mistral.ai/) (optional)

## 1. Firebase Project Configuration

Ensure your `.firebaserc` points to the correct project:

```json
{"projects":{"default":"aira-education-c822b"}}
```

**Important**: The Firebase config in your frontend `.env` must match this project:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=aira-education-c822b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aira-education-c822b
VITE_FIREBASE_STORAGE_BUCKET=aira-education-c822b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

If you use a different project ID, update both `.firebaserc` and `.env` to be consistent.

## 2. Set AI API Keys for Cloud Functions

Cloud Functions need OpenRouter and Mistral API keys. Use Firebase Functions Config:

```bash
cd AIra

# Required for LLaMA/OpenRouter models
firebase functions:config:set openrouter.api_key="sk-or-v1-YOUR_OPENROUTER_KEY"

# Optional for Mistral models
firebase functions:config:set mistral.api_key="YOUR_MISTRAL_KEY"

# Optional overrides
firebase functions:config:set ai.provider="openrouter"
firebase functions:config:set ai.doubt_resolution_model="llama"
```

Verify config:

```bash
firebase functions:config:get
```

## 3. Build and Deploy

### One-command full deployment

```bash
cd AIra
npm install
npm run deploy
```

This runs verification, builds the frontend, and deploys hosting, functions, Firestore rules, and Storage rules.

### Step-by-step deployment

```bash
cd AIra

# 1. Verify configuration
npm run verify

# 2. Build frontend
npm run build

# 3. Deploy all services
npm run deploy:hosting   # Frontend
npm run deploy:functions # AI backend (Cloud Functions)
npm run deploy:rules     # Firestore + Storage rules
```

## 4. Deployed Services

| Service | Purpose |
|---------|---------|
| **Hosting** | Serves the React app; rewrites `/api/**` and `/health` to Cloud Functions |
| **Cloud Functions** | AI API (`/api/resolve-doubt`, `/api/generate-content`, `/api/classify-chat`, `/api/generate-teaching-content`, `/api/generate-quiz`, `/health`) |
| **Firestore** | User profiles, sessions, doubts, notes, flashcards, mind maps |
| **Storage** | User-uploaded files under `user-content/{uid}/` |
| **Authentication** | Firebase Auth (Email/Password, Google, etc.) |

## 5. Enable Firebase Services

In [Firebase Console](https://console.firebase.google.com/):

1. **Authentication** → Sign-in method → Enable Email/Password (and optionally Google)
2. **Firestore** → Create database (if not exists) → Start in production mode
3. **Storage** → Get started (if not exists)

## 6. CORS and Hosting Domains

The Cloud Functions allow these origins:

- `https://aira-education-c822b.web.app`
- `https://aira-education-c822b.firebaseapp.com`
- `http://localhost:5173`, `http://localhost:5174`, etc.

For custom domains, set `ALLOWED_ORIGINS` in Functions config or add to the source.

## 7. Local Development

```bash
cd AIra
npm install
npm run dev          # Frontend (Vite on port 5173)
npm run dev:backend  # Local Express backend (port 5000)
# Or both: npm run dev:all
```

For local dev, the frontend uses `VITE_API_URL=http://localhost:5000` from `.env` to talk to the local backend. On Firebase Hosting, it uses same-origin (API via rewrites).

## 8. Verification

After deployment:

1. Open your app: `https://aira-education-c822b.web.app`
2. Log in or sign up
3. Complete onboarding
4. Test Chat panel: send a message (uses `/api/classify-chat` and `/api/generate-content`)
5. Test Teaching panel: ask a doubt (uses `/api/resolve-doubt`)
6. Test Studio panel: generate notes/flashcards/quiz (uses `/api/generate-*`)

Health check:

```bash
curl https://aira-education-c822b.web.app/health
```

Expected response: `{"status":"ok","provider":"openrouter","models":{...}}`

## 9. Troubleshooting

### AI returns "not configured" or 500

- Ensure `firebase functions:config:set openrouter.api_key="..."` was run
- Redeploy functions: `npm run deploy:functions`
- Check logs: `firebase functions:log`

### CORS errors

- Confirm your app URL is in the allowed origins list in `functions/src/index.ts`
- Ensure you're using the correct Firebase Hosting URL, not a custom domain, unless added

### Firestore permission denied

- Deploy rules: `firebase deploy --only firestore`
- Ensure the user is authenticated when accessing protected collections

### Build fails

- Run `npm run verify` to see which checks fail
- Ensure `dist/` exists after `npm run build`
