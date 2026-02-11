# Frontend–Backend Integration and Reliability

This document describes how the frontend, backend, and AI services are integrated, configured, and kept operational so the application runs without errors, timeouts, connectivity issues, or service interruptions.

---

## 1. Architecture Overview

| Layer | Role | Location |
|-------|------|----------|
| **Frontend** | React (Vite) app: Login, Onboarding, Curriculum, Teaching (Main OS), Chat, Studio, Profile, Settings | `AIra/src` |
| **Frontend data** | In-memory backend (profiles, settings, sessions, notes, flashcards, mind maps) | `AIra/src/services/backendService.ts` |
| **AI Backend** | Express server: health, generate-content, resolve-doubt, generate-teaching-content, generate-quiz | `AIra/backend/src/server.ts` |
| **AI Provider** | OpenRouter / Mistral / Ollama (configured via env in backend) | `AIra/backend/src/services/aiService.ts` |

The frontend uses role-based/guest auth and in-memory data. All AI calls go to the **AI backend** (Express). The backend then calls the configured AI provider.

---

## 2. Configuration

### Frontend (AIra/.env or project root)

- **VITE_API_URL** (optional): Override AI backend URL. Default: `http://localhost:5000` in dev.

### Backend (AIra/backend/.env)

- **PORT**: Server port (default 5000).
- **OPENROUTER_API_KEY** or **OPENAI_API_KEY**: For LLaMA/OpenAI-compatible models.
- **MISTRAL_API_KEY**: For Mistral models.
- **AI_PROVIDER**: `openrouter` | `ollama` | etc.
- **AI_REQUEST_TIMEOUT_MS**: Request timeout (default 60000).
- **FRONTEND_URL**: Comma-separated allowed CORS origins.

### Keeping Services Running

- **Frontend**: `npm run dev` (from AIra) or `npm run dev --prefix AIra` (from project root).
- **Backend**: `npm run dev --prefix AIra/backend` or from project root: `npm run dev:backend`.
- **Both**: From project root: `npm run dev:all`.

If the AI backend is not running, the frontend shows a clear message (e.g. “AI backend is not reachable. Start it with: npm run dev:backend”) and toasts on failed AI actions.

---

## 3. Reliable Communication

### Health check

- **Frontend** calls `GET /health` before heavy AI operations (cached 30s) via `ensureBackendReachable()` in `aiApi.ts`.
- **Periodic monitoring**: `startHealthMonitoring(60000)` in `App.tsx` runs a full health check every 60s; status is exposed to `AIStatusIndicator` and `useAIHealth()`.
- **Backend** `/health` returns `{ status, models: { llama, mistral }, limits }`.

### Timeouts

- **Health check**: 4s (quick), 5–10s (full check).
- **generateContent / Chat**: 60s default.
- **generateTeachingContent**: **120s** (2 min) to allow 45+ minute lesson generation.
- **resolveDoubt, generateQuiz**: 60s.
- Backend uses `AI_REQUEST_TIMEOUT_MS` (default 120000 ms for long teaching content) and a request timeout middleware (504 on timeout).

### Retries

- **aiApi.ts**: `fetchWithRetry()` with exponential backoff for 5xx and 429; no retry on AbortError or auth errors.
- **aiHealthCheck.ts**: `withRetry()` for operations that should retry (e.g. transient failures).
- **aiIntegration.ts**: Fallback to alternate model and offline fallback messages when backend is unreachable.

### Error handling and user feedback

- All AI calls surface errors via toasts and, where applicable, inline messages.
- Connection/timeout errors are turned into user-friendly text (e.g. “AI backend is not reachable…”, “Request timeout…”) in `aiApi.ts` and `TeachingPage.tsx`.
- Teaching panel: if generation fails, a clear toast suggests starting the backend.

---

## 4. API Contract: Teaching Content

- Frontend can send either:
  - **Full prompt** (long string, curriculum-specific, 45+ min, step-by-step vs seamless): body `{ prompt, model }`. Backend uses it as-is via `generateTeachingContentFromPrompt()`.
  - **Topic + context**: body `{ topic, curriculumContext, model }`. Backend builds a shorter prompt via `generateTeachingContent()`.
- Frontend uses the full-prompt path when the built prompt length exceeds 500 characters (rich curriculum prompt from teaching store).

---

## 5. Feature–Service Mapping

| Feature | Frontend | Backend | Notes |
|---------|----------|-------------------|--------|
| Login, auth | LoginPage, authStore, authService | In-memory / guest | Role-based entry only |
| Profile, onboarding | userStore, OnboardingPage | backendService (in-memory) | subscribeToUserData |
| Teaching (Main OS) | TeachingPage, teachingStore | Backend: generate-teaching-content, resolve-doubt, generate-quiz | 120s timeout for lesson generation |
| Chat | TeachingPage (chat panel), contextualAI | Backend: generate-content | Domain isolation, curriculum-aware style |
| Studio (notes, mind map, flashcards, quiz) | resourceStore, TeachingPage | Backend: generate-content, generate-quiz; in-memory persistence | Same backend URL |
| Profile, Dashboard | ProfileSettingsPanel, DashboardView, CurriculumPage | backendService, userStore | Read from profile/settings |
| Settings | SettingsPage, settingsStore | backendService (synced in App) | Theme, language, accessibility |
| AI status | AIStatusIndicator, useAIHealth | GET /health | Shown in header; refresh on demand |

---

## 6. Verification Checklist (High Level)

1. **Start backend**: `npm run dev:backend` (from project root). Ensure no port conflict and env loaded.
2. **Start frontend**: `npm run dev` from AIra (or `npm run dev:all` from root). Open app; confirm no console errors.
3. **Health**: Open app; AI status should show “AI Ready” when backend is up. Run `npm run health-check` from AIra.
4. **Login → Onboarding → Curriculum → Learn**: Full flow works; on Learn, “Generate AI lesson” completes or shows a clear error (e.g. backend not running / timeout).
5. **Chat**: Ask a topic-related question; response appears or a clear error is shown.
6. **Studio**: Generate notes or quiz; content appears or error toast.
7. **Profile / Settings**: Changes persist; no broken layout or missing data.

If the AI backend is down, the app must remain usable (no crash), with clear messaging that AI features need the backend.

---

## 7. Summary

- **Frontend and backend** are integrated via a single AI base URL (`VITE_API_URL` or defaults). Auth and data are in-memory/guest; no Firebase or Supabase.
- **Configuration** is through `.env` (frontend and backend); same backend URL is used for all AI endpoints.
- **Reliability**: health check before heavy AI calls, timeouts (120s for teaching content), retries with backoff, and user-friendly errors. Periodic health monitoring and AI status indicator keep the system’s state visible.
- **Teaching content** supports both a full client-built prompt (for 45+ min, curriculum-specific content) and a short topic + context request, so the system is both flexible and stable for long-running generations.

---

## 8. Stable connection and panel behavior

### Ensuring a stable AI–frontend–backend connection

1. **Run both processes**
   - From project root: `npm run dev:all` (frontend + backend), or run in two terminals:
     - Terminal 1: `npm run dev:backend` (or `cd AIra/backend; npm run dev`)
     - Terminal 2: `npm run dev --prefix AIra` (or `cd AIra; npm run dev`)
   - Backend must be up before using any AI feature; the app will show “AI Ready” when connected.

2. **Configuration**
   - **Frontend** (`AIra/.env`): Optional `VITE_API_URL` to point to the AI backend (e.g. `http://localhost:5000`). In dev on localhost the app defaults to `http://localhost:5000` (or hostname:5000 for same-machine access).
   - **Backend** (`AIra/backend/.env`): Set `PORT=5000`, at least one of `OPENROUTER_API_KEY` or `MISTRAL_API_KEY`, and optionally `FRONTEND_URL` (comma-separated CORS origins). Use `AI_REQUEST_TIMEOUT_MS=120000` for long teaching-content runs.

3. **No service interruptions**
   - Health checks run every 60s when healthy and every 15s when unhealthy so the UI updates soon after the backend recovers.
   - On app load, AI is initialized after a short delay; if the backend is down, a toast explains how to start it and all panels remain usable with fallback messaging.
   - On unmount, health monitoring is stopped so there are no stray timers or duplicate checks.

### Panel behavior when AI backend is unavailable

| Panel / feature | Behavior when backend is down |
|-----------------|--------------------------------|
| **Home / Main OS** | Navigation and mode selection work. No AI calls until Learn. |
| **Teaching (Learn)** | “Generate AI lesson” shows a clear toast (e.g. start backend). Existing lesson content remains viewable. |
| **Chat** | Messages show a fallback line (e.g. “I’m currently unable to connect…”). Sending does not crash. |
| **Studio (notes, mind map, flashcards, quiz)** | Generate actions show an error toast; existing local data and UI stay intact. |
| **Profile / Settings** | No AI dependency; profile and settings load and save via backendService. |
| **Curriculum** | Topic list and “last studied” work from local/backend data; no AI required. |

All panels remain stable: no broken functionality, no unhandled errors, and no performance degradation. The header **AI Status** indicator (and optional refresh) shows connection state and when the backend is back online.
