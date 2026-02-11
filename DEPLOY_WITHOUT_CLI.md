# Deploy with Firebase

The app uses **Firebase as the sole backend**: Hosting, Authentication, Firestore, Storage, and Cloud Functions (AI API). Supabase is not used.

## Prerequisites

- Firebase CLI: `npm install -g firebase-tools` (or use [Firebase Console](https://console.firebase.google.com))
- Firebase project linked: `.firebaserc` has `default` project (e.g. `airaedtech-48213`)

## Deploy

From the **repository root** (where `firebase.json` and `package.json` live):

```bash
npm run deploy
```

This builds the frontend and deploys **Hosting** and **Cloud Functions**. The Hosting rewrites `/api/**` and `/health` to the `api` Cloud Function, so the frontend uses the same origin in production.

Optional:

```bash
npm run deploy:hosting    # Frontend only
npm run deploy:functions # AI API (Cloud Functions) only
```

## Configuration

- **Frontend**: Firebase config is in `AIra/src/lib/firebase.ts` (or set `VITE_FIREBASE_*` in `AIra/.env`).
- **Production API**: No `VITE_API_URL` needed; the app uses same-origin and Firebase Hosting rewrites to the Cloud Function.
- **Functions secrets**: Set OpenRouter/Mistral keys in Firebase Console → Functions → api → Environment config / secrets.

## Hosting URL

After deploy: `https://<project-id>.web.app` (e.g. `https://airaedtech-48213.web.app`).
