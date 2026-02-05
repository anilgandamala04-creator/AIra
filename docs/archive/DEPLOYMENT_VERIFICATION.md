# Deployment Verification Checklist

This document ensures the complete application is fully integrated, operational, and deployed on Firebase with all services properly configured.

## ✅ Pre-Deployment Checklist

### 1. Firebase Project Configuration

- [ ] **Firebase project upgraded to Blaze plan** (Required for Cloud Functions)
  - [ ] Visit: https://console.firebase.google.com/project/aira-learning-a3884/usage/details
  - [ ] Click "Upgrade" to Blaze (pay-as-you-go) plan
  - [ ] Note: Blaze has generous free tier, you only pay for usage beyond free limits
- [ ] Firebase project created and initialized
- [ ] Firebase CLI installed and authenticated (`firebase login`)
- [ ] Project ID configured in `firebase.json` and `src/lib/firebase.ts`
- [ ] All Firebase services enabled:
  - [ ] Authentication
  - [ ] Firestore Database
  - [ ] Storage
  - [ ] Cloud Functions (requires Blaze plan)
  - [ ] Hosting

### 2. Environment Variables

**Frontend** (`.env` or Firebase Hosting environment):
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

**Cloud Functions** (Firebase Secrets):
```bash
# Set required secrets
firebase functions:secrets:set OPENROUTER_API_KEY
firebase functions:secrets:set MISTRAL_API_KEY

# Optional: Set additional configuration
firebase functions:config:set ai.provider="openrouter"
firebase functions:config:set ai.request_timeout_ms="60000"
```

### 3. Security Rules

- [ ] Firestore rules deployed (`firestore.rules`)
- [ ] Storage rules deployed (`storage.rules`)
- [ ] Rules tested and validated
- [ ] User access properly restricted
- [ ] Plan-based access control working

### 4. Authentication Providers

- [ ] Google Sign-in enabled in Firebase Console
- [ ] Apple Sign-in enabled (if needed)
- [ ] Email/Password authentication enabled
- [ ] Authorized domains configured
- [ ] OAuth redirect URLs configured

### 5. Cloud Functions

- [ ] Functions code compiled (`npm run build` in `functions/`)
- [ ] All dependencies installed
- [ ] Environment variables/secrets configured
- [ ] Functions tested locally with emulator
- [ ] Functions deployed successfully

### 6. Frontend Build

- [ ] TypeScript compilation successful (`npm run build`)
- [ ] No build errors or warnings
- [ ] All environment variables resolved
- [ ] Production build optimized
- [ ] Static assets generated correctly

## ✅ Integration Verification

### 1. Authentication Flow

**Test Steps**:
1. Navigate to login page
2. Test Google sign-in
3. Test Apple sign-in (if enabled)
4. Test Email/Password sign-in
5. Test password reset
6. Verify session persistence after page reload
7. Test sign-out

**Expected Results**:
- ✅ All sign-in methods work
- ✅ User redirected after authentication
- ✅ Session persists across page reloads
- ✅ User data loaded from Firestore

### 2. AI Backend Connectivity

**Test Steps**:
1. Check health endpoint: `GET /health`
2. Test content generation
3. Test doubt resolution
4. Test teaching content generation
5. Test quiz generation
6. Verify error handling for timeouts
7. Verify error handling for network failures

**Expected Results**:
- ✅ Health check returns available models
- ✅ All AI endpoints respond correctly
- ✅ Timeout errors handled gracefully
- ✅ Network errors show user-friendly messages
- ✅ Fallback models work when primary fails

### 3. Database Operations

**Test Steps**:
1. Create user profile
2. Update user settings
3. Create teaching session
4. Save doubt
5. Generate and save note
6. Create flashcard
7. Create mind map
8. Verify real-time sync across tabs

**Expected Results**:
- ✅ All CRUD operations work
- ✅ Real-time updates sync immediately
- ✅ Offline persistence works
- ✅ Data persists after page reload

### 4. File Storage

**Test Steps**:
1. Upload avatar image
2. Upload document (PDF, DOCX)
3. Download uploaded file
4. Delete file
5. Verify file size limits
6. Verify file type validation

**Expected Results**:
- ✅ Files upload successfully
- ✅ Download URLs work
- ✅ File size limits enforced
- ✅ File type validation works
- ✅ Files accessible only by owner

### 5. All Panels Functionality

#### Home Panel
- [ ] Dashboard loads correctly
- [ ] Analytics display correctly
- [ ] Progress tracking works
- [ ] Quick actions functional

#### Teaching Panel
- [ ] Teaching session starts
- [ ] AI content generates
- [ ] Speech synthesis works
- [ ] Doubt resolution works
- [ ] Progress tracking updates
- [ ] Session saves to Firestore

#### Chat Panel
- [ ] Chat interface loads
- [ ] Messages send/receive
- [ ] AI responses generate
- [ ] Conversation history saves
- [ ] File uploads work (if enabled)

#### Studio Panel
- [ ] Resource generation works
- [ ] Notes generation works
- [ ] Mind map generation works
- [ ] Flashcard generation works
- [ ] All resources save to Firestore

#### Profile Panel
- [ ] Profile displays correctly
- [ ] Settings update works
- [ ] Preferences save
- [ ] Account management works

## ✅ Performance & Reliability

### 1. Error Handling

- [ ] Network errors handled gracefully
- [ ] Timeout errors show user-friendly messages
- [ ] API errors display appropriate feedback
- [ ] Error boundaries catch React errors
- [ ] Retry logic works for transient failures

### 2. Connectivity

- [ ] Works with stable internet
- [ ] Handles intermittent connectivity
- [ ] Offline mode works (Firestore persistence)
- [ ] Reconnection after network loss
- [ ] No infinite loading states

### 3. Timeout Management

- [ ] Request timeouts configured (60s default)
- [ ] Timeout errors show clear messages
- [ ] Long-running operations handled
- [ ] No hanging requests

### 4. Retry Logic

- [ ] Automatic retry on transient failures
- [ ] Exponential backoff implemented
- [ ] Fallback models work
- [ ] Maximum retry limits enforced

## ✅ Deployment Steps

### 1. Build Application

```bash
# Install dependencies
npm install

# Build frontend
npm run build

# Build functions
cd functions
npm install
npm run build
cd ..
```

### 2. Deploy to Firebase

```bash
# Deploy everything
npm run deploy:all

# Or deploy individually:
npm run deploy:hosting    # Frontend
npm run deploy:functions  # Backend API
npm run deploy:rules      # Security rules
```

### 3. Verify Deployment

```bash
# Check hosting
firebase hosting:channel:list

# Check functions
firebase functions:list

# View logs
firebase functions:log
```

### 4. Post-Deployment Testing

1. **Access Application**:
   - Visit `https://your-project.web.app`
   - Verify site loads correctly
   - Check console for errors

2. **Test Authentication**:
   - Sign in with all methods
   - Verify redirects work
   - Check session persistence

3. **Test AI Features**:
   - Generate content
   - Resolve doubts
   - Create teaching sessions
   - Verify all AI endpoints work

4. **Test Data Operations**:
   - Create/update user data
   - Verify Firestore writes
   - Check real-time sync
   - Test offline mode

5. **Test File Operations**:
   - Upload files
   - Download files
   - Verify storage rules

## ✅ Monitoring & Maintenance

### 1. Firebase Console

- [ ] Monitor function invocations
- [ ] Check error rates
- [ ] Monitor storage usage
- [ ] Review Firestore reads/writes
- [ ] Check authentication metrics

### 2. Logs

- [ ] Function logs reviewed
- [ ] Error logs monitored
- [ ] Performance logs checked
- [ ] User feedback collected

### 3. Alerts

- [ ] Error rate alerts configured
- [ ] Function timeout alerts
- [ ] Storage quota alerts
- [ ] Authentication failure alerts

## ✅ Troubleshooting

### Common Issues

1. **Functions Not Deploying**:
   - Check Node.js version (should be 18)
   - Verify dependencies installed
   - Check build errors
   - Review function logs

2. **Authentication Not Working**:
   - Verify providers enabled
   - Check authorized domains
   - Review OAuth configuration
   - Check redirect URLs

3. **AI Backend Not Responding**:
   - Verify API keys set
   - Check function logs
   - Test health endpoint
   - Verify CORS configuration

4. **Database Errors**:
   - Review security rules
   - Check user permissions
   - Verify data structure
   - Review Firestore indexes

5. **Storage Upload Failures**:
   - Check file size limits
   - Verify file types allowed
   - Review storage rules
   - Check user plan limits

## ✅ Success Criteria

The application is considered fully operational when:

- ✅ All authentication methods work
- ✅ All AI features functional
- ✅ All panels load and work correctly
- ✅ Database operations succeed
- ✅ File uploads/downloads work
- ✅ Real-time sync works
- ✅ Offline mode functional
- ✅ Error handling graceful
- ✅ No console errors
- ✅ Performance acceptable
- ✅ All services deployed on Firebase

## Quick Verification Commands

```bash
# Check Firebase project
firebase projects:list

# Check functions status
firebase functions:list

# View recent logs
firebase functions:log --limit 50

# Test locally with emulators
firebase emulators:start

# Deploy specific service
firebase deploy --only hosting
firebase deploy --only functions
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

## Support

- **Firebase Console**: https://console.firebase.google.com
- **Documentation**: See `docs/FIREBASE_CORE_BACKEND.md`
- **Firebase Support**: https://firebase.google.com/support
