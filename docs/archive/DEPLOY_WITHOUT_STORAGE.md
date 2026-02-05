# Deploy Without Storage (Temporary Workaround)

If you haven't initialized Firebase Storage yet, you can deploy Firestore rules and Hosting first, then add Storage later.

## Option 1: Deploy Without Storage (Recommended)

I've temporarily removed Storage from `firebase.json`. You can now deploy:

```bash
cd "C:\Users\HP\Downloads\Project AIra\AIra"
npm run build
firebase deploy
```

This will deploy:
- ✅ Firestore rules
- ✅ Hosting
- ❌ Storage (skipped)

## Option 2: Deploy Specific Services

Deploy only what you need:

```bash
# Deploy Firestore rules only
firebase deploy --only firestore:rules

# Deploy Hosting only
firebase deploy --only hosting

# Deploy both
firebase deploy --only firestore:rules,hosting
```

## After Initializing Storage

Once you've initialized Storage in the Firebase Console:

1. Restore the storage configuration in `firebase.json`:
   ```json
   {
     "firestore": {
       "rules": "firestore.rules"
     },
     "storage": {
       "rules": "storage.rules"
     },
     "hosting": { ... }
   }
   ```

2. Deploy Storage rules:
   ```bash
   firebase deploy --only storage
   ```

## Initialize Storage

To initialize Storage:

1. Go to: https://console.firebase.google.com/project/aira-27a47/storage
2. Click **"Get Started"**
3. Choose **"Start in production mode"**
4. Select location (e.g., `us-central1`)
5. Click **"Done"**

See `STORAGE_SETUP.md` for detailed instructions.
