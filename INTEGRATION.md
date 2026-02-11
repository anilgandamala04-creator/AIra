# AIra – Frontend, Backend & AI Integration

This document describes how the frontend, Firebase backend (auth, Firestore, storage), and optional AI server are wired so all features work reliably.

## Quick Start: Run Everything

From the **AIra** project root (where `package.json` and `backend/` live):

```bash
npm run dev:all
```

- **Frontend**: Vite dev server at `http://localhost:5173` (or 5174–5176 if 5173 is busy).
- **AI backend**: Express server at `http://localhost:5000` (optional).

In development, the frontend proxies `/api` and `/health` to the AI backend, so you do **not** need to set `VITE_API_URL` when both run locally.

## Architecture Overview

| Layer | Role |
|-------|------|
| **Frontend** (Vite + React) | UI, auth, user/session state; uses Firebase for auth, Firestore, storage; calls optional AI backend |
| **Firebase** | Sole backend: Auth, Firestore (profiles, teaching_sessions, doubts, notes, flashcards, mind_maps), Storage (user-files) |
| **AI backend** (Express, optional) | LLaMA/Mistral via OpenRouter or Mistral API; endpoints: `/health`, `/api/generate-content`, `/api/resolve-doubt`, `/api/generate-teaching-content`, `/api/generate-quiz` |

All panels (Chat, Teaching, Studio, Home, Profile) use Firebase for persistence. When Firebase env is not set, the app uses in-memory fallbacks so it still runs (guest/demo).

## Frontend Configuration

### Environment (`.env` in AIra root)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Yes (for persistence) | From Firebase Console → Project settings → General → Your apps |
| `VITE_FIREBASE_AUTH_DOMAIN` | Yes | e.g. `your-project-id.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Yes | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Yes | e.g. `your-project-id.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | No | From Firebase Console |
| `VITE_FIREBASE_APP_ID` | Yes | From Firebase Console |
| `VITE_API_URL` | No in dev | Override AI backend URL. Leave unset in dev to use same-origin proxy to `localhost:5000`. |

When `VITE_API_URL` is unset in development, the frontend uses the current origin and Vite proxies `/api` and `/health` to the AI backend.

## AI Backend Configuration (Optional)

See `backend/` for Express AI server. Environment (`backend/.env`): `PORT`, `AI_PROVIDER`, `OPENROUTER_API_KEY`, `MISTRAL_API_KEY`, `OLLAMA_BASE_URL`, `FRONTEND_URL` (CORS).

## Panels and Data Sources

| Panel | Backend / AI usage |
|-------|--------------------|
| **Home** | Firebase (user/profile); in-memory fallback if Firebase not configured |
| **Profile** | Firebase (profile, settings) |
| **Chat** | AI backend (optional) |
| **Teaching** | AI backend (optional) + Firebase (sessions) |
| **Studio** | AI backend (optional) + Firebase (notes, mind maps, flashcards) |

## Production Checklist

1. Set **frontend** `.env`: all `VITE_FIREBASE_*` from Firebase Console; `VITE_API_URL` = deployed AI backend URL if used.
2. Deploy frontend to **Firebase Hosting**: from project root run `npm run build` then `npm run deploy` (or `npx firebase deploy --only hosting`).
3. Configure Firebase Auth sign-in methods and authorized domains (Firebase Console → Authentication).
4. Deploy Firestore indexes if needed: `firebase deploy --only firestore:indexes` (from project root; indexes in `AIra/firestore.indexes.json` can be deployed via Firebase Console or CLI).
