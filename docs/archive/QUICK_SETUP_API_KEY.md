# Quick Setup: OpenRouter API Key

Your OpenRouter API key has been configured for **local development**. Here's what was done and what you need to do next.

## ✅ What Was Done

1. ✅ Created `.env` file in `functions/` directory with your API key
2. ✅ Installed `dotenv` package to load environment variables
3. ✅ Updated functions code to read from environment variables
4. ✅ Code supports both legacy config and new environment variables

## 🧪 Test Locally

You can now test the functions locally:

```bash
cd functions
npm run serve
```

This will start the Firebase emulator with your API key loaded.

## 🚀 For Production Deployment

For production, you need to set the API key in Firebase. You have two options:

### Option 1: Firebase Secrets (Recommended - Modern)

```bash
# Login to Firebase first
firebase login

# Set the secret (you'll be prompted to paste the key)
firebase functions:secrets:set OPENROUTER_API_KEY

# When prompted, paste:
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
```

Then update `functions/src/index.ts` to use secrets (see Firebase docs).

### Option 2: Legacy Config (Works Now, Deprecated)

```bash
# Login to Firebase first
firebase login

# Enable legacy commands
firebase experiments:enable legacyRuntimeConfigCommands

# Set the config
firebase functions:config:set openrouter.api_key="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"
```

**Note**: This method will stop working in March 2026.

## 📝 Current Status

- ✅ **Local Development**: API key is set in `.env` file
- ⚠️ **Production**: You need to set it in Firebase (see above)

## 🔍 Verify It Works

After setting up, test the health endpoint:

```bash
# Local
curl http://localhost:5001/aira-b2eb4/us-central1/api/health

# Production (after deployment)
curl https://us-central1-aira-b2eb4.cloudfunctions.net/api/health
```

You should see:
```json
{
  "status": "ok",
  "models": {
    "llama": true,
    "mistral": false
  }
}
```

## 🔒 Security Note

- ✅ `.env` file is in `.gitignore` (won't be committed)
- ⚠️ Never commit API keys to version control
- ✅ Use Firebase Secrets for production

## 🎯 Next Steps

1. **Test locally**: `cd functions && npm run serve`
2. **Login to Firebase**: `firebase login`
3. **Set production key**: Use one of the methods above
4. **Deploy**: `npm run deploy:functions`

---

**Your API key is ready for local development!** 🎉
