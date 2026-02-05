# Feature Verification Guide

This document lists every application feature, how it is wired, and how to verify it works correctly.

**Last updated:** February 5, 2026

---

## Automated Verification (Run These First)

| Check | Command | Expected |
|-------|---------|----------|
| TypeScript | `npm run build` (includes `tsc -b`) | Exit 0, no type errors |
| Lint | `npm run lint` | Exit 0, no errors (backend/functions/flutter_app are ignored) |
| Build | `npm run build` | `dist/` produced, no build errors |

These confirm the main app (`src/`) compiles and passes lint. Backend and Firebase Functions code are not part of the main app build.

---

## Feature Inventory and Verification

### 1. Authentication

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Login (Google)** | `LoginPage`, `authStore.loginWithGoogle`, `authService` → Firebase | Sign in with Google; redirect to onboarding (new user) or `getDefaultRedirectPath()` (returning user). Header shows user avatar. |
| **Login (Email/Password)** | `authStore.loginWithEmail`, `authService.signInWithEmail` | Enter email/password; same redirect behavior as Google. |
| **Sign up (Email)** | `authStore.signUpWithEmail`, `authService.signUpWithEmail` | Sign up; redirect to onboarding. |
| **Guest / Demo** | `authStore.continueAsGuest`, `authStore.skipToDemo` | Continue as guest or skip to demo; access protected routes without Firebase user. |
| **Logout** | `authStore.logout`, `authService.signOutUser` | Log out; redirect to `/login`; user store and profile cleared via `resetOnboarding`. |
| **Password reset** | `authService.sendPasswordReset` | Request reset; check email (Firebase sends email). |
| **Auth state persistence** | `authStore` + `initAuthListener` in `App.tsx`, Firebase `onAuthStateChange` | Refresh page while logged in; user remains authenticated. |
| **Protected routes** | `ProtectedRoute` in `App.tsx` | Unauthenticated access to `/curriculum`, `/learn`, etc. redirects to `/login`. |

**Data flow:** Firebase Auth → `initAuthListener` → auth store → `useAuthStore`. Login success events drive navigation in `LoginPage`.

---

### 2. Onboarding

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Profession / Sub-profession / Subject / Topic** | `OnboardingPage`, `userStore` (profile), `professions` data | Complete onboarding steps; profile gets `profession`, `subProfession`, `subject`, `currentTopic`. |
| **Learning style quiz** | `LearningStyleQuiz` in onboarding | Complete quiz; result stored in profile. |
| **Redirect after onboarding** | `ProtectedRoute` + `DefaultRedirect` | When onboarding complete, redirect to `/learn/{currentTopic}`. |
| **Enforcement** | `ProtectedRoute` (`needsOnboarding`) | Visiting `/curriculum` or `/learn` without completing onboarding redirects to `/onboarding`. |

**Data flow:** Onboarding updates `userStore` (and optionally syncs to Firebase via `backendService`). `ProtectedRoute` reads `useUserStore` profile and `onboardingStep`.

---

### 3. Curriculum

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Browse professions / subjects / topics** | `CurriculumPage`, `professions`, `courseRegistry` | Open `/curriculum`; select profession → sub-profession → subject; see topics. |
| **Start topic** | Navigation to `/learn/:topicId` | Click topic; navigate to Teaching page with that `topicId`. |
| **Topic progress** | Sessions/analytics (Firebase or local) | Progress reflected in curriculum when available. |

**Data flow:** `CurriculumPage` uses `userStore` (selected profession/sub-profession), `professions`, `getCourseContent` from `courseRegistry`.

---

### 4. Teaching (Main OS Screen)

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Load topic content** | `TeachingPage`, `getCourseContent`, `courseRegistry`, topic visuals | Open `/learn/{topicId}`; teaching steps and topic visual load. |
| **Teaching steps** | `teachingStore`, `useTeachingStore`, step navigation | Next/previous step; progress and step indicator update. |
| **Chat with AI** | `generateChatResponse`, `contextualAI`, `aiApi` (Firebase Cloud Functions) | Send message in Chat panel; response appears in Chat; no layout overflow. |
| **Narration / TTS** | `narrateText`, `voice`, `useSpeechSync` | Enable narration; play step; speech plays; speaking state reflected. |
| **Doubt raising** | `doubtStore`, Doubt panel | Raise doubt; doubt appears in list; status updates. |
| **Doubt resolution (AI)** | `doubtStore.startResolvingDoubt`, `aiApi` | Resolve doubt; AI response; doubt status → resolved; retry on failure. |
| **Notes generation** | `resourceStore`, AI API | Generate notes; note appears in Studio Notes. |
| **Mind map generation** | `resourceStore`, AI API | Generate mind map; appears in Studio Mind Maps. |
| **Flashcards generation** | `resourceStore`, AI API | Generate flashcards; appear in Studio Flashcards. |
| **Verification quiz** | `VerificationQuiz`, `teachingStore` | Complete quiz; score and completion reflected. |
| **Panel toggles** | Teaching panel maximize/minimize, Studio open/minimize | Toggle panels; content preserved; no layout shift (see `VERIFICATION_CHECKLIST`). |

**Data flow:** `TeachingPage` uses `teachingStore`, `resourceStore`, `doubtStore`, `useBackend` (or store-level sync to Firebase). AI calls go through `aiApi` → Firebase Cloud Functions.

---

### 5. Studio (Notes, Mind Maps, Flashcards, Quiz)

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Notes viewer** | `NotesViewer`, `resourceStore.notes` | Open Studio → Notes; list and content match store. |
| **Mind map viewer** | `MindMapViewer`, `resourceStore.mindMaps` | Open Studio → Mind Maps; view/edit/download. |
| **Flashcard viewer** | `FlashcardViewer`, `resourceStore.flashcards` | Open Studio → Flashcards; flip cards; progress. |
| **Quiz viewer** | `QuizViewer` | Open Studio → Quiz; attempt quiz; results. |
| **Persistence** | `backendService` (saveNote, saveMindMap, saveFlashcards, etc.) | When authenticated (non-guest), data syncs to Firebase; reload shows same data. |

**Data flow:** `resourceStore` ↔ `backendService` (Firebase). Real-time sync via `useBackend` or store subscriptions.

---

### 6. Profile & Dashboard

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Profile panel** | `ProfileSettingsPanel`, `profilePanelStore` | Click profile avatar in header; panel opens (centered overlay). |
| **Dashboard view** | `DashboardView` inside Profile (or `DashboardPage` if routed) | Dashboard shows recommended topics, performance insights from `analyticsStore`. |
| **Profile data** | `userStore.profile`, Firestore | Profile fields match DB; updates sync to Firebase. |

**Data flow:** `useUserStore` + `useBackend` / `subscribeToUserData`; dashboard uses `teachingSessions`, `analyticsStore`, `profile`.

---

### 7. Settings

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Theme / Language / Accessibility** | `SettingsPage`, `settingsStore` | Change theme, language, reduce animations; UI updates; persisted (Firebase or local). |
| **Learning preferences** | Settings → Learning tab, `userStore.profile` | Edit profession/subject/topic when profile exists; "Complete onboarding first" when profile null. |
| **Persistence** | `settingsStore` → `backendService.updateUserSettings` | Settings sync to Firebase for authenticated user. |

**Data flow:** `settingsStore` ↔ `backendService.updateUserSettings`; `useSettingsStore` used across app.

---

### 8. Real-Time Sync

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Auth → user store** | `initAuthListener`, `useBackend` / `subscribeToUserData` | After login, profile and settings load from Firebase. |
| **Cross-store events** | `initRealTimeSync`, `realTimeEvents`, `EVENTS` | Login/logout, profile/settings/session/doubt/resource changes emit events; no stale UI. |
| **Firebase subscriptions** | `backendService` (subscribeToUserData, subscribeToDoubts, etc.) | Edit data in another tab or device; current tab updates. |

**Data flow:** `App.tsx` calls `initAuthListener()` and `initRealTimeSync()` on mount; cleanup on unmount.

---

### 9. AI Backend

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Base URL** | `aiApi.getBaseUrl()` | Uses `VITE_API_URL` or Firebase project ID to build URL: `https://us-central1-<projectId>.cloudfunctions.net/ai-api`. |
| **Auth headers** | `aiApi.getAuthHeaders()` | Sends `apikey` (anon key) and `Authorization: Bearer {session.access_token}` when logged in. |
| **Content generation** | `aiApi` + Edge Function `ai-api` | Generate content (teaching, notes, mind map, flashcards, doubt resolution); response in correct panel. |
| **Timeout / retry** | `aiApi` fetchWithRetry, Edge Function timeout | On failure or timeout; UI shows fallback/retry (per `FAILURE_RULES` in featureContracts). |
| **Health check** | `aiHealthCheck.startHealthMonitoring`, `initializeAI` in `App.tsx` | Console warning if AI backend not available; no silent freeze. |

**Data flow:** All AI requests from `src/` go through `aiApi.ts` → Firebase Cloud Function `functions/src/index.ts`. Deploy with `npm run deploy:functions` and set secrets in Firebase (e.g. OpenRouter/Mistral keys in Functions config).

---

### 10. Navigation & Routing

| Feature | Where | How to Verify |
|---------|--------|----------------|
| **Default redirect** | `DefaultRedirect`, `getDefaultRedirectPath` | `/` → login (if not authenticated) or onboarding (if incomplete) or `/learn/{currentTopic}`. |
| **Login redirect** | `LoginPage` + `getDefaultRedirectPath` | After login, redirect to onboarding or active session/curriculum. |
| **Profile route** | `/profile` → `Navigate to="/curriculum"` | `/profile` redirects to curriculum (dashboard only via Profile panel). |
| **404** | `path="*"` → `Navigate to="/login"` | Unknown path redirects to login. |

---

## Manual QA Checklist (High Level)

1. **Auth:** Google login → onboarding → curriculum → start topic → logout → login again → same user.
2. **Teaching:** Load topic → advance steps → send chat → raise doubt → resolve doubt → generate notes/mind map/flashcards → open Studio and confirm.
3. **Profile/Dashboard:** Open profile panel → see dashboard (recommended topics, performance) → close panel.
4. **Settings:** Change theme and language → refresh → settings persist.
5. **Responsiveness:** Resize to mobile/tablet; all essential actions reachable; no overlap (see `constants/verificationChecklist.ts` for full list).

---

## References

- **Detailed checklist:** `src/constants/verificationChecklist.ts` (`VERIFICATION_CHECKLIST`, `CHECKLIST_CATEGORIES`).
- **Feature contracts:** `src/constants/featureContracts.ts` (`FEATURE_WORKS_CRITERIA`, `FAILURE_RULES`, `AI_CORRECTNESS_RULES`).
- **Firebase setup:** `docs/AUTH_SETUP.md`, `SETUP_INSTRUCTIONS.md`, `.env` (Firebase config from `.env.example`).
