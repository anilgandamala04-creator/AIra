# Firebase Storage Setup Guide

## Quick Setup Instructions

Firebase Storage must be initialized in the Firebase Console before you can deploy storage rules or use storage features.

### Step-by-Step Instructions

1. **Open Firebase Console**
   - Go to: https://console.firebase.google.com/project/aira-27a47/storage
   - Or navigate: Firebase Console → Select project `aira-27a47` → Storage (in left sidebar)

2. **Initialize Storage**
   - Click the **"Get Started"** button
   - You'll see a setup wizard

3. **Choose Security Rules Mode**
   - **Production mode** (Recommended): Uses your `storage.rules` file
   - **Test mode** (Development only): Allows read/write for 30 days, then switches to production mode
   - Select **"Start in production mode"**

4. **Select Storage Location**
   - Choose a location for your storage bucket
   - Recommended: `us-central1` (same region as Firestore for better performance)
   - Or choose a location closer to your users
   - Click **"Done"**

5. **Verify Setup**
   - You should see the Storage dashboard
   - The bucket URL will be: `gs://aira-27a47.firebasestorage.app`

### After Setup

Once Storage is initialized, you can:

1. **Deploy Storage Rules**:
   ```bash
   firebase deploy --only storage
   ```

2. **Deploy Everything**:
   ```bash
   firebase deploy
   ```

### Troubleshooting

**Error: "Firebase Storage has not been set up"**
- Solution: Complete the steps above to initialize Storage in the console
- This is a one-time setup per Firebase project

**Error: "Storage rules deployment failed"**
- Make sure Storage is initialized first
- Check that `storage.rules` file exists and is valid
- Verify you have the correct Firebase project selected: `firebase use aira-27a47`

**Storage Location Selection**
- Once set, the location cannot be changed
- Choose carefully based on where your users are located
- `us-central1` is a good default for global applications

### Storage Rules

After initialization, your `storage.rules` file will be used to control access. The rules are defined in `AIra/storage.rules` and include:

- File size limits (10MB for Simple plan, 50MB for Pro/Enterprise)
- File type validation (images, PDFs, DOC files)
- Plan-based access control
- User ownership validation

---

**Note**: This is a one-time setup. Once Storage is initialized, you won't need to do this again unless you create a new Firebase project.
