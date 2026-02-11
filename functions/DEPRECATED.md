# DEPRECATED

This directory contains the legacy Firebase Cloud Functions implementation.
The project uses a standalone Express backend in `/backend`. No Firebase or Supabase.

### Why was this moved?
1. **Standalone backend**: AI and API are served by the Express server in `/backend`.
2. **Hosting**: Backend can be hosted on Render, Railway, etc. No Cloud Functions or Supabase required.
3. **Flutter & Web**: Both platforms use the same Express API.

### Migration Path
- AI endpoints are in `/backend/src/server.ts`.
- Auth and rate limiting are handled in the Express backend (guest identity, in-memory rate limit).
