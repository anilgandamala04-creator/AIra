# Troubleshooting Supabase CLI Access Issues

## Error: "Your account does not have the necessary privileges"

This error means either:
1. You're not logged in to Supabase CLI
2. You don't have the right permissions on the project
3. You need to use a different authentication method

## Solutions

### Solution 1: Re-authenticate with Supabase CLI

```powershell
# Logout first (if logged in)
supabase logout

# Login again
supabase login
```

This will open your browser to authenticate. Make sure you:
- Log in with the same account that owns/accesses the project
- Grant all requested permissions

### Solution 2: Check Project Access

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard/project/raezmmfgjkrivybtmptv
2. **Verify you can access the project** - If you can't see it, you don't have access
3. **Check Settings → Team** - Make sure your account has proper permissions

### Solution 3: Use Access Token Instead

If you have an access token from Supabase:

```powershell
# Set access token as environment variable
$env:SUPABASE_ACCESS_TOKEN = "your-access-token-here"
supabase link --project-ref raezmmfgjkrivybtmptv
```

To get an access token:
1. Go to: https://supabase.com/dashboard/account/tokens
2. Create a new access token
3. Copy and use it

### Solution 4: Use Database Password Instead

You can link using the database password:

```powershell
supabase link --project-ref raezmmfgjkrivybtmptv --password YOUR_DB_PASSWORD
```

Get your database password from:
- Supabase Dashboard → Project Settings → Database → Database password

### Solution 5: Deploy Without Linking (Use Dashboard)

If CLI linking continues to fail, you can deploy everything using the Dashboard:

1. **Deploy Database Schema**:
   - Go to: https://supabase.com/dashboard/project/raezmmfgjkrivybtmptv/editor
   - SQL Editor → New query
   - Paste SQL from `supabase/migrations/20260204152342_initial_schema.sql`
   - Run

2. **Set Edge Function Secrets**:
   - Go to: Settings → Functions → Secrets
   - Add all required secrets

3. **Deploy Edge Function**:
   - Go to: Functions → Create new function
   - Name: `ai-api`
   - Copy code from `supabase/functions/ai-api/index.ts`
   - Deploy

See `DEPLOY_WITHOUT_CLI.md` for complete instructions.

## Alternative: Use Direct Database Connection

If you just need to deploy the database, you can connect directly:

```powershell
# Get connection string from Dashboard
# Settings → Database → Connection string → URI
# Then use psql or any PostgreSQL client
```

## Verify Your Account

1. **Check you're logged in**:
   ```powershell
   supabase projects list
   ```
   This should show your projects if you're properly authenticated.

2. **Check project ownership**:
   - Go to: https://supabase.com/dashboard/project/raezmmfgjkrivybtmptv/settings/general
   - Verify you can see the project settings
   - If not, you may need to be added as a team member

## Recommended Approach

Since you're getting access errors, the **easiest solution** is to:

1. **Use the Supabase Dashboard** for deployment (no CLI linking needed)
   - See: `DEPLOY_WITHOUT_CLI.md`

2. **Or fix authentication**:
   ```powershell
   supabase logout
   supabase login
   # Make sure to use the correct account
   ```

3. **Then try linking again**:
   ```powershell
   supabase link --project-ref raezmmfgjkrivybtmptv
   ```

## Need Help?

- **Supabase Docs**: https://supabase.com/docs/guides/platform/access-control
- **CLI Docs**: https://supabase.com/docs/reference/cli
- **Support**: https://supabase.com/support
