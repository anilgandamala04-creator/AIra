# Firebase Project Configuration Update

## ✅ Updated Configuration

The Firebase project configuration has been updated to use the new project: **`aira-learning-a3884`**

### Updated Files

1. **`src/lib/firebase.ts`**
   - Updated all Firebase configuration values
   - New project ID: `aira-learning-a3884`
   - New API key, auth domain, storage bucket, etc.

2. **`src/services/aiApi.ts`**
   - Updated default project ID references
   - Updated emulator URLs
   - Updated fallback URLs

3. **`functions/src/index.ts`**
   - Updated CORS allowed origins
   - Updated production domain references

4. **`functions/src/services/aiService.ts`**
   - Updated HTTP-Referer header default

### New Firebase Configuration

```javascript
{
  apiKey: "AIzaSyAY0VyCT7ZzUdwv8Nju_04da7c8rK1DUME",
  authDomain: "aira-learning-a3884.firebaseapp.com",
  projectId: "aira-learning-a3884",
  storageBucket: "aira-learning-a3884.firebasestorage.app",
  messagingSenderId: "746684948575",
  appId: "1:746684948575:web:848c5bfc3f35b31074bbea",
  measurementId: "G-8TQZH778C8"
}
```

### Updated URLs

**Hosting:**
- Primary: `https://aira-learning-a3884.web.app`
- Alternative: `https://aira-learning-a3884.firebaseapp.com`

**Cloud Functions:**
- Production: `https://us-central1-aira-learning-a3884.cloudfunctions.net/api`
- Emulator: `http://localhost:5001/aira-learning-a3884/us-central1/api`

### Next Steps

1. **Initialize Firebase Project** (if not already done):
   ```bash
   firebase use aira-learning-a3884
   ```

2. **Set up .firebaserc** (if needed):
   ```json
   {
     "projects": {
       "default": "aira-learning-a3884"
     }
   }
   ```

3. **Configure Environment Variables** (optional, for overrides):
   ```env
   VITE_FIREBASE_API_KEY=AIzaSyAY0VyCT7ZzUdwv8Nju_04da7c8rK1DUME
   VITE_FIREBASE_AUTH_DOMAIN=aira-learning-a3884.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=aira-learning-a3884
   VITE_FIREBASE_STORAGE_BUCKET=aira-learning-a3884.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=746684948575
   VITE_FIREBASE_APP_ID=1:746684948575:web:848c5bfc3f35b31074bbea
   VITE_FIREBASE_MEASUREMENT_ID=G-8TQZH778C8
   ```

4. **Deploy to New Project**:
   ```bash
   # Make sure you're using the correct project
   firebase use aira-learning-a3884
   
   # Deploy all services
   npm run deploy:all
   ```

### Verification

After deployment, verify:
- ✅ Application loads at: `https://aira-learning-a3884.web.app`
- ✅ Authentication works
- ✅ Cloud Functions accessible at: `https://us-central1-aira-learning-a3884.cloudfunctions.net/api`
- ✅ Firestore database accessible
- ✅ Storage accessible

### Important Notes

- The configuration uses environment variables as the primary source, with the new values as fallbacks
- All hardcoded project IDs have been updated
- Emulator URLs have been updated for local development
- CORS origins have been updated in Cloud Functions

---

**Status**: ✅ Configuration updated successfully
**Project ID**: `aira-learning-a3884`
