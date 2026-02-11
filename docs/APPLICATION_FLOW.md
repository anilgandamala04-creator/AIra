# Application Flow for a New User

This document describes the end-to-end application flow for new and returning users and maps each step to the codebase.

**One-line summary:** A user logs in → completes onboarding (Board/Competitive → Grade → Subject → Topic) → their context is stored in Firestore → the entire application updates in real time → AI teaches only the selected content → Dashboard, Profile, and Main OS remain synchronized.

---

## 1. Application Launch (No User State)

**Behavior:** When a new user opens the application for the first time:

- The application has **no user context**.
- **Only the Login screen is accessible.**
- No Dashboard, Main OS, or learning content is loaded.
- The system treats the user as **unauthenticated and uninitialized**.

**Implementation:**

| Aspect | Location |
|--------|----------|
| Route protection | `src/App.tsx` — `ProtectedRoute` redirects unauthenticated users to `/login`. |
| Public route | Only `/login` is rendered without `ProtectedRoute` (see `AnimatedRoutes`). |
| Default/unknown paths | `path="/"` → `DefaultRedirect`; `path="*"` → `<Navigate to="/login" />`. |
| Auth state | `src/stores/authStore.ts` — `isAuthenticated`, `user`, `isLoading`; `initAuthListener()` syncs Firebase Auth. |

**Note:** The app also supports **Continue as Guest** and **Skip to Demo** on the login page. For a strict “login only” production build, these can be hidden or removed (see [Production hardening](#production-hardening) below).

---

## 2. User Login (Google / Apple / Email)

**Behavior:**

- **Firebase Authentication** validates the user.
- A unique **User ID (UID)** is generated.
- The application checks **Firestore** to determine whether a user profile already exists.
- **New user:** No profile (or incomplete profile) → onboarding starts automatically.
- **Existing user:** Profile is found → the application immediately restores the last saved state.

**Implementation:**

| Aspect | Location |
|--------|----------|
| Firebase Auth | `src/services/authService.ts` — `signInWithGoogle`, `signInWithApple`, `signInWithEmail`, `signUpWithEmail`. |
| Auth → store | `src/stores/authStore.ts` — `loginWithGoogle`, `loginWithApple`, `loginWithEmail`; `mapFirebaseUser()` builds `User` from Firebase user. |
| Firestore check | `src/App.tsx` — On auth UID change, `subscribeToUserData(authUid, onData)` is called. |
| New vs existing | `src/services/backendService.ts` — `getUser(uid)`, `setUser()`, `subscribeToUserData()`. New users get a minimal doc (or none); existing users receive full `DbUser` (profile, settings, analytics). |
| New user init | `App.tsx` effect: `initializeUserIfNeeded()` creates Firestore user doc with `onboardingCompleted: false` if none exists. |
| Profile into app state | `App.tsx` effect: on `data.profile`, `useUserStore.getState().setProfile(data.profile)` and `setOnboardingStep(-1)` when profile has curriculum and topic. |
| “User data loaded” | `useUserStore.userDataLoaded` is set to `true` after first Firestore snapshot so redirect logic does not flash to onboarding on refresh. |

---

## 3. Mandatory Onboarding for New Users

**Behavior:** New users must complete the onboarding flow **in this order**:

```
Login → Board / Competitive → Grade → Subject → Topic → Main OS Screen
```

This flow **cannot be skipped**. It defines the complete learning and AI context for the user.

**Implementation:**

| Step | Location | Notes |
|------|----------|--------|
| Enforce order | `src/App.tsx` — `ProtectedRoute`: `needsOnboarding` is true if `onboardingStep !== -1` or missing `curriculumType`, `selectedBoard`/`selectedGrade` (school), `selectedExam` (competitive), `selectedSubject`, or `profile?.currentTopic`. |
| Onboarding UI | `src/pages/OnboardingPage.tsx` — Step 0: Curriculum Type (School / Competitive); Step 1: Board or Exam; Step 2: Grade (school) or Subject (competitive); Step 3: Subject (school) or Topic (competitive); Step 4: Topic (school). Linear `step` state and back button. |
| Board / Competitive | `userStore`: `curriculumType`, `selectedBoard`, `selectedExam`; data from `src/data/curriculumData.ts` (`BOARDS`, `COMPETITIVE_EXAMS`, `GRADES`, `SUBJECTS_BY_GRADE`, `ALL_SUBJECTS`). |
| Subject / Topic | `OnboardingPage`: `handleSubjectSelect`, `handleTopicSelect`; `updateProfile()` and `completeOnboarding()` with `curriculumType`, `board`, `grade`, `exam`, `subject`, `currentTopic`. |
| Completion | `userStore.completeOnboarding()` builds/updates `UserProfile` with `onboardingCompleted: true` and syncs to backend via `updateUserProfile(uid, profile)`. |
| Redirect after onboarding | `OnboardingPage` navigates to `/learn/${topicId}`; `ProtectedRoute` redirects completed users from `/onboarding` to `/learn/${topicId}`. |

---

## 4. Data Stored for a New User (Single Source of Truth)

**Behavior:** After onboarding, the application stores the following in **Firebase Firestore**:

- User identity (UID, email)
- Board / Competitive selection
- Grade
- Selected subject
- Selected topic
- User preferences (theme, voice, language)

This data is the **single source of truth** for the entire application.

**Implementation:**

| Data | Storage | Location |
|------|---------|----------|
| Identity | Firebase Auth (UID, email); Firestore `profiles/{uid}` | `backendService`: `DbUser`, `UserProfile` |
| Board / Competitive / Grade / Exam / Subject / Topic | `UserProfile` in Firestore | `types/index.ts` — `UserProfile` (`curriculumType`, `board`, `grade`, `exam`, `subject`, `currentTopic`); `backendService.updateUserProfile()`, `userStore.updateProfile` / `completeOnboarding` |
| Preferences (theme, voice, language) | `AppSettings` in Firestore (part of user document) | `backendService`; `useSettingsStore`; synced in `App.tsx` subscription |

---

## 5. Automatic App-Wide Real-Time Updates

**Behavior:** Once onboarding is completed:

- The **entire application updates automatically**; no refresh or reload is required.
- Real-time updates include:
  - Header updates with correct badges
  - Dashboard loads user-specific data
  - Main OS loads the correct teaching content
  - AI context switches to the selected board, grade, subject, and topic
  - Studio tools align with the selected topic
  - Profile reflects the user’s selections

All updates are handled via **real-time Firebase listeners**, not manual state updates.

**Implementation:**

| Mechanism | Location |
|-----------|----------|
| Firestore real-time | `backendService.subscribeToUserData()` — `onSnapshot` on `profiles/{uid}`; pushes profile, settings, analytics into stores. |
| In-app events | `src/utils/realTimeSync.ts` — `realTimeEvents`, `EVENTS` (e.g. `PROFILE_UPDATE`, `SETTINGS_UPDATE`, `THEME_CHANGE`). `initRealTimeSync()` subscribes stores and emits events for instant UI updates. |
| Settings (theme, language, voice) | `src/App.tsx` — `SettingsEffect` applies theme, font size, high contrast, language, TTS to document and i18n. |
| Store updates | `userStore.setProfile` / `updateProfile` / `completeOnboarding` sync to backend; profile changes emit `PROFILE_UPDATE`. |

---

## 6. Main OS Screen (Core Learning Engine)

**Behavior:** The **Main OS Screen** is the central learning environment:

- AI teaches **only** the selected subject and topic.
- Teaching includes:
  - Topic-specific, realistic visuals
  - Natural, human-like voice narration
- The **Chat** panel understands topic-related questions and general questions within the same learning context.
- **Studio** tools generate Notes, Mind maps, Flashcards, Quizzes — all content strictly aligned to the selected topic.

**No teaching occurs outside the Main OS screen.**

**Implementation:**

| Aspect | Location |
|--------|----------|
| Route | `src/App.tsx` — `/learn/:topicId?` → `TeachingPage`. |
| Page | `src/pages/TeachingPage.tsx` — Main OS: teaching engine, chat, studio (notes, mind map, flashcards, quiz). |
| Context | `useUserStore.profile` (curriculumType, board, grade, exam, subject, currentTopic); teaching and AI services use topic/subject/board/grade context. |
| AI / teaching | `src/services/teachingEngine.ts`, `contextualAI.ts`, `contentGenerator.ts`, etc.; backend and AI use board/grade/subject/topic context. |

---

## 7. Dashboard & Profile (User-Specific and Real-Time)

**Behavior:**

- **Dashboard:** Automatically reflects the user’s data; shows progress and analytics (if enabled); updates instantly when the user changes topic or learning context.
- **Profile:** Displays Board/Competitive selection, Grade, Subject and topic, user preferences. All profile changes update in real time.

**Implementation:**

| View | Location |
|------|----------|
| Dashboard | `src/components/common/DashboardView.tsx`; data from `useUserStore`, `useAnalyticsStore`. |
| Profile | `src/components/common/ProfileSettingsPanel.tsx`; curriculum/profile at `src/pages/CurriculumPage.tsx`. Profile data from `useUserStore.profile` and `useSettingsStore.settings`. |

---

## 8. Personalized Experience for Every User

**Behavior:** Each user:

- Has a separate profile
- Follows a unique learning path
- Sees a personalized dashboard
- Interacts with a context-aware AI

Two users using the app simultaneously will see different subjects, different AI explanations, and different dashboards — all within the same application framework.

**Implementation:**

- One Firestore document per user (`profiles/{uid}`).
- All UI and AI context derived from `useUserStore.profile` and `useAuthStore.user` (no hardcoded user context).
- Real-time subscription and event-driven updates so each client sees only its own data and context.

---

## 9. Returning User Experience

**Behavior:** When a returning user logs in:

- Firebase restores the user profile from Firestore.
- Onboarding is **skipped**.
- The application opens **directly to the Main OS Screen** (for their last topic).
- All preferences and learning context are restored instantly.

**Implementation:**

| Aspect | Location |
|--------|----------|
| Profile from Firestore | `subscribeToUserData` in `App.tsx`; `setProfile(data.profile)`, `setOnboardingStep(-1)` when profile has curriculumType, subject, currentTopic, onboardingCompleted. |
| Redirect | `DefaultRedirect`: if authenticated and `!needsOnboarding`, redirect to `/learn/${profile?.currentTopic}`. |
| No onboarding | `ProtectedRoute`: if `!needsOnboarding`, user can access `/learn/:topicId`, `/curriculum`, `/settings`; only `/onboarding` redirects to Main OS. |

---

## 10. Why This Feels Like a Real Application

The system is:

- **Fully data-driven** — Firestore + auth as source of truth; no hardcoded content.
- **Free of static UI states** — all driven by user data and real-time listeners.
- **Fully real-time** — `onSnapshot`, `realTimeEvents`, and store subscriptions.
- **Context-aware at every level** — board, grade, subject, topic passed into teaching, chat, and studio.

This mirrors how production-grade SaaS applications operate.

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

---

## Production Hardening (Optional)

To align strictly with “only login is accessible until authentication”:

1. **Remove or hide Guest / Demo**  
   In `src/pages/LoginPage.tsx`, remove or feature-flag “Continue as Guest” and “Skip to Demo” so that in production only Google / Apple / Email login is available.

2. **Ensure Firestore rules**  
   Ensure Firestore and Storage rules allow read/write only for `request.auth != null` and the correct `uid`.

3. **Env-based behavior**  
   Use an env var (e.g. `VITE_REQUIRE_AUTH=true`) to hide guest/demo only in production builds.
