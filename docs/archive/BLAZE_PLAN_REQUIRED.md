# Blaze Plan Required for Cloud Functions

## ⚠️ Important: Cloud Functions Requires Blaze Plan

Cloud Functions deployment requires the **Blaze (pay-as-you-go) plan**. The free Spark plan does not support Cloud Functions.

---

## Why Blaze Plan is Required

Cloud Functions uses several Google Cloud services that require the Blaze plan:
- ✅ Cloud Functions API
- ✅ Cloud Build API
- ✅ Artifact Registry API

These services are not available on the Spark (free) plan.

---

## Upgrade to Blaze Plan

### Step 1: Upgrade Your Firebase Project

1. **Visit the upgrade page**:
   - https://console.firebase.google.com/project/aira-learning-a3884/usage/details

2. **Click "Upgrade"** to switch to Blaze plan

3. **Complete the upgrade process** (takes a few minutes)

### Step 2: Understanding Blaze Plan Pricing

**Good News**: Blaze plan has a **generous free tier**:

#### Free Tier Limits (Monthly):
- **Cloud Functions**: 
  - 2 million invocations free
  - 400,000 GB-seconds compute time free
  - 200,000 CPU-seconds free
  
- **Cloud Firestore**:
  - 1 GB storage free
  - 50,000 reads/day free
  - 20,000 writes/day free
  - 20,000 deletes/day free

- **Firebase Storage**:
  - 5 GB storage free
  - 1 GB downloads/day free

- **Firebase Hosting**:
  - 10 GB storage free
  - 360 MB/day transfer free

**For most small to medium applications, you'll stay within the free tier!**

#### What You Pay For:
- Only pay for usage **beyond** the free tier limits
- Very affordable pricing (typically $0.40 per million function invocations after free tier)
- No upfront costs or monthly fees

---

## After Upgrading

Once you've upgraded to Blaze plan:

### Step 1: Deploy Functions

```bash
# Deploy functions
npm run deploy:functions
```

### Step 2: Verify Deployment

```bash
# Test the health endpoint
curl https://us-central1-aira-learning-a3884.cloudfunctions.net/api/health
```

### Step 3: Set Up API Keys

You can now use either method:

**Option A: Firebase Secrets (Recommended)**
```bash
firebase functions:secrets:set OPENROUTER_API_KEY
firebase functions:secrets:set MISTRAL_API_KEY
```

**Option B: Firebase Config (Legacy, but works)**
```bash
firebase functions:config:set openrouter.api_key="your-key"
firebase functions:config:set mistral.api_key="your-key"
```

---

## Alternative: Local Development Only

If you cannot upgrade to Blaze plan right now, you can:

1. **Develop locally** using Firebase Emulators:
   ```bash
   firebase emulators:start
   ```

2. **Use the separate backend server** for local development:
   ```bash
   cd backend
   npm install
   npm start
   ```

3. **Test the application** locally before deploying

However, for production deployment, you'll need the Blaze plan.

---

## Cost Estimation

For a typical AI tutoring application:

### Low Usage (100-1000 users):
- **Monthly Cost**: $0 (stays within free tier)
- Functions: ~50,000 invocations/month (well under 2M free)
- Firestore: ~5GB reads/month (well under free tier)
- Storage: ~2GB (under 5GB free)

### Medium Usage (1000-10,000 users):
- **Monthly Cost**: $5-20
- Functions: ~500,000 invocations/month
- Firestore: ~20GB reads/month
- Storage: ~10GB

### High Usage (10,000+ users):
- **Monthly Cost**: $50-200
- Functions: ~5M invocations/month
- Firestore: ~100GB reads/month
- Storage: ~50GB

**Most applications start at $0/month and scale gradually.**

---

## Upgrade Steps Summary

1. ✅ Visit: https://console.firebase.google.com/project/aira-learning-a3884/usage/details
2. ✅ Click "Upgrade" to Blaze plan
3. ✅ Complete upgrade (takes 2-5 minutes)
4. ✅ Deploy functions: `npm run deploy:functions`
5. ✅ Set API keys (Secrets or Config)
6. ✅ Test deployment

---

## Support

- **Firebase Pricing**: https://firebase.google.com/pricing
- **Blaze Plan Details**: https://firebase.google.com/pricing#blaze
- **Free Tier Limits**: https://firebase.google.com/pricing#blaze-free-tier

---

**Status**: Upgrade required for Cloud Functions deployment
**Action**: Upgrade to Blaze plan to proceed
