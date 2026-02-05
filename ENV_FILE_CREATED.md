# .env File Created

Your `.env` file has been created with the following configuration:

## ✅ Configured Variables

- **VITE_SUPABASE_URL**: https://raezmmfgjkrivybtmptv.supabase.co
- **VITE_SUPABASE_ANON_KEY**: Configured
- **OPENROUTER_API_KEY**: Configured
- **MISTRAL_API_KEY**: Configured

## Next Steps

### 1. Set Edge Function Secrets

Since Edge Functions run server-side, you need to set the API keys as Supabase secrets:

```powershell
supabase secrets set OPENROUTER_API_KEY=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
supabase secrets set MISTRAL_API_KEY=Jv4RWnFn75DMPugyvnSEAnPmhTgyrAb0
supabase secrets set AI_PROVIDER=openrouter
supabase secrets set DOUBT_RESOLUTION_MODEL=llama
supabase secrets set AI_REQUEST_TIMEOUT_MS=60000
supabase secrets set APP_ORIGIN=https://raezmmfgjkrivybtmptv.supabase.co
```

**Or via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/raezmmfgjkrivybtmptv/settings/functions
2. Click "Secrets" tab
3. Add each secret:
   - `OPENROUTER_API_KEY` = `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`
   - `MISTRAL_API_KEY` = `Jv4RWnFn75DMPugyvnSEAnPmhTgyrAb0`
   - `AI_PROVIDER` = `openrouter`
   - `DOUBT_RESOLUTION_MODEL` = `llama`
   - `AI_REQUEST_TIMEOUT_MS` = `60000`
   - `APP_ORIGIN` = `https://raezmmfgjkrivybtmptv.supabase.co`

### 2. Deploy Database

```powershell
supabase link --project-ref raezmmfgjkrivybtmptv
supabase db push
```

### 3. Deploy Edge Functions

```powershell
supabase functions deploy ai-api
```

### 4. Test Locally

```powershell
npm run dev
```

The frontend will automatically use your Supabase project and the Edge Functions will use the secrets you set.

## Security Note

⚠️ **Important**: The `.env` file contains sensitive keys. Make sure:
- It's in `.gitignore` (it should be by default)
- Never commit it to version control
- Don't share it publicly

The Edge Function secrets are stored securely in Supabase and are not exposed to the frontend.
