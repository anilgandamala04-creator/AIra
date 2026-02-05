# Quick Start: Setting Up API Keys

## 🚀 Quick Setup (2 minutes)

### Option 1: Firebase Functions Config (Works on Spark/Free Plan) ✅

```bash
# Make sure you're in the project directory
cd AIra

# Use the correct Firebase project
firebase use aira-learning-a3884

# Set OpenRouter API Key
firebase functions:config:set openrouter.api_key="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"

# Set Mistral API Key
firebase functions:config:set mistral.api_key="e5feb740-569e-47d8-bf3e-3f0a1e359862"
```

### Option 2: Firebase Secrets (Requires Blaze Plan)

If you've upgraded to Blaze plan:

```bash
# Set OpenRouter API Key
firebase functions:secrets:set OPENROUTER_API_KEY
# Paste when prompted: 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

# Set Mistral API Key
firebase functions:secrets:set MISTRAL_API_KEY
# Paste when prompted: e5feb740-569e-47d8-bf3e-3f0a1e359862
```

### Step 2: Deploy Functions

```bash
npm run deploy:functions
```

### Step 3: Test

```bash
curl https://us-central1-aira-learning-a3884.cloudfunctions.net/api/health
```

You should see:
```json
{
  "status": "ok",
  "models": {
    "llama": true,
    "mistral": true
  }
}
```

---

## ✅ Done!

Your API keys are now securely configured and the AI backend is ready to use.

---

## For Local Development

If you want to test with emulators, create `functions/.env`:

```bash
# Create .env file in functions directory
cat > functions/.env << EOF
OPENROUTER_API_KEY=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
MISTRAL_API_KEY=e5feb740-569e-47d8-bf3e-3f0a1e359862
EOF
```

**Note**: The `.gitignore` file already excludes `functions/.env` from version control.

---

## Troubleshooting

**Secrets not working?**
- Make sure you deployed functions AFTER setting secrets
- Check logs: `firebase functions:log`

**Need help?**
- See `SETUP_API_KEYS.md` for detailed instructions
