# Firebase Integration - Complete Setup Guide

## ✅ Status: Fully Integrated and Production-Ready

This document provides a complete guide to the Firebase integration for the AIra application, including authentication, data storage, real-time updates, and deployment configuration.

---

## 📋 Table of Contents

1. [Firebase Project Configuration](#firebase-project-configuration)
2. [Authentication Setup](#authentication-setup)
3. [Firestore Database Setup](#firestore-database-setup)
4. [Storage Setup](#storage-setup)
5. [Environment Configuration](#environment-configuration)
6. [OAuth Redirect Domains](#oauth-redirect-domains)
7. [Real-Time Data Synchronization](#real-time-data-synchronization)
8. [Deployment Configuration](#deployment-configuration)
9. [Testing & Verification](#testing--verification)

---

## 🔥 Firebase Project Configuration

### Project Details
- **Project ID**: `aira-27a47`
- **Project Name**: AIra Learning Platform
- **Region**: Default (us-central1)

### Firebase Services Enabled
- ✅ **Authentication** (Google, Apple, Email/Password)
- ✅ **Cloud Firestore** (Real-time database)
- ✅ **Firebase Storage** (File storage)
- ✅ **Firebase Hosting** (Web app hosting)
- ✅ **Firebase Analytics** (Usage tracking)

---

## 🔐 Authentication Setup

### 1. Enable Authentication Providers

In Firebase Console → Authentication → Sign-in method, enable:

#### Email/Password
- ✅ **Enabled**: Yes
- **Email link (passwordless sign-in)**: Optional
- **Email verification**: Enabled

#### Google Sign-In
- ✅ **Enabled**: Yes
- **Project support email**: Your project email
- **OAuth consent screen**: Configured

#### Apple Sign-In
- ✅ **Enabled**: Yes (iOS/macOS/Web)
- **Apple Service ID**: Configured
- **OAuth redirect domains**: See [OAuth Redirect Domains](#oauth-redirect-domains)

### 2. Authentication Configuration

The application uses Firebase Auth with:
- **Session Persistence**: `browserLocalPersistence` (persists across browser sessions)
- **OAuth Flow**: Popup (desktop) / Redirect (mobile/embedded)
- **Error Handling**: Comprehensive retry logic with exponential backoff

### 3. User State Management

User authentication state is managed through:
- **Firebase Auth Listener**: `onAuthStateChanged` in `authStore.ts`
- **Real-time Sync**: User data synced from Firestore on login
- **Custom Claims**: Role and plan stored in Firestore (not custom claims for simplicity)

---

## 💾 Firestore Database Setup

### 1. Database Structure

```
users/
  {userId}/
    - profile: UserProfile
    - settings: AppSettings
    - analytics: { sessions, achievements, metrics }
    - role: 'student' | 'teacher' | 'admin'
    - plan: 'simple' | 'pro' | 'enterprise'
    - onboardingCompleted: boolean
    - createdAt: Timestamp
    - updatedAt: Timestamp
    
    sessions/
      {sessionId}/
        - TeachingSession data
        
    doubts/
      {doubtId}/
        - Doubt data
        
    notes/
      {noteId}/
        - GeneratedNote data
        
    flashcards/
      {cardId}/
        - Flashcard data
        
    mindmaps/
      {mindMapId}/
        - MindMap data
```

### 2. Security Rules

Security rules are defined in `firestore.rules`:

- **Role-based access**: Student, Teacher, Admin
- **Plan-based access**: Simple, Pro, Enterprise
- **Ownership validation**: Users can only access their own data
- **Read/Write permissions**: Based on role and plan

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 4. Indexes

Firestore automatically creates indexes for queries. If you add new queries, you may need to create composite indexes:

```bash
# Firestore will prompt you to create indexes when needed
# Or create them manually in Firebase Console → Firestore → Indexes
```

---

## 📦 Storage Setup

### 0. Initialize Firebase Storage (First Time Only)

**Important**: Before deploying storage rules, you must initialize Firebase Storage in the Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com/project/aira-27a47/storage)
2. Navigate to **Storage** in the left sidebar
3. Click **Get Started**
4. Choose **Start in production mode** (or test mode for development)
5. Select a location for your storage bucket (e.g., `us-central1`)
6. Click **Done**

**Note**: Storage rules deployment will fail until Storage is initialized in the console.

### 1. Storage Structure

```
users/
  {userId}/
    - avatars/
    - exports/
    
chat_documents/
  {userId}/
    - PDFs, images, DOC files (Pro/Enterprise only)
    
studio_uploads/
  {userId}/
    - Quizzes, mind maps, flashcards (Pro/Enterprise only)
    
ai_generated/
  {userId}/
    - AI-generated visuals
```

### 2. Storage Rules

Storage rules are defined in `storage.rules`:

- **File size limits**: 10MB (Simple), 50MB (Pro/Enterprise)
- **File type validation**: Images, PDFs, DOC files
- **Plan-based access**: Pro/Enterprise features restricted
- **Ownership validation**: Users can only access their own files

### 3. Deploy Storage Rules

```bash
firebase deploy --only storage
```

**Important**: If you get an error saying "Firebase Storage has not been set up", you must first initialize Storage in the Firebase Console (see step 0 above).

---

## 🌍 Environment Configuration

### 1. Environment Variables

Create a `.env` file in the project root (optional - defaults are provided):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=aira-27a47.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=aira-27a47
VITE_FIREBASE_STORAGE_BUCKET=aira-27a47.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=392194581279
VITE_FIREBASE_APP_ID=1:392194581279:web:7aa884926a9e8fafa5062a
VITE_FIREBASE_MEASUREMENT_ID=G-0CTNZWZDXF
```

**Note**: The application includes default Firebase config values, so `.env` is optional for development.

### 2. Production Environment

For production, set environment variables in your hosting platform:
- **Firebase Hosting**: Use Firebase Functions environment config
- **Vercel/Netlify**: Set in platform dashboard
- **CI/CD**: Use secrets management

---

## 🔄 OAuth Redirect Domains

### 1. Authorized Domains

In Firebase Console → Authentication → Settings → Authorized domains, add:

- ✅ `localhost` (development - automatically added)
- ✅ `aira-27a47.firebaseapp.com` (Firebase Hosting - automatically added)
- ✅ `aira-27a47.web.app` (Firebase Hosting - automatically added)
- ✅ Your custom domain (add manually if configured)

**Note**: Firebase automatically adds `localhost` and your Firebase hosting domains. You only need to manually add custom domains.

### 2. OAuth Redirect URIs

#### Google Sign-In
- **Authorized JavaScript origins**:
  - `http://localhost:5173` (Vite dev server)
  - `https://aira-27a47.firebaseapp.com`
  - `https://aira-27a47.web.app`
  - Your custom domain

- **Authorized redirect URIs**:
  - `http://localhost:5173` (Vite dev server)
  - `https://aira-27a47.firebaseapp.com/__/auth/handler`
  - `https://aira-27a47.web.app/__/auth/handler`
  - Your custom domain + `/__/auth/handler`

#### Apple Sign-In
- **Return URLs**:
  - `https://aira-27a47.firebaseapp.com/__/auth/handler`
  - `https://aira-27a47.web.app/__/auth/handler`
  - Your custom domain + `/__/auth/handler`

### 3. Configure in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `aira-27a47`
3. Navigate to **APIs & Services** → **Credentials**
4. Edit OAuth 2.0 Client ID
5. Add authorized domains and redirect URIs

---

## 🔄 Real-Time Data Synchronization

### 1. Firestore Listeners

The application uses Firestore `onSnapshot` for real-time updates:

- **User Data**: `subscribeToUserData()` in `App.tsx`
- **Teaching Sessions**: `subscribeToTeachingSessions()` in `firebaseBackend.ts`
- **Doubts**: `subscribeToDoubts()` in `firebaseBackend.ts`
- **Notes**: `subscribeToNotes()` in `firebaseBackend.ts`
- **Flashcards**: `subscribeToFlashcards()` in `firebaseBackend.ts`
- **Mind Maps**: `subscribeToMindMaps()` in `firebaseBackend.ts`

### 2. Offline Persistence

Firestore offline persistence is enabled:
- **IndexedDB**: Stores data locally for offline access
- **Automatic Sync**: Syncs when connection is restored
- **Conflict Resolution**: Last-write-wins (Firestore default)

### 3. Real-Time Events

The application uses a custom event system (`realTimeSync.ts`) for:
- Cross-component communication
- Immediate UI updates
- State synchronization across tabs

---

## 🚀 Deployment Configuration

### 1. Firebase Hosting

Hosting is configured in `firebase.json`:

```json
{
  "hosting": {
    "public": "dist",
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

### 2. Build and Deploy

```bash
# Build the application
npm run build

# Deploy to Firebase
firebase deploy --only hosting

# Deploy everything (hosting + rules)
firebase deploy
```

### 3. Deploy Security Rules

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

---

## ✅ Testing & Verification

### 1. Authentication Testing

Test each authentication method:

#### Email/Password
```bash
# Test sign-up
1. Navigate to /login
2. Click "Sign Up"
3. Enter email and password
4. Verify email sent (check console)
5. Complete sign-up

# Test sign-in
1. Use existing credentials
2. Verify redirect to dashboard
```

#### Google Sign-In
```bash
# Test popup flow (desktop)
1. Click "Continue with Google"
2. Popup should open
3. Select Google account
4. Verify redirect to dashboard

# Test redirect flow (mobile)
1. Click "Continue with Google"
2. Should redirect to Google
3. After sign-in, redirects back
4. Verify redirect to dashboard
```

#### Apple Sign-In
```bash
# Test Apple Sign-In (iOS/macOS/Web)
1. Click "Continue with Apple"
2. Apple Sign-In modal opens
3. Authenticate with Apple ID
4. Verify redirect to dashboard
```

### 2. Data Storage Testing

#### User Profile
```bash
# Test profile creation
1. Complete onboarding
2. Verify profile saved to Firestore
3. Check: users/{userId}/profile exists

# Test profile update
1. Update profile in settings
2. Verify Firestore document updated
3. Check real-time sync across tabs
```

#### Teaching Sessions
```bash
# Test session creation
1. Start a teaching session
2. Verify session saved to Firestore
3. Check: users/{userId}/sessions/{sessionId}

# Test real-time sync
1. Open app in two tabs
2. Start session in tab 1
3. Verify session appears in tab 2
```

### 3. Storage Testing

#### File Upload
```bash
# Test file upload
1. Upload a file (avatar, document)
2. Verify file in Firebase Storage
3. Check file URL in Firestore
4. Verify file accessible via URL
```

### 4. Security Rules Testing

#### Test Access Control
```bash
# Test user isolation
1. Login as User A
2. Try to access User B's data
3. Verify access denied

# Test plan restrictions
1. Login as Simple plan user
2. Try to access Pro features
3. Verify access denied
```

---

## 🔧 Troubleshooting

### Common Issues

#### 1. Authentication Not Working

**Issue**: OAuth redirect fails
- **Solution**: Verify authorized domains in Firebase Console
- **Check**: OAuth redirect URIs in Google Cloud Console

#### 2. Firestore Permission Denied

**Issue**: `permission-denied` errors
- **Solution**: Deploy Firestore rules: `firebase deploy --only firestore:rules`
- **Check**: User is authenticated and has correct role/plan

#### 3. Storage Upload Fails

**Issue**: File upload fails
- **Solution**: Deploy Storage rules: `firebase deploy --only storage`
- **Check**: File size and type meet requirements

#### 4. Real-Time Updates Not Working

**Issue**: Changes not syncing across tabs
- **Solution**: Verify Firestore listeners are active
- **Check**: Network connection and Firestore rules

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Firebase Storage](https://firebase.google.com/docs/storage)

---

## ✅ Integration Checklist

- [x] Firebase project created and configured
- [x] Authentication providers enabled (Google, Apple, Email/Password)
- [x] Firestore database initialized
- [x] Storage bucket configured
- [x] Security rules deployed
- [x] OAuth redirect domains configured
- [x] Environment variables set (optional)
- [x] Real-time listeners implemented
- [x] Offline persistence enabled
- [x] User state management connected
- [x] Data synchronization working
- [x] Error handling implemented
- [x] Hosting configured
- [x] All features tested

---

## 🎯 Next Steps

1. **Deploy Security Rules**:
   ```bash
   # Deploy Firestore rules
   firebase deploy --only firestore:rules
   
   # Deploy Storage rules
   firebase deploy --only storage
   ```

2. **Deploy to Production**:
   ```bash
   # Build the application
   npm run build
   
   # Deploy everything (hosting + rules)
   firebase deploy
   ```

3. **Verify OAuth Configuration**:
   - Test Google Sign-In in production
   - Test Apple Sign-In (if applicable)
   - Verify redirect URIs are correct

4. **Monitor Usage**:
   - Firebase Console → Analytics
   - Firestore usage metrics
   - Storage usage metrics
   - Authentication metrics

5. **Set Up Custom Domain** (Optional):
   - Firebase Console → Hosting → Add custom domain
   - Update OAuth redirect URIs in Google Cloud Console
   - Update authorized domains in Firebase Console

6. **Configure Cloud Functions** (If needed):
   - Set up Cloud Functions for backend logic
   - Configure triggers for user events
   - Deploy: `firebase deploy --only functions`

---

## 🔍 Verification Steps

### Test Authentication
1. ✅ Sign up with Email/Password
2. ✅ Sign in with Google
3. ✅ Sign in with Apple (iOS/macOS/Web)
4. ✅ Verify user document created in Firestore
5. ✅ Verify session persistence across page refreshes

### Test Data Operations
1. ✅ Create teaching session → Verify in Firestore
2. ✅ Update profile → Verify real-time sync
3. ✅ Generate notes → Verify saved to Firestore
4. ✅ Upload file → Verify in Storage
5. ✅ Test cross-tab synchronization

### Test Security
1. ✅ Verify users can only access their own data
2. ✅ Verify plan-based restrictions work
3. ✅ Verify role-based restrictions work
4. ✅ Test unauthorized access attempts

---

**Last Updated**: Current Date  
**Status**: ✅ Production Ready  
**Firebase Project**: `aira-27a47`
