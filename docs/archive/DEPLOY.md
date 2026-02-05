# Firebase Deployment Guide

This project is configured for **Firebase Hosting** (SPA). The build and config are ready; you only need a valid Firebase project and login.

**Production URLs (project `aira-27a47`):**
- **Hosting:** https://aira-27a47.web.app  
- **Console:** https://console.firebase.google.com/project/aira-27a47/overview  

---

## 1. Prerequisites

- **Node.js** (v18+ recommended)
- **Firebase CLI**: `npm install -g firebase-tools`
- A **Firebase project** (create one at [Firebase Console](https://console.firebase.google.com/) if needed)

---

## 2. One-time setup

### Log in to Firebase

```bash
firebase login
```

### Use your Firebase project

The app is currently set to project **`aira-27a47`** (see `.firebaserc`).

- **If that project exists** and you have access: no change needed.
- **If you use a different project**, set it:

```bash
firebase use YOUR_PROJECT_ID
```

Or edit `.firebaserc` and set `"default": "YOUR_PROJECT_ID"`.

### Initialize Firebase Storage (Required)

**Before deploying**, you must initialize Firebase Storage in the Firebase Console:

1. Go to: https://console.firebase.google.com/project/aira-27a47/storage
2. Click **"Get Started"**
3. Choose **"Start in production mode"**
4. Select a location (e.g., `us-central1`)
5. Click **"Done"**

**Note**: Without this step, `firebase deploy` will fail with "Firebase Storage has not been set up".  
See `STORAGE_SETUP.md` for detailed instructions.

---

## 3. Fresh build and deploy

From the **AIra** app root (this folder):

```bash
# Clean and build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
npm run build

# Deploy hosting only
firebase deploy --only hosting
```

On success you’ll see a **Hosting URL** (e.g. `https://aira-27a47.web.app`).

---

## 4. Environment variables (optional)

The app works without a `.env` file; it uses built-in defaults for the **aira-27a47** project.

To override Firebase config or the AI backend URL (e.g. for a different project or staging), create a `.env` file in the app root with any of:

```env
# Firebase (optional – defaults to aira-27a47)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=...

# AI backend (optional – defaults to http://localhost:5000)
VITE_API_URL=https://your-api.example.com
```

Then run `npm run build`; Vite bakes these into the bundle. Do not commit `.env` with real secrets; use CI env or Firebase config for production.

---

## 5. Config summary

| Item        | Value |
|------------|--------|
| Build output | `dist/` (Vite) |
| Hosting public | `dist` |
| SPA fallback | All routes → `/index.html` |
| JS/CSS cache | 1 year immutable |
| index.html  | No cache (always fresh) |

---

## 6. Login not working after deploy (required)

**Add your Hosting URL to Firebase Auth Authorized domains**, or Google/Apple sign-in will fail:

1. Open [Firebase Console](https://console.firebase.google.com/) → your project (**aira-27a47**).
2. Go to **Authentication** → **Settings** → **Authorized domains**.
3. Click **Add domain** and add your Hosting URL, e.g. **`aira-27a47.web.app`** (and `aira-27a47.firebaseapp.com` if not already there).
4. Save. Then try sign-in again on your live site.

Without this step, sign-in from the deployed app will show an "unauthorized domain" error.

---

## 7. Troubleshooting

| Error | Action |
|--------|--------|
| `Failed to get Firebase project` | Project missing or no access. Create/select project in Firebase Console and run `firebase use PROJECT_ID`. |
| `Permission denied` | Run `firebase login` and ensure your account has access to the project. |
| **`Firebase Storage has not been set up`** | **Initialize Storage first**: Go to [Firebase Console → Storage](https://console.firebase.google.com/project/aira-27a47/storage) and click "Get Started". See `STORAGE_SETUP.md` for details. |
| **Login / sign-in not working** | Add your Hosting URL (e.g. `aira-27a47.web.app`) to **Authentication → Settings → Authorized domains** in Firebase Console. |
| Build fails | Run `npm ci` then `npm run build`. |
| Blank page after deploy | Confirm `rewrites` in `firebase.json` send `**` to `/index.html`. |

---

## 8. Deploy scripts (package.json)

- `npm run deploy` — build + deploy hosting
- `npm run deploy:hosting` — deploy hosting only (uses existing `dist/`)
