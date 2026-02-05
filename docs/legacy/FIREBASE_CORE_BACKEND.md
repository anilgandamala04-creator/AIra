# Firebase Core Backend Integration

This document describes how Firebase serves as the **core backend** for the entire AIra application, handling authentication, database management, storage, and all supporting services.

## Overview

Firebase is the **single source of truth** for all backend operations in the AIra application:

- **Authentication**: Firebase Authentication (Google, Apple, Email/Password)
- **Database**: Cloud Firestore (real-time, offline-capable NoSQL database)
- **Storage**: Firebase Storage (file uploads and user-generated content)
- **Backend API**: Cloud Functions (AI processing, server-side operations)
- **Hosting**: Firebase Hosting (static site hosting with CDN)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Firebase Platform                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Auth        │  │  Firestore  │  │  Storage     │      │
│  │  (Users)     │  │  (Data)     │  │  (Files)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Cloud Functions (Backend API)                 │  │
│  │  - AI Processing (LLaMA/Mistral)                      │  │
│  │  - Server-side operations                             │  │
│  │  - Authentication middleware                           │  │
│  │  - Rate limiting                                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Firebase Hosting (Frontend)                    │  │
│  │  - React application                                   │  │
│  │  - Static assets                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Firebase Authentication

**Location**: `src/services/authService.ts`, `src/stores/authStore.ts`

**Features**:
- Google Sign-in (OAuth)
- Apple Sign-in (OAuth)
- Email/Password authentication
- Session persistence across page reloads
- Password reset functionality
- Email verification

**Configuration**:
- Authentication providers enabled in Firebase Console
- Session persistence: Local (browser) storage
- Automatic token refresh

### 2. Cloud Firestore Database

**Location**: `src/services/firebaseBackend.ts`, `src/services/firestoreService.ts`

**Collections Structure**:
```
users/{uid}
├── profile (UserProfile)
├── settings (AppSettings)
├── analytics (SessionAnalytics[], Achievements[], Metrics)
├── role ('student' | 'teacher' | 'admin')
├── plan ('simple' | 'pro' | 'enterprise')
├── onboardingCompleted (boolean)
├── createdAt (Timestamp)
└── updatedAt (Timestamp)

users/{uid}/sessions/{sessionId}
├── topicId, topicName
├── startTime, endTime
├── status, progress
├── teachingSteps[]
└── doubts[]

users/{uid}/doubts/{doubtId}
├── question, answer
├── sessionId
├── timestamp
└── context

users/{uid}/notes/{noteId}
├── topicName
├── content
└── createdAt

users/{uid}/flashcards/{cardId}
├── question, answer
├── sessionId
├── nextReviewDate
└── difficulty

users/{uid}/mindmaps/{mapId}
├── topicName
├── nodes, edges
└── createdAt

subjects/{subjectId}
└── (curriculum data)
```

**Features**:
- Real-time synchronization (automatic updates across devices)
- Offline persistence (works without internet)
- Automatic indexing
- Security rules (user-based access control)

### 3. Firebase Storage

**Location**: `src/services/firebaseBackend.ts`

**Storage Structure**:
```
users/{uid}/
├── avatars/
├── documents/
├── uploads/
└── generated/
```

**Features**:
- File uploads (images, PDFs, documents)
- Automatic file type validation
- Size limits (10MB for Simple plan, 50MB for Pro/Enterprise)
- Secure download URLs
- Direct client-side uploads (no server required)

### 4. Cloud Functions (Backend API)

**Location**: `functions/src/index.ts`, `functions/src/services/aiService.ts`

**Endpoints**:
- `GET /health` - Health check and model availability
- `POST /api/generate-content` - Generate free-form content (chat, notes, etc.)
- `POST /api/resolve-doubt` - Resolve student doubts with explanations
- `POST /api/generate-teaching-content` - Generate structured lessons
- `POST /api/generate-quiz` - Generate quizzes

**Features**:
- AI processing (LLaMA via OpenRouter, Mistral native API)
- Authentication middleware (optional per endpoint)
- Rate limiting (30 requests/minute per user)
- Request timeout handling (60 seconds)
- CORS configuration
- Error handling and logging

**Authentication**:
- Optional Firebase ID token verification
- User context attached to requests
- Rate limiting per user

## Development Setup

### Local Development with Emulators

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Start Emulators**:
   ```bash
   firebase emulators:start
   ```
   This starts:
   - Auth Emulator: `http://localhost:9099`
   - Firestore Emulator: `http://localhost:8080`
   - Storage Emulator: `http://localhost:9199`
   - Functions Emulator: `http://localhost:5001`

4. **Configure Frontend**:
   Set environment variable:
   ```bash
   VITE_USE_FIREBASE_EMULATOR=true
   ```

5. **Run Frontend**:
   ```bash
   npm run dev
   ```

### Environment Variables

**Frontend** (`.env`):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_USE_FIREBASE_EMULATOR=true  # For local development
```

**Cloud Functions** (set via Firebase Secrets or Config):
```bash
# Set secrets (recommended for production)
firebase functions:secrets:set OPENROUTER_API_KEY
firebase functions:secrets:set MISTRAL_API_KEY

# Or use config (legacy)
firebase functions:config:set openrouter.api_key="your_key"
firebase functions:config:set mistral.api_key="your_key"
```

## Deployment

### Deploy Everything
```bash
npm run deploy:all
```

### Deploy Individual Services
```bash
# Deploy hosting only
npm run deploy:hosting

# Deploy functions only
npm run deploy:functions

# Deploy security rules
npm run deploy:rules
```

### Deploy Functions with Secrets
```bash
# Set secrets first
firebase functions:secrets:set OPENROUTER_API_KEY
firebase functions:secrets:set MISTRAL_API_KEY

# Deploy functions
firebase deploy --only functions
```

## Security Rules

### Firestore Rules
Located in `firestore.rules`:
- Users can only read/write their own data
- Admins have full access
- Plan-based access control for premium features
- Validation of required fields

### Storage Rules
Located in `storage.rules`:
- Users can only access their own files
- File type validation (images, PDFs, documents)
- Size limits based on user plan
- Plan-based access for premium features

## Data Flow

### Authentication Flow
1. User signs in via Firebase Auth (Google/Apple/Email)
2. Firebase returns ID token
3. Token stored in browser (localStorage)
4. Token automatically refreshed
5. Token sent with API requests (optional)

### Data Synchronization Flow
1. Frontend subscribes to Firestore documents
2. Changes automatically sync in real-time
3. Offline changes queued and synced when online
4. Conflicts resolved automatically

### File Upload Flow
1. User selects file
2. File validated (type, size)
3. File uploaded directly to Firebase Storage
4. Download URL returned
5. URL stored in Firestore document

### AI Processing Flow
1. Frontend sends request to Cloud Functions
2. Functions verify authentication (optional)
3. Functions check rate limits
4. Functions call AI service (LLaMA/Mistral)
5. Response returned to frontend
6. Results stored in Firestore (optional)

## Best Practices

### 1. Always Use Firebase Services
- ✅ Use Firestore for all data storage
- ✅ Use Firebase Storage for all file uploads
- ✅ Use Cloud Functions for all server-side operations
- ❌ Don't use external databases or storage services

### 2. Security
- ✅ Always validate user permissions in security rules
- ✅ Use authentication middleware for sensitive operations
- ✅ Implement rate limiting for API endpoints
- ✅ Validate file types and sizes

### 3. Performance
- ✅ Use Firestore real-time listeners for live data
- ✅ Enable offline persistence for better UX
- ✅ Use Firestore indexes for complex queries
- ✅ Implement pagination for large datasets

### 4. Error Handling
- ✅ Handle network errors gracefully
- ✅ Provide user-friendly error messages
- ✅ Log errors for debugging
- ✅ Implement retry logic for transient failures

## Troubleshooting

### Emulator Connection Issues
- Ensure emulators are running: `firebase emulators:start`
- Check `VITE_USE_FIREBASE_EMULATOR` is set correctly
- Verify emulator ports are not in use

### Authentication Issues
- Check Firebase Console for enabled providers
- Verify authorized domains in Firebase Console
- Check browser console for CORS errors

### Firestore Permission Errors
- Review security rules in `firestore.rules`
- Check user authentication status
- Verify user has required plan/role

### Storage Upload Failures
- Check file size limits
- Verify file type is allowed
- Review storage rules
- Check user plan limits

### Cloud Functions Errors
- Check function logs: `firebase functions:log`
- Verify environment variables/secrets are set
- Check function timeout settings
- Review CORS configuration

## Migration from Separate Backend

If you were previously using a separate backend server:

1. **AI API Calls**: Now use Cloud Functions
   - Old: `http://localhost:5000/api/*`
   - New: `https://us-central1-PROJECT_ID.cloudfunctions.net/api/*`
   - Or: `http://localhost:5001/PROJECT_ID/us-central1/api/*` (emulator)

2. **Data Operations**: Already using Firestore (no changes needed)

3. **File Uploads**: Already using Firebase Storage (no changes needed)

4. **Authentication**: Already using Firebase Auth (no changes needed)

## Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
