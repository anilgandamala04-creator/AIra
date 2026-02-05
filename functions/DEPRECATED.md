# DEPRECATED

This directory contains the legacy Firebase Cloud Functions implementation.
The project has been migrated to use a standalone Express backend server in the `/backend` directory, integrated with Supabase.

### Why was this moved?
1. **Supabase Integration**: Core data operations now use Supabase.
2. **Spark Plan Compatibility**: Standalone Express servers can be hosted for free on platforms like Render or Railway, avoiding the need for a paid Firebase Spark plan for Cloud Functions.
3. **Flutter & Web Consistency**: Both platforms now hit the same unified Express API.

### Migration Path
- If you were using the AI endpoints, they are now available in `/backend/src/server.ts`.
- If you need authentication or rate limiting, use the Supabase-based middlewares in the new backend.
