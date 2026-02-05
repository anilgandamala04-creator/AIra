# Authentication Setup (Google & Email)

This guide fixes the two common auth issues: **Google Sign-In "provider is not enabled"** and **Email "Rate limit exceeded"**.

The app uses **Firebase Authentication** only.

## Quick fix summary

| Issue | Fix |
|--------|-----|
| **Google**: "Unsupported provider" / "provider is not enabled" | Enable **Google** in [Firebase Console](https://console.firebase.google.com) → your project → **Authentication** → **Sign-in method** → turn **Google** ON and add Client ID + Secret. Add your app URL to **Authorized domains**. |
| **Email**: "Rate limit exceeded" | Wait 5–10 minutes before trying again. Firebase applies rate limits; check [Firebase quotas](https://firebase.google.com/docs/auth/limits) if needed. |

---

## 1. Google Sign-In: "Unsupported provider: provider is not enabled"

This error means the **Google provider is not enabled** in your Firebase project.

### Firebase Console

1. Open **[Firebase Console](https://console.firebase.google.com)** → your project.
2. Go to **Authentication** → **Sign-in method**.
3. Find **Google** and click to enable it.
4. Add your Google OAuth credentials:
   - **Web SDK configuration**: Use the same Client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (OAuth 2.0 Client ID, Web application).
   - Under **Authorized redirect URIs** in Google Cloud Console, ensure you have:
     - `https://<YOUR_PROJECT_ID>.firebaseapp.com/__/auth/handler`
     - Your app URL(s), e.g. `https://your-app-domain.com`, `http://localhost:5173`
5. In Firebase **Authentication** → **Settings** → **Authorized domains**:
   - Add your app domain(s) and `localhost` for development.

### User-facing message

If Google is still not enabled, the app shows:  
*"This sign-in method is not enabled. Please ask the administrator to enable it."*

---

## 2. Email Sign-In: "Rate limit exceeded"

Firebase applies rate limits to sign-in/sign-up and email sending. Hitting them shows "Rate limit exceeded".

### What you can do

1. **Avoid rapid retries**: The app shows a clear message; users should wait a few minutes before trying again.
2. **Check quotas**: In [Firebase Console](https://console.firebase.google.com) → your project → **Authentication** → usage and quotas.
3. **Shared IP** (school/office): Many users behind one IP may share limits; consider Firebase support for higher limits if needed.

---

## Summary

| Issue | Cause | Fix |
|-------|--------|-----|
| Google "provider is not enabled" | Google provider not enabled in Firebase | Enable Google in Firebase Console (Sign-in method) and set Client ID/Secret + authorized domains. |
| Email "Rate limit exceeded" | Auth rate limits | App shows a clear message; wait and retry; check Firebase quotas if needed. |
