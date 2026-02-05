# Setting Environment Variables for Firebase Functions

Firebase has deprecated the old `functions.config()` API. This guide shows you how to set environment variables using the modern approach.

## Option 1: Using Firebase Secrets (Recommended)

Firebase Secrets is the modern, secure way to store sensitive data:

```bash
# Set OpenRouter API key
firebase functions:secrets:set OPENROUTER_API_KEY

# When prompted, paste your API key:
# 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

# Set Mistral API key (optional)
firebase functions:secrets:set MISTRAL_API_KEY
```

Then update your `functions/src/index.ts` to access secrets:

```typescript
import { defineSecret } from 'firebase-functions/params';

const openrouterApiKey = defineSecret('OPENROUTER_API_KEY');
```

## Option 2: Using Legacy Config (Temporary)

If you need to use the legacy system temporarily:

1. **Enable legacy commands**:
   ```bash
   firebase experiments:enable legacyRuntimeConfigCommands
   ```

2. **Login to Firebase** (if not already):
   ```bash
   firebase login
   ```

3. **Set the config**:
   ```bash
   firebase functions:config:set openrouter.api_key="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"
   ```

**Note**: This method is deprecated and will stop working in March 2026.

## Option 3: Using .env File (Local Development Only)

For local development, create a `.env` file in the `functions` directory:

```env
OPENROUTER_API_KEY=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
```

**Important**: Never commit `.env` files to version control!

## Current Implementation

The functions code has been updated to support:
1. **Environment variables** (`process.env.*`) - Modern approach
2. **Legacy functions.config()** - For backward compatibility

This means you can use either method, and the code will automatically detect which one is available.

## Verification

After setting your API keys, verify they're accessible:

```bash
# Check legacy config
firebase functions:config:get

# Or check environment variables (if using secrets)
firebase functions:secrets:access OPENROUTER_API_KEY
```

## Next Steps

1. Set your API keys using one of the methods above
2. Deploy your functions:
   ```bash
   npm run deploy:functions
   ```
3. Test the health endpoint:
   ```bash
   curl https://us-central1-aira-b2eb4.cloudfunctions.net/api/health
   ```

## Security Best Practices

- ✅ Use Firebase Secrets for production
- ✅ Never commit API keys to version control
- ✅ Rotate API keys regularly
- ✅ Use different keys for development and production
- ✅ Monitor API usage in your provider dashboard
