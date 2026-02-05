# Setup Instructions for Your Supabase Project

## ✅ Configuration Complete

Your Supabase credentials have been configured:
- **Project URL**: https://raezmmfgjkrivybtmptv.supabase.co
- **Project Ref**: `raezmmfgjkrivybtmptv`
- **Anon Key**: Configured in `.env`

## Next Steps

### 1. Deploy Database Schema

```powershell
cd "C:\Users\HP\Downloads\Project AIra\AIra"
supabase link --project-ref raezmmfgjkrivybtmptv
supabase db push
```

This will apply all database migrations from `supabase/migrations/`.

### 2. Set Edge Function Secrets

You need to set your AI API keys as secrets for the Edge Functions:

```powershell
supabase secrets set OPENROUTER_API_KEY=your_openrouter_key_here
supabase secrets set MISTRAL_API_KEY=your_mistral_key_here
supabase secrets set AI_PROVIDER=openrouter
supabase secrets set DOUBT_RESOLUTION_MODEL=llama
supabase secrets set AI_REQUEST_TIMEOUT_MS=60000
supabase secrets set APP_ORIGIN=https://raezmmfgjkrivybtmptv.supabase.co
```

**Or via Supabase Dashboard:**
1. Go to: https://supabase.com/dashboard/project/raezmmfgjkrivybtmptv/settings/functions
2. Click on "Secrets" tab
3. Add each secret:
   - `OPENROUTER_API_KEY` = Your OpenRouter API key
   - `MISTRAL_API_KEY` = Your Mistral API key (optional)
   - `AI_PROVIDER` = `openrouter`
   - `DOUBT_RESOLUTION_MODEL` = `llama`
   - `AI_REQUEST_TIMEOUT_MS` = `60000`
   - `APP_ORIGIN` = `https://raezmmfgjkrivybtmptv.supabase.co`

### 3. Deploy Edge Functions

```powershell
supabase functions deploy ai-api
```

### 4. Build and Test Frontend Locally

```powershell
npm install
npm run dev
```

The frontend will automatically use your Supabase project.

### 5. Deploy Frontend (Optional)

If you want to deploy the frontend to Supabase Hosting:

```powershell
npm run build
supabase hosting deploy dist
```

Or deploy to any static hosting service (Vercel, Netlify, etc.) with the `.env` file configured.

## Verify Everything Works

### Test Edge Function

```powershell
curl https://raezmmfgjkrivybtmptv.supabase.co/functions/v1/ai-api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "...",
  "provider": "openrouter",
  "models": { "llama": true, "mistral": false },
  "limits": { "maxPromptLength": 32000 },
  "version": "1.0.0"
}
```

### Test Frontend

1. Run: `npm run dev`
2. Open: http://localhost:3000
3. Sign up/Login
4. Test AI features:
   - Chat in Teaching panel
   - Generate notes
   - Resolve doubts
   - Generate quizzes

## Important Notes

### API Keys Required

You need to obtain:
- **OpenRouter API Key**: https://openrouter.ai/keys
- **Mistral API Key** (optional): https://console.mistral.ai/

### Project Structure

- **Frontend**: React app in `src/`
- **Backend**: Supabase Edge Function in `supabase/functions/ai-api/`
- **Database**: Migrations in `supabase/migrations/`
- **Config**: Environment variables in `.env`

### URLs

- **Supabase Dashboard**: https://supabase.com/dashboard/project/raezmmfgjkrivybtmptv
- **API URL**: https://raezmmfgjkrivybtmptv.supabase.co
- **Edge Functions**: https://raezmmfgjkrivybtmptv.supabase.co/functions/v1/ai-api

## Troubleshooting

### Edge Function Not Responding

1. Check secrets are set:
   ```powershell
   supabase secrets list
   ```

2. Check function logs:
   ```powershell
   supabase functions logs ai-api
   ```

### Frontend Can't Connect

1. Verify `.env` file exists and has correct values
2. Restart dev server: `npm run dev`
3. Check browser console for errors

### Database Issues

1. Verify migrations applied:
   ```powershell
   supabase db remote get
   ```

2. Check RLS policies in Supabase Dashboard

## Support

- **Supabase Docs**: https://supabase.com/docs
- **Edge Functions**: https://supabase.com/docs/guides/functions
- **Project Dashboard**: https://supabase.com/dashboard/project/raezmmfgjkrivybtmptv
