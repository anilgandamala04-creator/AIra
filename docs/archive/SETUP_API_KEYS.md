# Setting Up API Keys for Cloud Functions

## ⚠️ IMPORTANT: Security Best Practices

**NEVER commit API keys to version control!** Always use Firebase Secrets for sensitive credentials.

---

## Step 1: Set Firebase Secrets

Run these commands to securely store your API keys:

```bash
# Navigate to project root
cd AIra

# Make sure you're using the correct Firebase project
firebase use aira-learning-a3884

# Set OpenRouter API Key
echo "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" | firebase functions:secrets:set OPENROUTER_API_KEY

# Set Mistral API Key
echo "e5feb740-569e-47d8-bf3e-3f0a1e359862" | firebase functions:secrets:set MISTRAL_API_KEY
```

Or set them interactively (more secure, keys won't appear in terminal history):

```bash
# Set OpenRouter API Key (will prompt for input)
firebase functions:secrets:set OPENROUTER_API_KEY
# When prompted, paste: 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

# Set Mistral API Key (will prompt for input)
firebase functions:secrets:set MISTRAL_API_KEY
# When prompted, paste: e5feb740-569e-47d8-bf3e-3f0a1e359862
```

---

## Step 2: Verify Secrets Are Set

```bash
# List all secrets (names only, not values)
firebase functions:secrets:access
```

---

## Step 3: Update Functions Code (if needed)

The Cloud Functions code already reads from environment variables and Firebase Secrets. Verify the configuration in `functions/src/services/aiService.ts`:

- ✅ Reads from `process.env.OPENROUTER_API_KEY` (set via secrets)
- ✅ Reads from `process.env.MISTRAL_API_KEY` (set via secrets)
- ✅ Falls back to `functions.config()` for backward compatibility

---

## Step 4: Deploy Functions

After setting secrets, deploy the functions:

```bash
# Deploy functions
npm run deploy:functions

# Or deploy everything
npm run deploy:all
```

---

## Step 5: Test the API

After deployment, test the health endpoint:

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

## For Local Development (Emulators)

If you want to test locally with emulators, create a `.env` file in the `functions/` directory:

```bash
# functions/.env (DO NOT COMMIT THIS FILE)
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
```

**Important**: Add `functions/.env` to `.gitignore` to prevent committing it!

---

## Security Checklist

- ✅ API keys stored as Firebase Secrets (not in code)
- ✅ `.env` files added to `.gitignore`
- ✅ No API keys in version control
- ✅ Secrets only accessible to Cloud Functions
- ✅ Environment variables used in code (not hardcoded)

---

## Troubleshooting

### Secrets Not Working?

1. **Verify secrets are set**:
   ```bash
   firebase functions:secrets:access
   ```

2. **Check function logs**:
   ```bash
   firebase functions:log
   ```

3. **Verify function code** reads from environment:
   - Check `functions/src/services/aiService.ts`
   - Should use `process.env.OPENROUTER_API_KEY`
   - Should use `process.env.MISTRAL_API_KEY`

### Functions Can't Access Secrets?

- Make sure you've deployed functions AFTER setting secrets
- Secrets are automatically injected into function environment
- Restart functions if using emulators

---

## Next Steps

1. ✅ Set secrets using commands above
2. ✅ Deploy functions: `npm run deploy:functions`
3. ✅ Test health endpoint
4. ✅ Verify AI features work in the application

---

**Status**: Ready to configure
**Security**: ✅ Using Firebase Secrets (secure)
