# Vercel Deployment Guide (Spark Plan Compatible)

Use this guide to deploy the AI backend on Vercel while keeping Firebase on the **Spark (free) plan**. Firebase Cloud Functions require Blaze; Vercel Serverless works on the free tier.

## Architecture

- **Frontend**: Firebase Hosting (Spark) or Vercel
- **AI API**: Vercel Serverless Functions (`/api/*`, `/health`)
- **Auth, DB, Storage**: Firebase (Spark)

## Prerequisites

- Node.js 18+
- Vercel account: https://vercel.com
- Firebase project (Spark plan) for Auth, Firestore, Storage

## 1. Install Dependencies

```bash
cd AIra
npm install openai @mistralai/mistralai @vercel/node --save
```

## 2. Set Environment Variables in Vercel

In Vercel Dashboard → Project → Settings → Environment Variables, add:

| Name | Value | Notes |
|------|-------|-------|
| `OPENROUTER_API_KEY` | `sk-or-v1-...` | Required for LLaMA |
| `MISTRAL_API_KEY` | `...` | Optional for Mistral |
| `APP_ORIGIN` | `https://airaedtech.web.app` | Or your frontend URL |

## 3. Deploy to Vercel

### Option A: Full app on Vercel (frontend + API)

Deploy the whole project. Vercel will build the frontend and serve API routes:

```bash
cd AIra
npx vercel
```

Follow prompts. Your app will be at `https://your-project.vercel.app`.

### Option B: API only on Vercel, frontend on Firebase

1. Deploy API to Vercel:
   ```bash
   cd AIra
   npx vercel --prod
   ```
2. Note your Vercel URL (e.g. `https://aira-api.vercel.app`).
3. When building the frontend for Firebase, set:
   ```env
   VITE_API_URL=https://aira-api.vercel.app
   ```
4. Build and deploy to Firebase:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## 4. API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check, model availability |
| `/api/resolve-doubt` | POST | Teaching panel doubt resolution |
| `/api/generate-content` | POST | Chat, notes, mind maps |
| `/api/classify-chat` | POST | Dual-mode chat classification |
| `/api/generate-teaching-content` | POST | Lesson generation |
| `/api/generate-quiz` | POST | Quiz generation |

## 5. Timeout Note

Vercel **Hobby (free)** limits serverless functions to **10 seconds**. AI calls can exceed this. Options:

- **Vercel Pro** ($20/mo): 60s timeout (configured in `vercel.json`)
- **Shorter prompts** or faster models may complete within 10s on Hobby

## 6. CORS

The API allows requests from Firebase Hosting domains and `localhost`. To add more origins, edit `api/lib/cors.ts`.

## 7. Verify

After deployment:

```bash
curl https://your-app.vercel.app/health
```

Expected: `{"status":"ok","models":{"llama":true,"mistral":true},...}`
