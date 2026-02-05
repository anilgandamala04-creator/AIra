# How to Run and Open the App

## Option 1: Frontend only (quick test)

1. **Close any other terminals** that are running `npm run dev` or `npm run dev:all` (so the port is free).
2. Open a terminal in the **AIra** folder:
   ```powershell
   cd "C:\Users\HP\Downloads\Project AIra\AIra"
   npm run dev
   ```
3. Wait until you see **"VITE ... ready"** and the line **"Open in browser: http://localhost:XXXX"**.
   - The app will try to **open your default browser automatically**.
   - If it does **not** open, either:
     - **Copy the URL** from the terminal (e.g. `http://localhost:5173`) and paste it into your browser, or
     - In a **new terminal** (keep `npm run dev` running in the first), run:
       ```powershell
       cd "C:\Users\HP\Downloads\Project AIra\AIra"
       npm run open-app
       ```
       This opens http://localhost:5173. If your dev server is on a different port (e.g. 5174), open that URL manually in the browser.

## Option 2: Frontend + Backend (full app with AI)

1. Close any other terminals running the app.
2. From the **project root** (Project AIra folder):
   ```powershell
   cd "C:\Users\HP\Downloads\Project AIra"
   npm run dev:all
   ```
3. Wait until you see both:
   - `[front] ➜  Local:   http://localhost:XXXX/`  (note the port)
   - `[back] 🚀 AI Backend running on http://localhost:5000`
4. Open your browser at the **frontend** URL shown (e.g. http://localhost:5173 or the port shown).

**Quick check:** From the AIra folder run `npm run health-check` to verify .env and backend reachability (backend must be running for the API check).

## Environment and integration (stability)

- **Frontend (AIra/.env):** Set `VITE_API_URL=http://localhost:5000` and all `VITE_FIREBASE_*` from Firebase Console. Required for auth and Firestore.
- **Backend:** Loads **AIra/.env** for `OPENROUTER_API_KEY` and `MISTRAL_API_KEY`. Optionally create **backend/.env** with Firebase Admin for token verification; without it, backend runs as guest.
- **CORS:** Backend allows localhost/127.0.0.1 on ports 3000–3002 and 5173–5176, plus Firebase Hosting URLs.
- **Firestore:** Indexes in `firestore.indexes.json`; rules in `firestore.rules`. Deploy with `firebase deploy --only firestore`.

## If the app still doesn’t open

- **Blank page:** Open Developer Tools (F12) → Console tab and check for red errors.
- **Port in use:** Stop other Node processes or use the **next port** Vite suggests (e.g. 5174, 5175). Backend CORS allows 5173–5176.
- **Firewall:** Allow Node/JavaScript when prompted.
