# Feature Verification Guide

This document ensures **every feature**—including AI functionality and all panels (Chat, Teaching, Studio, Home, Profile)—works correctly, reliably, and as intended across all screens, user flows, and supported devices.

## 1. Routes and Access Control

| Route | Page | Protection | Purpose |
|-------|------|------------|---------|
| `/login` | LoginPage | Public | Auth (Google, Apple, Email, Guest) |
| `/onboarding` | OnboardingPage | Protected | Curriculum type → Board/Exam → Grade → Subject → Topic |
| `/curriculum` | CurriculumPage | Protected | Browse subjects, pick topic → `/learn/:topicId` |
| `/learn/:topicId?` | TeachingPage | Protected | Main OS: Chat + Teaching + Studio panels |
| `/settings` | SettingsPage | Protected | Account, Learning, Accessibility, AI, Privacy |
| `/profile` | — | Redirect | Redirects to `/curriculum` |
| `/` | DefaultRedirect | — | → `/login` or `/onboarding` or `/learn/:topicId` |
| `*` | — | — | → `/login` |

**Verification:** Unauthenticated access to any protected route redirects to `/login`. Incomplete onboarding redirects to `/onboarding`. Default `/` goes to login, onboarding, or `/learn/{currentTopic}` as appropriate.

---

## 2. Panels and Screens

### 2.1 Home (Curriculum)

- **Where:** Header “Home” on TeachingPage → `/curriculum`; also entry after onboarding.
- **Code:** `navigate('/curriculum')` in TeachingPage header; CurriculumPage.
- **Features:** Subject list by board/grade or exam, topic list per subject, search/filter, “Start” → `/learn/:topicId`, Switch course → onboarding, Settings, Profile (opens ProfileSettingsPanel).
- **Devices:** Responsive header; touch targets; layout at desktop/laptop/tablet/mobile per `featureContracts.ts` VIEWPORT_RANGES.

**Verify:** Home opens curriculum; subject/topic selection navigates to learn; back, switch, settings, profile work.

### 2.2 Chat Panel

- **Where:** Left panel on TeachingPage (desktop); mobile tab “Home” (first tab).
- **Code:** TeachingPage left column, `mobilePanel === 'home'`, chat state and `handleSendMessage` → `generateChatResponse` (contextualAI).
- **Features:** Send message (and optional files), typing indicator (`isWaitingForAI`), disabled input while waiting, fallback on AI/network error, backend-unavailable message with “npm run dev:backend”.
- **AI:** `contextualAI.generateChatResponse` → `aiApi.generateContent` (or backend); health check; `clearHealthCheckCache` on failure.

**Verify:** Message sends; loading state and response or clear error; no stuck “Waiting for response”; backend-off shows helpful message.

### 2.3 Teaching Panel

- **Where:** Center panel on TeachingPage (desktop); mobile tab “Teach”.
- **Code:** TeachingPage center column, `currentSession`, `currentStepData`, step navigation, TTS (narration), “Generate with AI”, “Raise Doubt”, “Next”/“Previous”.
- **Features:** Step display (“Step X of Y” clamped), lesson content (static or AI-generated), Start/Pause/Resume lesson, Next/Previous step, Raise Doubt (pauses and switches to Chat on mobile), Generate with AI (regenerates lesson).
- **AI:** Session init uses `getStaticCourse(topicId)` then fallback AI via `generateAiSession`; doubt resolution via doubtStore → `resolveDoubt` (aiApi).

**Verify:** Topic loads (static or AI); step nav and label correct; TTS and controls work; Raise Doubt opens Chat on mobile; Generate with AI shows loading then content or error.

### 2.4 Studio Panel

- **Where:** Right panel on TeachingPage (desktop); mobile tab “Studio”.
- **Code:** TeachingPage right column; tabs: Notes, Flashcards, Mind Map, Quiz, Summary; resourceStore (`generateNotes`, `generateMindMap`, `generateFlashcards`), quiz from quizService/aiApi.
- **Features:** Generate notes / mind map / flashcards from session content; take quiz; view summary. Loading flags cleared on success and in all error paths (see PERFORMANCE_AND_UX.md).
- **AI:** resourceStore calls `generateContent`; quiz uses `generateQuiz` (aiApi); fallbacks (e.g. mock notes) on network error.

**Verify:** Each studio action shows loading then result or error; no infinite loading; long content scrolls inside panel.

### 2.5 Profile Panel

- **Where:** Overlay opened from header (TeachingPage) or “PROFILE” on CurriculumPage via `useProfilePanelStore.open()`.
- **Code:** ProfileSettingsPanel (lazy in App.tsx); DashboardView embedded inside Profile.
- **Features:** User info, curriculum summary, “Dashboard” (embedded), “Curriculum” → `/curriculum`, Log out → `/login`. Focus trap and Escape to close.
- **Home vs Profile:** “Home” in header = Curriculum page. “Profile” = this overlay (no separate route; `/profile` redirects to `/curriculum`).

**Verify:** Profile opens as overlay; Dashboard and navigation work; logout clears state and redirects to login.

---

## 3. AI Functionality

| Feature | Entry | API / Store | Failure behavior |
|--------|--------|-------------|-------------------|
| Chat | Chat panel send | contextualAI.generateChatResponse → aiApi.generateContent | Fallback message + toast; `clearHealthCheckCache`; sync catch clears `isWaitingForAI` |
| AI lesson | Teaching “Generate with AI” / session init | contentGenerator.generateAiSession → aiApi.generateTeachingContent | Toast error; `setIsGeneratingAiLesson(false)` in finally |
| Doubt resolution | Doubt flow (e.g. via Chat or doubtStore) | aiApi.resolveDoubt | doubtStore handles response; UI shows resolution or error |
| Notes | Studio “Notes” | resourceStore.generateNotes → generateContent | Fallback mock on network error; `isGeneratingNotes` cleared in all branches |
| Mind map | Studio “Mind Map” | resourceStore.generateMindMap → generateContent | Same pattern |
| Flashcards | Studio “Flashcards” | resourceStore.generateFlashcards → generateContent | Same pattern |
| Quiz | Studio “Quiz” | handleGenerateQuiz → aiApi.generateQuiz | Toast + `setIsGeneratingQuiz(false)` in finally |

**Backend:** Optional Node backend (e.g. `npm run dev:backend`). If unreachable, chat and AI generation show clear message and retry guidance. Health check runs on an interval; cache cleared on connection errors (see INTEGRATION docs).

**Verify:** With backend off: all AI features show controlled fallback and no frozen UI. With backend on: chat, lesson, doubt, notes, mind map, flashcards, quiz complete or show explicit error.

---

## 4. User Flows (End-to-End)

1. **Login → Onboarding → Curriculum → Learn**
   - Login (any method) → if onboarding incomplete → OnboardingPage → complete steps → redirect to `/learn/:topicId` or curriculum.
   - From Curriculum, select subject/topic → `/learn/:topicId` → TeachingPage with session (static or AI).
2. **Learn screen**
   - Switch panels (Chat / Teach / Studio); on mobile use tabs. Home → Curriculum; Settings → SettingsPage; Profile → overlay.
   - In Chat: send message → response or error. In Teaching: play/pause, next/previous, raise doubt, generate with AI. In Studio: generate notes/mind map/flashcards, take quiz.
3. **Settings**
   - From header or Curriculum: change account, learning, accessibility, AI, privacy; export/import/reset.
4. **Logout**
   - Profile → Log out → redirect to login; state cleared.

**Verify:** Full flow from login to learn and back; no broken redirects; panel state and navigation consistent across viewports.

---

## 5. Supported Devices and Viewports

- **Desktop (≥1280px):** Three panels (Chat, Teaching, Studio) with header alignment per verificationChecklist (Home/Chat, Profile/Studio).
- **Laptop (1024–1279px):** Same layout; panels resizable/collapsible.
- **Tablet (768–1023px):** Layout adapts; no overlap; controls accessible.
- **Mobile (≤767px):** Single-panel view with tabs (Home = Chat, Teach, Studio); min touch target 44px; no dead space.

**Verify:** Resize across breakpoints; no layout jump or broken alignment; all actions reachable (see `verificationChecklist.ts` and `featureContracts.ts` VIEWPORT_RANGES).

---

## 6. Automated and Manual Checks

- **Script (from AIra folder):** `node scripts/verify-features.js`  
  Checks: backend health, AI models, presence of key feature files.
- **Build:** `npm run build` — must succeed.
- **TypeCheck:** `npx tsc --noEmit` — no type errors.
- **Manual checklist:** Use `src/constants/verificationChecklist.ts` (VERIFICATION_CHECKLIST) for QA: teaching/studio toggles, header alignment, resize, AI timeout/fallback, profile click, login/logout, etc. After running `node scripts/verify-features.js`, run the app and test UI flows against this checklist.

---

## 7. Summary Table

| Area | Working as intended when |
|------|---------------------------|
| **Login** | All auth methods work; redirect to onboarding or app; guest supported. |
| **Onboarding** | Linear flow; choices persisted; redirect to curriculum/learn. |
| **Home (Curriculum)** | Subjects/topics load; navigation to learn/settings/profile works. |
| **Chat** | Send/receive; loading and errors handled; backend-off message clear. |
| **Teaching** | Steps and session load; nav, TTS, doubt, “Generate with AI” work. |
| **Studio** | Notes, mind map, flashcards, quiz generate with clear loading/error. |
| **Profile** | Opens as overlay; dashboard and logout work. |
| **Settings** | All tabs save and apply; export/import/reset work. |
| **AI** | All AI features use backend when available; graceful fallback when not. |
| **Devices** | Layout and interactions correct at all VIEWPORT_RANGES. |

Running `node scripts/verify-features.js`, `npm run build`, and the manual verification checklist confirms that every feature works correctly, reliably, and as intended across screens, user flows, and supported devices.
