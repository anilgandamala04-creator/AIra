# AIra Feature Verification Checklist

Use this checklist to verify that every feature of the application works properly.

## Automated checks (run first)

From the **AIra** folder:

```powershell
cd "C:\Users\HP\Downloads\Project AIra\AIra"
npm run health-check
node scripts/verify-features.js
npm run build
npm run lint
```

- **health-check**: Backend reachability, AI models (LLaMA/Mistral). Optionally set VITE_API_URL.
- **verify-features**: Same env + backend, plus presence of key source files for all features.
- **build**: TypeScript and Vite build must complete without errors.
- **lint**: ESLint must pass (no errors).

Ensure the **backend is running** before health-check and verify-features (`cd backend && npm run dev`).

---

## 1. Authentication (Login)

| Step | Action | Expected |
|------|--------|----------|
| 1.1 | Open http://localhost:5173 | Redirect to /login if not authenticated |
| 1.2 | See Login page | Email/password form and optional Google sign-in |
| 1.3 | Sign in with email/password or Google | Redirect to /onboarding or /curriculum |
| 1.4 | Sign out (Profile/Settings or header) | Return to /login |

**Routes:** `/login`, `/` (redirects based on auth).

---

## 2. Onboarding

| Step | Action | Expected |
|------|--------|----------|
| 2.1 | After first login, land on /onboarding | Onboarding flow (professional mode, subject, topic, etc.) |
| 2.2 | Complete onboarding (select topic/path) | Redirect to /curriculum or /learn |
| 2.3 | Skip or complete learning style quiz if shown | Flow continues without errors |

**Routes:** `/onboarding`.

---

## 3. Curriculum

| Step | Action | Expected |
|------|--------|----------|
| 3.1 | Go to /curriculum | Curriculum browser with topics/learning paths |
| 3.2 | Click a topic/course | Topic detail or start learning |
| 3.3 | Start learning / “Learn” button | Navigate to /learn/:topicId |
| 3.4 | Header/nav: Curriculum link | Always navigates to /curriculum |

**Routes:** `/curriculum`.

---

## 4. Teaching (Learn) page

| Step | Action | Expected |
|------|--------|----------|
| 4.1 | Open /learn or /learn/:topicId | Teaching view with steps (intro, explain, quiz, etc.) |
| 4.2 | Progress through steps (Next/Back) | Steps advance; content and state persist |
| 4.3 | Trigger AI teaching content | Backend responds; content appears (no “backend unavailable”) |
| 4.4 | Open doubt/ask panel | Doubt UI opens |
| 4.5 | Ask a doubt (submit question) | AI resolution returned and shown |
| 4.6 | Verification quiz at end of lesson | Quiz loads; submit answers; feedback shown |
| 4.7 | Responsive: resize to mobile width | Layout adapts; buttons and text usable |

**Routes:** `/learn`, `/learn/:topicId`.  
**Backend:** `/api/generate-teaching-content`, `/api/resolve-doubt`, `/api/generate-quiz`.

---

## 5. Studio (Notes, Flashcards, Mind map, Quiz)

Studio is available from the Teaching page or layout (e.g. panel/sidebar).

| Step | Action | Expected |
|------|--------|----------|
| 5.1 | Open Studio / Notes | Notes viewer; option to generate notes with AI |
| 5.2 | Generate notes (if available) | AI generates notes; they display and can be saved |
| 5.3 | Open Flashcards | Flashcard viewer; generate or view existing cards |
| 5.4 | Open Mind map | Mind map viewer; generate or view |
| 5.5 | Open Quiz (studio quiz) | Quiz viewer; generate or take quiz |
| 5.6 | Save/sync to backend | No console errors; data persists in session (in-memory backend) |

**Backend:** `/api/generate-content` (and teaching/quiz as used by studio).

---

## 6. Settings

| Step | Action | Expected |
|------|--------|----------|
| 6.1 | Go to /settings | Settings page loads |
| 6.2 | Change language | UI language updates |
| 6.3 | Toggle accessibility (e.g. reduce motion) | Setting persists; UI respects it |
| 6.4 | Save or auto-save | No errors; changes reflected on next load |

**Routes:** `/settings`.

---

## 7. Profile & Dashboard

| Step | Action | Expected |
|------|--------|----------|
| 7.1 | Open Profile panel (header or menu) | Panel opens with profile/dashboard |
| 7.2 | View dashboard / stats | Dashboard view or embedded widget loads |
| 7.3 | Close panel | Panel closes; no layout break |

Dashboard is embedded in the Profile panel (no separate route).

---

## 8. Global behavior

| Step | Action | Expected |
|------|--------|----------|
| 8.1 | AI status indicator (if present) | Shows “Connected” when backend is up |
| 8.2 | Toasts (success/error) | Toasts appear and dismiss |
| 8.3 | Protected route: open /learn without login | Redirect to /login |
| 8.4 | 404 / unknown path | Redirect to /login or /curriculum as designed |
| 8.5 | Browser back/forward | Navigation and state consistent |

---

## Backend API summary

| Endpoint | Purpose | Used by |
|----------|---------|---------|
| GET /health | Backend + AI model status | health-check, verify-features, frontend health |
| POST /api/resolve-doubt | Doubt resolution | Teaching page doubt panel |
| POST /api/generate-content | Generic AI content | Studio (notes, etc.) |
| POST /api/generate-teaching-content | Teaching steps (accepts `topic`+context or full `prompt`) | Teaching page |
| POST /api/generate-quiz | Quiz generation | Teaching + Studio quiz |

Backend must be running on the URL set in `VITE_API_URL` (default http://localhost:5000). No auth token required.

For full **frontend–backend integration, configuration, timeouts, retries, and reliability**, see **docs/INTEGRATION_AND_RELIABILITY.md**.

---

## Quick verification command

After starting frontend and backend:

```powershell
cd "C:\Users\HP\Downloads\Project AIra\AIra"
npm run health-check
node scripts/verify-features.js
```

Then perform the manual steps above for the flows you care about (at least Login, Curriculum, Learn, one Studio feature, Settings).
