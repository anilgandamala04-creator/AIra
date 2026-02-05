# Setting Up API Keys (Spark Plan - No Blaze Required)

## ⚠️ Important: Spark Plan Limitation

Firebase Secrets require the **Blaze (pay-as-you-go) plan**. If you're on the **Spark (free) plan**, use Firebase Functions Config instead.

---

## Option 1: Use Firebase Functions Config (Works on Spark Plan)

This method works on the free Spark plan and is the recommended approach for now.

### Step 1: Set Configuration Values

```bash
# Navigate to project
cd AIra

# Make sure you're using the correct Firebase project
firebase use aira-learning-a3884

# Set OpenRouter API Key
firebase functions:config:set openrouter.api_key="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"

# Set Mistral API Key
firebase functions:config:set mistral.api_key="e5feb740-569e-47d8-bf3e-3f0a1e359862"
```

### Step 2: Verify Configuration

```bash
# View current config (values will be masked)
firebase functions:config:get
```

### Step 3: Deploy Functions

```bash
# Deploy functions
npm run deploy:functions

# Or deploy everything
npm run deploy:all
```

### Step 4: Test the API

```bash
# Test production endpoint
curl https://us-central1-aira-learning-a3884.cloudfunctions.net/api/health

# Expected response:
# {
#   "status": "ok",
#   "models": {
#     "llama": true,
#     "mistral": true
#   },
#   ...
# }
```

---

## Option 2: Upgrade to Blaze Plan (Recommended for Production)

If you want to use the more secure Firebase Secrets method:

1. **Upgrade to Blaze Plan**:
   - Visit: https://console.firebase.google.com/project/aira-learning-a3884/usage/details
   - Click "Upgrade" to Blaze plan
   - **Note**: Blaze plan has a free tier, you only pay for what you use beyond the free limits

2. **Then use Secrets** (see `SETUP_API_KEYS.md`):
   ```bash
   firebase functions:secrets:set OPENROUTER_API_KEY
   firebase functions:secrets:set MISTRAL_API_KEY
   ```

---

## For Local Development (Emulators)

Create a `.env` file in the `functions/` directory:

```bash
# Create .env file in functions directory
cat > functions/.env << EOF
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
EOF
```

**Important**: The `.gitignore` file already excludes `functions/.env` from version control.

---

## How It Works

The functions code (`functions/src/services/aiService.ts`) supports both methods:

1. **First tries**: Environment variables (`process.env.OPENROUTER_API_KEY`)
2. **Falls back to**: Firebase Config (`functions.config().openrouter.api_key`)

So both methods work seamlessly!

---

## Quick Setup (Spark Plan)

```bash
# Set config values
firebase functions:config:set openrouter.api_key="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"
firebase functions:config:set mistral.api_key="e5feb740-569e-47d8-bf3e-3f0a1e359862"

# Deploy
npm run deploy:functions

# Test
curl https://us-central1-aira-learning-a3884.cloudfunctions.net/api/health
```

---

## Security Notes

- ✅ Config values are encrypted at rest
- ✅ Values are masked in logs
- ✅ Only accessible to Cloud Functions
- ✅ Not exposed to client-side code

---

## Troubleshooting

### Config Not Working?

1. **Verify config is set**:
   ```bash
   firebase functions:config:get
   ```

2. **Check function logs**:
   ```bash
   firebase functions:log
   ```

3. **Verify function code** reads from config:
   - Check `functions/src/services/aiService.ts`
   - Should use `getConfigValue('openrouter.api_key')`
   - Should use `getConfigValue('mistral.api_key')`

### Functions Can't Access Config?

- Make sure you deployed functions AFTER setting config
- Config is automatically injected into function environment
- Restart functions if using emulators

---

## Next Steps

1. ✅ Set config using commands above
2. ✅ Deploy functions: `npm run deploy:functions`
3. ✅ Test health endpoint
4. ✅ Verify AI features work in the application

---

**Status**: Ready to configure (Spark Plan compatible)
**Method**: Firebase Functions Config ✅
