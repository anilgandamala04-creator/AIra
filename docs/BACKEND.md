# Firebase as Core Backend

AIra uses **Firebase** as the single core backend for the entire application: authentication, database, storage, and supporting services (including the AI API via Cloud Functions).

## Overview

| Layer | Service | Usage |
|-------|---------|--------|
| **Authentication** | Firebase Auth | Google, Apple, Email/Password; session and ID tokens |
| **Database** | Cloud Firestore | Profiles, sessions, doubts, notes, flashcards, mind maps |
| **Storage** | Firebase Storage | User uploads under `user-content/{uid}/...` |
| **AI / API** | Firebase Cloud Functions | `ai-api` HTTP function (generate-content, resolve-doubt, teaching, quiz) |
| **Hosting** | Firebase Hosting | Static frontend (Vite build) |

All app data and identity flow through Firebase. There is no separate backend server required for production.

## Configuration

1. **Firebase project**  
   Create a project in [Firebase Console](https://console.firebase.google.com) and enable:
   - Authentication (e.g. Google, Email/Password)
   - Firestore Database
   - Storage
   - (Optional) Blaze plan for Cloud Functions

2. **Frontend env (`.env`)**  
   From Project Settings → General, add:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`  
   See `.env.example`.

3. **AI backend URL**  
   - **Production**: Leave `VITE_API_URL` unset; the app uses  
     `https://us-central1-<projectId>.cloudfunctions.net/ai-api`.
   - **Local dev**: Set `VITE_API_URL=http://localhost:5000` to use the optional Express server in `backend/`.

## Code Entry Points

- **Auth**: `src/lib/firebase.ts` (Auth, Firestore, Storage), `src/services/authService.ts`, `src/stores/authStore.ts`
- **Database / Storage**: `src/services/backendService.ts` (Firestore + Storage); used by stores and `useBackend` hooks
- **AI API**: `src/services/aiApi.ts` (calls Cloud Function or local backend); auth via Firebase ID token

## Deploy

From the `AIra` directory:

```bash
npm run build
npm run deploy           # verify + build + hosting + functions + firestore/storage rules
# Or separately:
npm run deploy:hosting   # Hosting
npm run deploy:functions # Cloud Functions (ai-api)
npm run deploy:rules     # Firestore + Storage security rules
```

Security rules are in `firestore.rules` and `storage.rules` and are deployed with the project.

## Local Development

- **Frontend**: `npm run dev` (Vite).
- **Firebase emulators** (optional): set `VITE_USE_FIREBASE_EMULATOR=true` and run Auth/Firestore/Storage emulators; see Firebase docs.
- **AI backend**: Either deploy the Cloud Function and use production URL, or run `npm run dev:backend` and set `VITE_API_URL=http://localhost:5000`.

Firebase remains the core backend in all environments; the local Express server is an optional stand-in for the AI Cloud Function during development.
