# Deploy with Firebase

The app uses **Firebase** for hosting and AI backend (Cloud Functions). No Supabase CLI is required.

## Prerequisites

- Firebase CLI: `npm install -g firebase-tools` (or use [Firebase Console](https://console.firebase.google.com) for hosting)
- Firebase project linked: `firebase use <project-id>` or `.firebaserc` configured

## Deploy

From the `AIra` directory:

```bash
npm run build
npm run deploy:hosting   # Frontend → Firebase Hosting
npm run deploy:functions # AI API → Cloud Functions (requires functions in firebase.json)
```

Or in one step:

```bash
npm run deploy
```

## Configuration

- **Frontend**: Set Firebase config in `.env` (see `.env.example`: `VITE_FIREBASE_*`).
- **AI backend**: For production, either set `VITE_API_URL` to your Cloud Function URL or rely on auto URL: `https://us-central1-<projectId>.cloudfunctions.net/ai-api`.
- **Functions secrets**: Set OpenRouter/Mistral keys in Firebase Console → Functions → your function → Environment config / secrets.

## Hosting URL

After deploy: `https://<your-site>.web.app` or the URL shown in Firebase Console → Hosting.
