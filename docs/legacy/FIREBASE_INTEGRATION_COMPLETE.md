# Firebase Integration - Complete Implementation Guide

This document provides a comprehensive overview of the Firebase integration for the AI Tutor application, covering all aspects from authentication to deployment.

## Table of Contents

1. [Firebase Authentication](#1-firebase-authentication)
2. [Firestore Database](#2-firestore-database)
3. [Firebase Hosting](#3-firebase-hosting)
4. [Firebase Storage](#4-firebase-storage)
5. [Firebase Cloud Functions](#5-firebase-cloud-functions)
6. [Real-Time Application Behavior](#6-real-time-application-behavior)
7. [Security & Reliability](#7-security--reliability)
8. [Deployment Flow](#8-deployment-flow)

---

## 1. Firebase Authentication

### Purpose
Secure user login and session management with role and plan-based access control.

### Scope
- ✅ **Google Sign-In** - OAuth with popup/redirect fallback
- ✅ **Apple Sign-In** - OAuth with platform detection
- ✅ **Email/Password** - Traditional authentication with validation

### Responsibilities

#### User Roles
- **Student** (default) - Standard learning features
- **Teacher** - Enhanced features for educators
- **Admin** - Full system access

#### Subscription Plans
- **Simple** (default) - Basic features, 10MB file uploads
- **Pro** - Advanced features, 50MB file uploads, chat sessions, studio resources, analytics
- **Enterprise** - All Pro features + admin capabilities

#### Session Management
- ✅ Session persistence across refreshes
- ✅ Auth state listener (`onAuthStateChanged`)
- ✅ Automatic token refresh
- ✅ Redirect handling for OAuth flows
- ✅ Error handling and recovery

### Implementation

#### User Creation
When a user signs up, the following defaults are set:
```typescript
{
  role: 'student',
  plan: 'simple',
  onboardingCompleted: false
}
```

#### Role/Plan Updates
- Users cannot modify their own role/plan
- Only admins can update roles/plans via Firestore
- Plan upgrades should go through payment system (not implemented in this codebase)

#### Redirect Logic
- New users → `/onboarding`
- Existing users → `/dashboard`
- Authenticated users visiting `/login` → auto-redirect to `/dashboard`

---

## 2. Firestore Database

### Purpose
Central real-time data store for the application with role and plan-based access control.

### Collections Structure

#### `users/{uid}` - Main User Document
```typescript
{
  profile: UserProfile | null,
  settings: Partial<AppSettings>,
  analytics: {
    sessions: SessionAnalytics[],
    achievements: Achievement[],
    metrics: ProgressMetrics
  },
  role: 'student' | 'teacher' | 'admin',
  plan: 'simple' | 'pro' | 'enterprise',
  onboardingCompleted: boolean,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### `users/{uid}/sessions/{sessionId}` - Teaching Sessions
All authenticated users can create/manage their own sessions.

#### `users/{uid}/doubts/{doubtId}` - Doubt History
All authenticated users can create/manage their own doubts.

#### `users/{uid}/notes/{noteId}` - Generated Notes
All authenticated users can create/manage their own notes.

#### `users/{uid}/flashcards/{cardId}` - Flashcard Decks
All authenticated users can create/manage their own flashcards.

#### `users/{uid}/mindmaps/{mapId}` - Mind Maps
All authenticated users can create/manage their own mind maps.

#### `users/{uid}/chat_sessions/{sessionId}` - Chat History
**Pro/Enterprise only** - Real-time chat sessions with context.

#### `users/{uid}/studio_resources/{resourceId}` - Studio Resources
**Pro/Enterprise only** - Advanced studio content (notes, mind maps, flashcards, quizzes).

#### `users/{uid}/analytics/{analyticsId}` - Performance Analytics
**Pro/Enterprise only** - Detailed performance metrics and diagnostics.

#### `subjects/{subjectId}` - Subject Catalog
Public read access for all authenticated users. Admin-only write access.

### Real-Time Sync

All user data is synced in real-time using Firestore listeners:
- Profile changes → Instant UI updates
- Settings changes → Instant UI updates
- Professional mode changes → Instant header badge updates
- Subject/Topic changes → Instant Main OS content updates

### Access Control Rules

See `firestore.rules` for complete security rules:
- Users can only access their own data
- Pro/Enterprise features are gated by plan
- Admins have full access
- Analytics are append-only

---

## 3. Firebase Hosting

### Purpose
Serve the web application securely and reliably with SPA routing support.

### Configuration (`firebase.json`)

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "/**/*.@(js|css)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "/index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache, no-store, must-revalidate"
          }
        ]
      }
    ]
  }
}
```

### Features
- ✅ SPA routing (all routes → `index.html`)
- ✅ Asset caching (1 year for JS/CSS)
- ✅ No cache for `index.html` (fresh deployments)
- ✅ HTTPS by default
- ✅ CDN delivery

---

## 4. Firebase Storage

### Purpose
Handle file uploads and media storage with plan-based limits.

### Storage Paths

#### User Files (`users/{uid}/...`)
- Avatars
- Personal documents
- User-generated content

**Limits:**
- Simple: 10MB max per file
- Pro/Enterprise: 50MB max per file

#### Chat Documents (`chat_documents/{uid}/...`)
**Pro/Enterprise only**
- PDF uploads
- Image uploads
- DOC/DOCX files

#### Studio Uploads (`studio_uploads/{uid}/...`)
**Pro/Enterprise only**
- Resource files
- Exports
- Custom assets

#### AI-Generated Content (`ai_generated/{uid}/...`)
- Visuals generated by AI
- Read-only for users (Cloud Functions write)

### Security Rules

See `storage.rules` for complete rules:
- Users can only access their own files
- File type validation (images, PDFs, DOC/DOCX)
- File size limits based on plan
- Virus-safe file handling (Firebase Storage built-in)

---

## 5. Firebase Cloud Functions

### Purpose
Backend logic and AI orchestration (Note: Current implementation uses separate Node.js backend).

### Current Architecture

The application currently uses a separate Node.js backend (`backend/`) for AI processing:
- Located at `VITE_API_URL` (e.g., `http://localhost:5000`)
- Handles AI requests (LLaMA/Mistral)
- Context validation
- Response routing

### Future Cloud Functions (Recommended)

For production, consider migrating to Firebase Cloud Functions:

#### `generateTeachingContent`
- Validates professional/subject/topic context
- Routes to appropriate AI model
- Returns structured teaching content

#### `handleChatMessage`
- Processes chat messages
- Maintains conversation context
- Returns AI responses

#### `generateStudioResources`
- Generates notes, mind maps, flashcards
- Validates plan access (Pro/Enterprise)
- Returns formatted resources

#### `evaluateWeeklyTest`
- Processes test submissions
- Calculates scores and diagnostics
- Updates analytics

#### `syncUserContext`
- Syncs user profile changes
- Updates related documents
- Triggers notifications (Enterprise)

### Function Rules
- Validate inputs before AI calls
- Fail gracefully with fallbacks
- Enforce plan-based feature access
- Rate limiting for cost control

---

## 6. Real-Time Application Behavior

### Requirements

Any change in:
- Professional mode
- Sub-professional
- Subject / Topic
- Settings
- Role / Plan

Must instantly update:
- Header badges
- Main OS content
- Chat / Teaching / Studio behavior
- Access permissions

### Implementation

#### Firestore Real-Time Listeners
```typescript
// Subscribe to user data
subscribeToUserData(uid, (data) => {
  // Update profile
  if (data.profile) useUserStore.getState().setProfile(data.profile);
  
  // Update settings
  if (data.settings) useSettingsStore.setState({ settings: {...} });
  
  // Update analytics
  if (data.analytics) useAnalyticsStore.setState({...});
});
```

#### Centralized State Management
- Zustand stores for client state
- Firestore for persistent state
- Real-time sync bridges the gap

#### No Hard Refresh Dependencies
- All updates happen via listeners
- UI reacts to state changes
- No page reloads needed

---

## 7. Security & Reliability

### Firestore Security Rules

✅ **Role-based access**
- Students: Own data only
- Teachers: Own data + student data (if implemented)
- Admins: Full access

✅ **Plan-based access**
- Simple: Basic features only
- Pro: Advanced features (chat, studio, analytics)
- Enterprise: All features + admin capabilities

✅ **Data validation**
- Required fields enforced
- Size limits enforced
- Type validation

### Storage Security Rules

✅ **File access control**
- Users can only access their own files
- Plan-based file size limits
- File type validation

✅ **Virus protection**
- Firebase Storage built-in scanning
- Automatic quarantine of suspicious files

### Error Handling

✅ **Graceful failures**
- Network errors → Retry with exponential backoff
- Permission errors → Clear user messages
- Validation errors → Field-level feedback

✅ **No "Oops" screens**
- All errors are user-friendly
- Actionable error messages
- Recovery suggestions

---

## 8. Deployment Flow

### Pre-Deployment Checklist

1. ✅ Build application (`npm run build`)
2. ✅ Verify Firebase config (`.env` or defaults)
3. ✅ Test authentication flows locally
4. ✅ Verify Firestore rules syntax
5. ✅ Test storage uploads/downloads

### Deployment Steps

```bash
# 1. Build the application
npm run build

# 2. Deploy Firestore rules
firebase deploy --only firestore:rules

# 3. Deploy Storage rules
firebase deploy --only storage

# 4. Deploy Hosting (fresh deployment)
firebase deploy --only hosting

# 5. (Optional) Deploy Cloud Functions
firebase deploy --only functions
```

### Post-Deployment Smoke Test

1. ✅ Visit hosted URL
2. ✅ Test Google Sign-In
3. ✅ Test Apple Sign-In (if on iOS/macOS)
4. ✅ Test Email/Password sign-up
5. ✅ Verify redirect to `/onboarding` for new users
6. ✅ Verify redirect to `/dashboard` for existing users
7. ✅ Test Main OS functionality
8. ✅ Verify real-time sync (open in two tabs)

### Fresh Deployments

The `firebase.json` configuration ensures:
- `index.html` is never cached (no-cache headers)
- Assets are cached for 1 year (immutable)
- Each deployment serves fresh HTML
- CDN handles asset delivery

---

## Summary

This Firebase integration provides:

✅ **Secure authentication** with role and plan management
✅ **Real-time data sync** across all devices
✅ **Plan-based feature access** (Simple/Pro/Enterprise)
✅ **Scalable hosting** with CDN delivery
✅ **File storage** with size and type validation
✅ **Production-grade security** with comprehensive rules
✅ **Clean error handling** with user-friendly messages

All components work together to provide a seamless, secure, and scalable learning platform.
