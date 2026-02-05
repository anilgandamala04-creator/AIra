# Strict Linear Flow Enforcement

## Requirement
The application must enforce the following single, linear user flow with no alternate or shortcut paths:

**Login → Professional Mode → Sub-Professional Mode → Subject → Topic → Main OS Screen**

All other navigation paths, bypasses, or entry points must be removed or disabled.

---

## Implementation Summary

### ✅ ProtectedRoute (App.tsx)
**Location:** `src/App.tsx` (lines 52-86)

**Enforcement:**
- Checks if onboarding is needed using strict criteria:
  - `onboardingStep >= 0` (onboarding in progress or not started)
  - `!profile?.profession` (profession not selected)
  - `!profile?.subProfession` (sub-profession not selected)
  - `!profile?.subject` (subject not selected)
  - `!profile?.currentTopic` (topic not selected)

**Behavior:**
- If onboarding is needed and user is NOT on `/onboarding`, redirects to `/onboarding`
- If onboarding is complete and user is on `/onboarding`, redirects to Main OS Screen (`/learn/${topicId}`)
- All protected routes (Main OS Screen, Dashboard, Curriculum, Settings) are blocked until onboarding is complete

**Routes Protected:**
- `/learn/:topicId?` - Main OS Screen
- `/dashboard` - Dashboard
- `/curriculum` - Curriculum Browser
- `/settings` - Settings Page
- `/onboarding` - Onboarding Page

---

### ✅ DefaultRedirect (App.tsx)
**Location:** `src/App.tsx` (lines 164-189)

**Enforcement:**
- Uses the same strict onboarding criteria as ProtectedRoute
- If onboarding is needed, redirects to `/onboarding`
- If onboarding is complete, redirects to Main OS Screen (`/learn/${topicId}`)
- No fallback to Curriculum or Dashboard

**Behavior:**
- Handles root path (`/`) and unknown routes
- Ensures users always follow the linear flow

---

### ✅ LoginPage Redirect Logic
**Location:** `src/pages/LoginPage.tsx` (lines 337-357, 360-380)

**Enforcement:**
- Checks onboarding completion using strict criteria
- If onboarding is needed, redirects to `/onboarding`
- If onboarding is complete, redirects to Main OS Screen (`/learn/${topicId}`)
- Handles both regular login and OAuth redirects

**Behavior:**
- Prevents authenticated users from accessing Login page
- Ensures new users go to onboarding
- Ensures existing users go to Main OS Screen (not Dashboard or Curriculum)

---

### ✅ TeachingPage (Main OS Screen)
**Location:** `src/pages/TeachingPage.tsx` (lines 454-465)

**Enforcement:**
- If no `topicId` in URL, checks onboarding completion
- If onboarding is needed, redirects to `/onboarding`
- If onboarding is complete but no topicId, uses `profile?.currentTopic` to navigate
- Prevents access without completing onboarding

**Behavior:**
- Validates topic selection before initializing session
- Ensures users have completed the full onboarding flow

---

### ✅ OnboardingPage
**Location:** `src/pages/OnboardingPage.tsx` (lines 70-92)

**Enforcement:**
- Validates all required selections before proceeding:
  - `selectedProfession` must be set
  - `selectedSubProfession` must be set
  - `selectedSubject` must be set
- Updates profile with subject and topic before completing onboarding
- Calls `completeOnboarding()` before navigation
- Navigates directly to Main OS Screen (`/learn/${topicId}`) with `replace: true`

**Behavior:**
- Cannot skip steps (back button resets dependent selections)
- Cannot proceed without completing all steps
- Direct navigation to Main OS Screen after topic selection

---

## Navigation Paths Blocked

### ❌ Direct Access to Main OS Screen
- **Blocked:** Users cannot access `/learn/:topicId` without completing onboarding
- **Enforced by:** ProtectedRoute checks all onboarding criteria

### ❌ Direct Access to Dashboard
- **Blocked:** Users cannot access `/dashboard` without completing onboarding
- **Enforced by:** ProtectedRoute checks all onboarding criteria
- **Note:** Dashboard is only accessible via Profile panel after onboarding

### ❌ Direct Access to Curriculum
- **Blocked:** Users cannot access `/curriculum` without completing onboarding
- **Enforced by:** ProtectedRoute checks all onboarding criteria

### ❌ Direct Access to Settings
- **Blocked:** Users cannot access `/settings` without completing onboarding
- **Enforced by:** ProtectedRoute checks all onboarding criteria

### ❌ URL Manipulation
- **Blocked:** Users cannot bypass onboarding by typing URLs directly
- **Enforced by:** ProtectedRoute intercepts all protected routes

### ❌ Browser Back Button
- **Handled:** Onboarding uses `replace: true` to prevent back navigation
- **Enforced by:** Navigation state management

---

## Onboarding Completion Criteria

A user is considered to have completed onboarding ONLY when ALL of the following are true:

1. ✅ `onboardingStep < 0` (onboarding marked as complete)
2. ✅ `profile?.profession` exists (profession selected)
3. ✅ `profile?.subProfession` exists (sub-profession selected)
4. ✅ `profile?.subject` exists (subject selected)
5. ✅ `profile?.currentTopic` exists (topic selected)

**All criteria must be met** - partial completion is not allowed.

---

## Flow Verification

### New User Flow:
1. **Login** → User authenticates
2. **ProtectedRoute** → Checks onboarding → Redirects to `/onboarding`
3. **Onboarding Step 0** → User selects Profession
4. **Onboarding Step 1** → User selects Sub-Profession
5. **Onboarding Step 2** → User selects Subject
6. **Onboarding Step 3** → User selects Topic
7. **Onboarding Complete** → `completeOnboarding()` called → Profile updated
8. **Navigation** → Direct to Main OS Screen (`/learn/${topicId}`)

### Existing User Flow:
1. **Login** → User authenticates
2. **ProtectedRoute** → Checks onboarding → All criteria met
3. **DefaultRedirect** → Redirects to Main OS Screen (`/learn/${topicId}`)

### Attempted Bypass:
1. **User tries to access** `/learn/some-topic` directly
2. **ProtectedRoute** → Checks onboarding → Criteria not met
3. **Redirect** → `/onboarding` (cannot bypass)

---

## Testing Checklist

- ✅ New user cannot access Main OS Screen without onboarding
- ✅ New user cannot access Dashboard without onboarding
- ✅ New user cannot access Curriculum without onboarding
- ✅ New user cannot access Settings without onboarding
- ✅ New user is redirected to onboarding after login
- ✅ Onboarding cannot be skipped (all steps required)
- ✅ Onboarding navigates directly to Main OS Screen after completion
- ✅ Existing user (onboarding complete) goes directly to Main OS Screen
- ✅ URL manipulation cannot bypass onboarding
- ✅ Browser back button during onboarding is handled
- ✅ All protected routes check onboarding completion

---

## Files Modified

1. **`src/App.tsx`**
   - Updated `ProtectedRoute` to enforce strict onboarding criteria
   - Updated `DefaultRedirect` to enforce strict onboarding criteria
   - Removed unused `getDefaultRedirectPath` import

2. **`src/pages/LoginPage.tsx`**
   - Updated redirect logic to check strict onboarding criteria
   - Updated OAuth redirect handler to check strict onboarding criteria
   - Added `useUserStore` import

3. **`src/pages/TeachingPage.tsx`**
   - Added onboarding check when no `topicId` is provided
   - Redirects to onboarding if not complete

---

## Summary

✅ **All navigation paths are now strictly enforced.**

- No shortcuts or bypasses to Main OS Screen
- No access to Dashboard, Curriculum, or Settings without onboarding
- Onboarding must be completed in exact sequence
- All protected routes check onboarding completion
- URL manipulation cannot bypass onboarding

The application now enforces the exact linear flow:
**Login → Professional Mode → Sub-Professional Mode → Subject → Topic → Main OS Screen**
