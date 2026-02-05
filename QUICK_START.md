# Quick Start Guide

## ✅ Your Supabase Project is Configured

- **Project URL**: https://raezmmfgjkrivybtmptv.supabase.co
- **Project Ref**: `raezmmfgjkrivybtmptv`
- **Anon Key**: See `.env.template`

## Step 1: Create .env File

Copy the template and create your `.env` file:

```powershell
cd "C:\Users\HP\Downloads\Project AIra\AIra"
Copy-Item ".env.template" ".env"
```

Or manually create `.env` with:
```env
VITE_SUPABASE_URL=https://raezmmfgjkrivybtmptv.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZXptbWZnamtyaXZ5YnRtcHR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMTE5ODMsImV4cCI6MjA4NTc4Nzk4M30.6amB-3Ju9mize9PSXdYkuDLZKLeK4TS79nX7_bk6nC4
```

## Step 2: Install Supabase CLI

See `MANUAL_INSTALL_SUPABASE.md` for installation instructions.

## Step 3: Link Your Project

```powershell
supabase login
supabase link --project-ref raezmmfgjkrivybtmptv
```

## Step 4: Deploy Database

```powershell
supabase db push
```

## Step 5: Set Edge Function Secrets

You need your AI API keys. Get them from:
- **OpenRouter**: https://openrouter.ai/keys
- **Mistral** (optional): https://console.mistral.ai/

Then set secrets:

```powershell
supabase secrets set OPENROUTER_API_KEY=your_key_here
supabase secrets set MISTRAL_API_KEY=your_key_here
supabase secrets set AI_PROVIDER=openrouter
supabase secrets set DOUBT_RESOLUTION_MODEL=llama
supabase secrets set AI_REQUEST_TIMEOUT_MS=60000
supabase secrets set APP_ORIGIN=https://raezmmfgjkrivybtmptv.supabase.co
```

**Or via Dashboard:**
1. Go to: https://supabase.com/dashboard/project/raezmmfgjkrivybtmptv/settings/functions
2. Click "Secrets" tab
3. Add the secrets listed above

## Step 6: Deploy Edge Functions

```powershell
supabase functions deploy ai-api
```

## Step 7: Test Locally

```powershell
npm install
npm run dev
```

Open http://localhost:3000 and test the application!

## Step 8: Deploy Frontend (Optional)

```powershell
npm run build
supabase hosting deploy dist
```

Or deploy to Vercel, Netlify, or any static hosting service.

## Verify Deployment

Test the Edge Function:
```powershell
curl https://raezmmfgjkrivybtmptv.supabase.co/functions/v1/ai-api/health
```

## Need Help?

- **Setup Instructions**: `SETUP_INSTRUCTIONS.md`
- **Deployment Guide**: `SUPABASE_DEPLOYMENT.md`
- **Installation Help**: `MANUAL_INSTALL_SUPABASE.md`
