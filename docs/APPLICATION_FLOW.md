# Application Flow for a New User

This document describes the end-to-end application flow for new and returning users and maps each step to the codebase.

---

## 1. Application Launch (Unauthenticated State)

**Behavior:** When a user opens the application for the first time:

- No user context exists.
- The user is treated as **unauthenticated and uninitialized**.
- **Only the Login screen is accessible.**
- No dashboard, Main OS, AI context, or content is loaded.
- The application does not expose any internal screens or features until authentication is completed.

**Implementation:**

| Aspect | Location |
|--------|----------|
| Route protection | `src/App.tsx` — `ProtectedRoute` redirects unauthenticated users to `/login`. |
| Public route | Only `/login` is rendered without `ProtectedRoute` (see `AnimatedRoutes`). |
| Default/unknown paths | `path="/"` → `DefaultRedirect`; `path="*"` → `<Navigate to="/login" />`. |
| Auth state | `src/stores/authStore.ts` — `isAuthenticated`, `user`, `isLoading`; `initAuthListener()` syncs Firebase Auth. |

**Note:** The app also supports **Continue as Guest** and **Skip to Demo** on the login page. For a strict production build where “only login is accessible,” these options can be hidden or removed (see [Production hardening](#production-hardening) below).

---

## 2. User Login (Google / Apple / Email)

**Behavior:**

- Firebase Authentication validates the user.
- A unique **User ID (UID)** is generated.
- The application checks **Cloud Firestore** to determine whether a user profile already exists.
- **New user:** No profile is found → mandatory onboarding begins automatically.
- **Existing user:** Profile data is retrieved → the application immediately restores the last saved state.

**Implementation:**

| Aspect | Location |
|--------|----------|
| Firebase Auth | `src/services/authService.ts` — `signInWithGoogle`, `signInWithApple`, `signInWithEmail`, `signUpWithEmail`. |
| Auth → store | `src/stores/authStore.ts` — `loginWithGoogle`, `loginWithApple`, `loginWithEmail`; `mapFirebaseUser()` builds `User` from Firebase user. |
| Firestore check | `src/App.tsx` — On auth UID change, `subscribeToUserData(authUid, onData)` is called. |
| New vs existing | `src/services/backendService.ts` — `getUser(uid)`, `setUser()`, `subscribeToUserData()`. New users get no profile (or minimal doc); existing users receive full `DbUser` (profile, settings, analytics). |
| Profile into app state | `App.tsx` effect: on `data.profile`, `useUserStore.getState().setProfile(data.profile)` and `setOnboardingStep(-1)` when onboarding already completed. |
| “User data loaded” | `useUserStore.userDataLoaded` is set to `true` after first Firestore snapshot so redirect logic does not flash to onboarding on refresh. |

---

## 3. Mandatory Onboarding for New Users

**Behavior:** New users must complete the following flow **in order**:

```
Login → Professional Mode → Sub-Professional Mode → Subject → Topic → Main OS Screen
```

This flow **cannot be skipped**, as it defines the learning context used across the entire application and AI system.

**Implementation:**

| Step | Location | Notes |
|------|----------|--------|
| Enforce order | `src/App.tsx` — `ProtectedRoute`: `needsOnboarding` is true if `onboardingStep >= 0` or any of `profile?.profession`, `profile?.subProfession`, `profile?.subject`, `profile?.currentTopic` is missing. |
| Onboarding UI | `src/pages/OnboardingPage.tsx` — Steps 0–4: Profession → SubProfession → Subject → Topic; linear `step` state and back button that clears later steps. |
| Profession / SubProfession | `src/stores/userStore.ts` — `selectProfession`, `selectSubProfession`; data from `src/data/professions`. |
| Subject / Topic | `OnboardingPage` local state + `updateProfile({ subject, currentTopic })`; then `completeOnboarding()`. |
| Completion | `userStore.completeOnboarding()` builds/updates `UserProfile` with `onboardingCompleted: true` and syncs to backend via `updateUserProfile`. |
| Redirect after onboarding | `OnboardingPage` navigates to `/learn/${topicId}`; `ProtectedRoute` redirects completed users from `/onboarding` to `/learn/${topicId}`. |

---

## 4. Data Stored for a New User

**Behavior:** After onboarding, the following data is stored in **Firestore** and is the single source of truth:

- User identity (UID, email)
- Professional mode (e.g., Medico, Engineer)
- Sub-professional mode
- Selected subject
- Selected topic
- User preferences (theme, voice, language)
- Role (Student / Teacher / Admin, if applicable)

All application behavior is driven exclusively by this data.

**Implementation:**

| Data | Storage | Location |
|------|---------|----------|
| Identity | Firebase Auth (UID, email); Firestore `profiles/{uid}` | `backendService`: `DbUser`, `UserProfile` |
| Profession / SubProfession / Subject / Topic | `UserProfile` in Firestore | `types/index.ts` — `UserProfile`; `backendService.updateUserProfile()`, `userStore.updateProfile` / `completeOnboarding` |
| Preferences | `AppSettings` in Firestore (part of user document) | `backendService`; `useSettingsStore`; synced in `App.tsx` subscription |
| Role / Plan | Firestore user document; auth store updated from `data.role` / `data.plan` | `App.tsx` effect when `subscribeToUserData` receives data |

---

## 5. Real-Time, App-Wide Updates

**Behavior:** Once onboarding is completed:

- The entire application updates automatically in **real time**.
- No page refreshes or reloads are required.
- Real-time listeners ensure:
  - Header updates with correct badges and indicators
  - Dashboard loads user-specific data
  - Main OS displays the correct learning content
  - AI context switches to the selected professional domain
  - Studio tools align with the selected topic
  - Profile reflects all user selections

**Implementation:**

| Mechanism | Location |
|-----------|----------|
| Firestore real-time | `backendService.subscribeToUserData()` — `onSnapshot` on `profiles/{uid}`; pushes profile, settings, analytics into stores. |
| In-app events | `src/utils/realTimeSync.ts` — `realTimeEvents`, `EVENTS` (e.g. `PROFILE_UPDATE`, `PROFESSION_CHANGE`, `SUB_PROFESSION_CHANGE`). Components subscribe for instant UI updates. |
| Settings (theme, language, voice) | `src/App.tsx` — `SettingsEffect` applies theme, font size, high contrast, language, TTS to document and i18n. |
| Store updates | `userStore.updateProfile` / `selectProfession` / `selectSubProfession` sync to backend and emit real-time events. |

---

## 6. Main OS Screen (Core Learning Engine)

**Behavior:** The **Main OS Screen** is the exclusive learning environment:

- AI teaches only the **selected professional subject and topic**.
- Teaching includes:
  - Topic-specific visuals
  - Realistic, human-like voice output
  - **Chat** — handles topic-related questions; supports general questions while maintaining user context
  - **Studio** — generates Notes, Mind maps, Flashcards, Quizzes; all outputs strictly aligned with the selected topic
- **No teaching or AI instruction occurs outside the Main OS screen.**

**Implementation:**

| Aspect | Location |
|--------|----------|
| Route | `src/App.tsx` — `/learn/:topicId?` → `TeachingPage`. |
| Page | `src/pages/TeachingPage.tsx` — Main OS: teaching engine, chat, studio (notes, mind map, flashcards, quiz). |
| Context | `useUserStore.profile` (profession, subProfession, subject, currentTopic); teaching and AI services use topic/subject/domain. |
| AI / teaching | `src/services/teachingEngine.ts`, `contextualAI.ts`, `contentGenerator.ts`, etc.; backend `aiService` with profession/topic context. |

---

## 7. Dashboard & Profile (User-Specific Views)

**Behavior:**

- **Dashboard:** Automatically reflects the user’s stored data; displays progress and analytics (if enabled); updates instantly when the user changes topic or configuration.
- **Profile:** Displays professional mode, sub-professional mode, subject and topic, user preferences; updates in real time when settings change.

**Implementation:**

| View | Location |
|------|----------|
| Dashboard | Shown inside profile/curriculum context (e.g. `DashboardView`, `DashboardPage` references); data from `useUserStore`, `useAnalyticsStore`. |
| Profile | `src/components/common/ProfileSettingsPanel.tsx`; curriculum/profile at `src/pages/CurriculumPage.tsx`. Profile data from `useUserStore.profile` and `useSettingsStore.settings`. |

---

## 8. Personalized Experience per User

**Behavior:** Each user has an independent profile, unique learning path, personalized dashboard, and context-aware AI. Multiple users can use the application simultaneously and see different subjects, AI explanations, and dashboards within the same application framework.

**Implementation:** Enforced by:

- One Firestore document per user (`profiles/{uid}`).
- All UI and AI context derived from `useUserStore.profile` and `useAuthStore.user` (no hardcoded user context).
- Real-time subscription and event-driven updates so each client sees only its own data and context.

---

## 9. Returning User Experience

**Behavior:** When a returning user logs in:

- Firebase restores the user profile from Firestore.
- Onboarding is **skipped**.
- The application opens **directly to the Main OS Screen** (learning screen for their last topic).
- All preferences, AI context, and learning state are restored instantly.

**Implementation:**

| Aspect | Location |
|--------|----------|
| Profile from Firestore | `subscribeToUserData` in `App.tsx`; `setProfile(data.profile)`, `setOnboardingStep(-1)` when profile has profession, subject, currentTopic, onboardingCompleted. |
| Redirect | `DefaultRedirect`: if authenticated and `!needsOnboarding`, redirect to `/learn/${profile?.currentTopic}`. |
| No onboarding | `ProtectedRoute`: if `!needsOnboarding`, user can access `/learn/:topicId`, `/curriculum`, `/settings`; only `/onboarding` redirects to Main OS. |

---

## 10. Why This Functions Like a Real Production Application

The system is:

- **Fully data-driven** — Firestore + auth as source of truth; no hardcoded user content.
- **Real-time across all components** — `onSnapshot`, `realTimeEvents`, and store updates.
- **Context-aware at the AI level** — profession, subject, topic passed into teaching and chat.
- **Consistent** — dashboard, profile, and Main OS all read from the same stores and backend.

This mirrors modern, scalable SaaS behavior.

---

## Production Hardening (Optional)

To align strictly with “only login is accessible until authentication”:

1. **Remove or hide Guest / Demo**  
   In `src/pages/LoginPage.tsx`, remove or feature-flag “Continue as Guest” and “Skip to Demo” so that in production only Google / Apple / Email login is available.

2. **Ensure Firestore rules**  
   Ensure `storage.rules` and Firestore rules allow read/write only for `request.auth != null` and the correct `uid`, so that no internal data is exposed to unauthenticated users.

3. **Env-based behavior**  
   Use an env var (e.g. `VITE_REQUIRE_AUTH=true`) to hide guest/demo only in production builds.

---

## Quick Reference: Flow → Code

| Flow step | Key files |
|-----------|-----------|
| Unauthenticated → Login only | `App.tsx` (ProtectedRoute, routes), `authStore.ts` |
| Login (Google/Apple/Email) | `authService.ts`, `authStore.ts`, `LoginPage.tsx` |
| Firestore profile check | `App.tsx` (subscribeToUserData), `backendService.ts` |
| New user → Onboarding | `ProtectedRoute` (needsOnboarding), `OnboardingPage.tsx`, `userStore.ts` |
| Data stored | `backendService.ts`, `userStore.completeOnboarding`, `updateUserProfile` |
| Real-time updates | `realTimeSync.ts`, `subscribeToUserData`, `SettingsEffect` |
| Main OS (learning) | `TeachingPage.tsx`, `/learn/:topicId`, teaching/AI services |
| Dashboard & Profile | `ProfileSettingsPanel.tsx`, `CurriculumPage.tsx`, `DashboardView` |
| Returning user | `DefaultRedirect`, Firestore snapshot → setProfile, setOnboardingStep(-1) |
