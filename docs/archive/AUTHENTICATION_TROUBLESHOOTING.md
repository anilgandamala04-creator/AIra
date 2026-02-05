# Authentication Troubleshooting Guide

This guide helps you diagnose and fix authentication issues with Google Sign-In, Apple Sign-In, and Email/Password authentication.

## Common Issues and Solutions

### 1. "Unauthorized Domain" Error

**Error Message**: `auth/unauthorized-domain`

**Cause**: Your domain is not authorized in Firebase Console.

**Solution**:
1. Go to [Firebase Console](https://console.firebase.google.com/project/aira-27a47/authentication/settings)
2. Navigate to **Authentication** → **Settings** → **Authorized domains**
3. Add your domain:
   - For local development: `localhost` (usually already added)
   - For production: `aira-27a47.web.app` and `aira-27a47.firebaseapp.com`
   - For custom domain: Your custom domain (e.g., `app.yourdomain.com`)

**Note**: Firebase automatically adds `localhost` and Firebase hosting domains. You only need to manually add custom domains.

---

### 2. Google Sign-In Not Working

**Symptoms**:
- Popup closes immediately
- Redirect doesn't complete
- "Sign-in failed" error

**Solutions**:

#### A. Check OAuth Configuration
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `aira-27a47`
3. Navigate to **APIs & Services** → **Credentials**
4. Find your OAuth 2.0 Client ID
5. Verify **Authorized JavaScript origins** includes:
   - `http://localhost:5173` (for development)
   - `https://aira-27a47.firebaseapp.com`
   - `https://aira-27a47.web.app`
   - Your custom domain (if applicable)
6. Verify **Authorized redirect URIs** includes:
   - `http://localhost:5173` (for development)
   - `https://aira-27a47.firebaseapp.com/__/auth/handler`
   - `https://aira-27a47.web.app/__/auth/handler`
   - Your custom domain + `/__/auth/handler`

#### B. Check Firebase Authentication Settings
1. Go to [Firebase Console](https://console.firebase.google.com/project/aira-27a47/authentication/providers)
2. Navigate to **Authentication** → **Sign-in method**
3. Ensure **Google** is enabled
4. Verify **Project support email** is set
5. Check **OAuth consent screen** is configured

#### C. Clear Browser Cache
- Clear cookies and cache for your domain
- Try in incognito/private mode
- Check browser console for errors

---

### 3. Apple Sign-In Not Working

**Symptoms**:
- "Apple Sign-In is not available" error
- Redirect doesn't complete
- Popup fails

**Solutions**:

#### A. Check Platform Support
- **Web**: Apple Sign-In works on Safari (macOS/iOS) and Chrome (macOS)
- **iOS/macOS**: Native Apple Sign-In should work
- **Other platforms**: May not be supported

#### B. Check Firebase Configuration
1. Go to [Firebase Console](https://console.firebase.google.com/project/aira-27a47/authentication/providers)
2. Navigate to **Authentication** → **Sign-in method**
3. Ensure **Apple** is enabled
4. Verify **Apple Service ID** is configured
5. Check **Return URLs** include:
   - `https://aira-27a47.firebaseapp.com/__/auth/handler`
   - `https://aira-27a47.web.app/__/auth/handler`

#### C. Check Apple Developer Configuration
1. Go to [Apple Developer Console](https://developer.apple.com/)
2. Verify your **Service ID** is configured
3. Check **Return URLs** match Firebase configuration
4. Ensure **Sign in with Apple** capability is enabled

---

### 4. Email/Password Authentication Not Working

**Symptoms**:
- "Invalid email or password" error
- "User not found" error
- Sign-up fails

**Solutions**:

#### A. Check Firebase Authentication Settings
1. Go to [Firebase Console](https://console.firebase.google.com/project/aira-27a47/authentication/providers)
2. Navigate to **Authentication** → **Sign-in method**
3. Ensure **Email/Password** is enabled
4. Check **Email link (passwordless sign-in)** if using passwordless

#### B. Verify Email Format
- Use valid email format: `user@example.com`
- Check for typos
- Ensure email is not already registered (for sign-up)

#### C. Check Password Requirements
- Minimum 6 characters (Firebase requirement)
- Use strong password for security
- Check for special characters if needed

#### D. Email Verification
- Check spam folder for verification email
- Click verification link in email
- Resend verification if needed

---

### 5. Redirect Flow Not Completing

**Symptoms**:
- User redirected to Google/Apple but doesn't return
- Stuck on loading screen
- Redirect loop

**Solutions**:

#### A. Check Redirect URIs
- Verify redirect URIs in Google Cloud Console match exactly
- Check for typos or missing `/__/auth/handler` path
- Ensure HTTPS is used for production

#### B. Check Browser Settings
- Disable popup blockers
- Allow redirects
- Check browser console for errors

#### C. Check Network/Firewall
- Ensure Firebase domains are not blocked
- Check corporate firewall settings
- Try different network

---

### 6. Session Not Persisting

**Symptoms**:
- User logged out after page refresh
- Session expires immediately
- Need to login repeatedly

**Solutions**:

#### A. Check Browser Settings
- Ensure cookies are enabled
- Check for private/incognito mode
- Clear browser cache and cookies

#### B. Check Firebase Configuration
- Verify `browserLocalPersistence` is set
- Check Firebase Auth persistence settings
- Ensure no conflicting auth state listeners

---

## Debugging Steps

### 1. Check Browser Console
Open browser developer tools (F12) and check:
- **Console tab**: Look for error messages
- **Network tab**: Check for failed requests
- **Application tab**: Check cookies and localStorage

### 2. Check Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/project/aira-27a47/authentication/users)
2. Navigate to **Authentication** → **Users**
3. Check if user was created
4. Verify user email is verified (if required)

### 3. Test Authentication Flow
1. Try different browsers
2. Try incognito/private mode
3. Test on different devices
4. Check network connectivity

### 4. Verify Configuration
1. Check `firebase.json` configuration
2. Verify environment variables (if using `.env`)
3. Check `src/lib/firebase.ts` for correct project ID
4. Verify `authDomain` matches Firebase project

---

## Quick Checklist

Before reporting an issue, verify:

- [ ] Firebase project is active and accessible
- [ ] Authentication providers are enabled in Firebase Console
- [ ] Authorized domains include your domain
- [ ] OAuth redirect URIs are configured correctly
- [ ] Browser allows cookies and popups
- [ ] Network connection is stable
- [ ] No browser extensions blocking authentication
- [ ] Firebase SDK is properly initialized
- [ ] No console errors in browser

---

## Getting Help

If issues persist:

1. **Check Logs**:
   - Browser console errors
   - Firebase Console → Authentication → Users
   - Network request failures

2. **Collect Information**:
   - Error messages (exact text)
   - Browser and version
   - Device/OS information
   - Steps to reproduce

3. **Test in Different Environment**:
   - Different browser
   - Different device
   - Incognito mode
   - Different network

---

## Common Error Codes

| Error Code | Meaning | Solution |
|------------|---------|----------|
| `auth/unauthorized-domain` | Domain not authorized | Add domain in Firebase Console |
| `auth/popup-blocked` | Popup blocked by browser | Allow popups for your domain |
| `auth/popup-closed-by-user` | User closed popup | User action, not an error |
| `auth/operation-not-allowed` | Provider not enabled | Enable provider in Firebase Console |
| `auth/user-not-found` | User doesn't exist | Sign up first or check email |
| `auth/wrong-password` | Incorrect password | Check password or reset |
| `auth/email-already-in-use` | Email already registered | Use different email or sign in |
| `auth/weak-password` | Password too weak | Use stronger password (min 6 chars) |
| `auth/invalid-email` | Invalid email format | Check email format |
| `auth/network-request-failed` | Network error | Check internet connection |

---

**Last Updated**: Current Date  
**Firebase Project**: `aira-27a47`
