# AIra Deployment and Operations Guide

This guide ensures the AIra application is fully integrated, correctly configured, and reliably deployed on Firebase.

## Architecture Overview

- **Frontend**: React + Vite app (Hosting)
- **Backend/AI**: Express API (local) or Firebase Cloud Functions (production)
- **Data**: Firebase Firestore, Firebase Storage
- **Auth**: Firebase Authentication

## Prerequisites

1. **Node.js 18+** (required for Cloud Functions)
2. **Firebase CLI**: `npm install -g firebase-tools`
3. **Firebase project** with Blaze (pay-as-you-go) plan for Cloud Functions

## Project Alignment

**Important**: Ensure your Firebase project is consistent across configs:

- `.firebaserc` → `projects.default` (used by `firebase deploy`)
- `.env` → `VITE_FIREBASE_PROJECT_ID` (used by frontend for Auth, Firestore, Storage)
- Firebase Hosting site in `firebase.json` → typically matches project ID

If these differ, Auth tokens may fail verification. Use the same project for everything.

## Environment Setup

### 1. Root `.env` (AIra folder)

```env
# Local AI backend (Express on port 5000). Omit for production.
VITE_API_URL=http://localhost:5000

# AI Providers (required for Cloud Functions in production)
OPENROUTER_API_KEY=sk-or-v1-...
MISTRAL_API_KEY=...

# Firebase (required for Auth, Firestore, Storage)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...firebaseapp.com
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

### 2. Cloud Functions Environment

For production Cloud Functions, set secrets/config:

```bash
firebase functions:config:set openrouter.api_key="YOUR_OPENROUTER_KEY"
firebase functions:config:set mistral.api_key="YOUR_MISTRAL_KEY"
```

Or use Firebase Secrets (recommended):

```bash
firebase functions:secrets:set OPENROUTER_API_KEY
firebase functions:secrets:set MISTRAL_API_KEY
```

### 3. Backend `.env` (for local development)

Copy from root `.env` or symlink. The backend loads `../.env` automatically.

## API URL Resolution (Frontend)

The frontend automatically picks the correct API base URL:

| Environment | API Base |
|-------------|----------|
| localhost / 127.0.0.1 | `http://localhost:5000` |
| Firebase Hosting (*.web.app, *.firebaseapp.com) | Same origin (rewritten to Cloud Functions) |
| Other production | `https://us-central1-{projectId}.cloudfunctions.net/api` |

When on Firebase Hosting, `/api/*` and `/health` requests are rewritten to the `api` Cloud Function for reliable, CORS-free communication.

## Local Development

```bash
# From project root
npm run install:all    # Install frontend + backend deps
npm run dev:all        # Start frontend (5173) + backend (5000)
```

Or separately:

```bash
npm run dev            # Frontend only
npm run dev:backend    # Backend only (from AIra/ or project root)
```

## Production Deployment

```bash
cd AIra
npm run verify         # Pre-deployment checks
npm run build          # Build frontend
npm run deploy         # Deploy hosting + functions + rules
```

Or deploy individually:

```bash
npm run deploy:hosting   # Frontend only
npm run deploy:functions # Cloud Functions only
npm run deploy:rules     # Firestore + Storage rules
```

## Firestore Indexes

Composite indexes are defined in `firestore.indexes.json`. Deploy with:

```bash
firebase deploy --only firestore:indexes
```

Or as part of `npm run deploy:rules` if `firestore.indexes` is in `firebase.json`.

## Security Rules

- **Firestore**: User data is scoped by `userId`. All collections (profiles, sessions, doubts, notes, flashcards, mindmaps) require authentication.
- **Storage**: User content under `user-content/{userId}/` is owner-only.
- **Cloud Functions**: Optional auth (guests allowed with rate limiting). Authenticated users get Firebase ID token verification.

## Health Checks

- **Backend**: `GET /health` returns status, available models, limits.
- **Frontend**: AI health monitoring runs every 60s when the app loads.
- **Verification**: `npm run health-check` (from AIra folder) tests backend connectivity.

## Troubleshooting

### AI backend not reachable

- **Local**: Ensure `npm run dev:backend` is running on port 5000.
- **Production**: Verify Cloud Functions are deployed (`firebase deploy --only functions`). Check Firebase Console → Functions for logs and errors.

### CORS errors

- Ensure your hosting domain is in the Cloud Functions CORS allowed origins (see `functions/src/index.ts`).
- When using same-origin (Firebase Hosting rewrite), CORS is avoided.

### Auth / token errors

- Confirm `VITE_FIREBASE_PROJECT_ID` matches the Firebase project where Functions are deployed.
- Check that the user is signed in and the ID token is sent in the `Authorization: Bearer ...` header.

### Rate limiting

- Default: 30 requests per minute per user/guest. Adjust in `functions/src/index.ts` or backend `server.ts` if needed.

## All Panels and Features

| Panel | Features | Backend |
|-------|----------|---------|
| Chat | AI chat, content generation | AI API |
| Teaching | Doubt resolution, teaching content, quizzes | AI API |
| Studio | Notes, Mind maps, Flashcards | AI API + Firestore |
| Home | Dashboard, analytics | Firestore |
| Profile | Settings, learning preferences | Firestore |

All panels use Firestore for persistence and AI API for generation. Ensure both are configured and deployed for full functionality.
