# Running the Application

## Development Server

The development server is now starting. Here's what you need to know:

### Server URL
**http://localhost:3000**

### Starting the Server
```bash
cd AIra
npm run dev
```

### What to Expect

1. **Initial Load**: The server will start and compile your application
2. **Browser**: Your default browser should open automatically to `http://localhost:3000`
3. **Hot Module Replacement (HMR)**: Changes to your code will automatically reload in the browser

### Server Status

The server is running in the background. You should see:
- Vite compilation messages in the terminal
- The application loading in your browser
- No errors in the browser console

## Testing the Application

### 1. Open the Application
Navigate to: **http://localhost:3000**

### 2. Test Login
- Try logging in with Google, Apple, or Email/Password
- Verify that the lazy loading fix works (no module loading errors)
- Check that navigation to `/onboarding` or `/dashboard` works smoothly

### 3. Test Key Features
- **Onboarding Flow**: Complete the onboarding process
- **Teaching Page**: Navigate to a topic and test the three-panel layout
- **Dashboard**: Check analytics and progress
- **Settings**: Test theme switching, language, and preferences

### 4. Check Browser Console
Open Developer Tools (F12) and check:
- ✅ No red errors
- ✅ No "Failed to fetch dynamically imported module" errors
- ✅ Firebase connection successful
- ✅ Firestore sync working

### 5. Test Real-Time Features
- Open the app in multiple tabs
- Make a change in one tab
- Verify it syncs to other tabs immediately

## Troubleshooting

### Server Not Starting
If the server doesn't start:
```bash
# Check if port 3000 is in use
netstat -ano | findstr :3000

# Kill process if needed (replace PID with actual process ID)
taskkill /PID <PID> /F

# Try again
npm run dev
```

### Module Loading Errors
If you see "Failed to fetch dynamically imported module":
1. **Hard Refresh**: Press `Ctrl + Shift + R` (or `Cmd + Shift + R` on Mac)
2. **Clear Cache**: Clear browser cache and reload
3. **Restart Server**: Stop the server (`Ctrl + C`) and restart with `npm run dev`

### Firebase Connection Issues
If Firebase isn't connecting:
1. Check browser console for Firebase errors
2. Verify Firebase configuration in `.env` or `src/lib/firebase.ts`
3. Check Firebase Console for service status
4. Verify authentication providers are enabled

### Build Errors
If you see TypeScript or build errors:
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Check for linting errors
npm run lint

# Try rebuilding
npm run build
```

## Production Build

To test the production build:
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

The preview server will start on a different port (usually 4173).

## Deployment

To deploy to Firebase:
```bash
# Build and deploy
npm run deploy

# Or deploy only hosting
npm run deploy:hosting
```

## Next Steps

1. ✅ Server is running
2. ✅ Open http://localhost:3000 in your browser
3. ✅ Test login functionality
4. ✅ Verify all features work correctly
5. ✅ Check for any errors in console

## Quick Test Checklist

- [ ] Server starts without errors
- [ ] Application loads at http://localhost:3000
- [ ] Login page displays correctly
- [ ] Can log in with Google/Apple/Email
- [ ] No module loading errors
- [ ] Navigation works smoothly
- [ ] All pages load correctly
- [ ] Real-time sync works
- [ ] No console errors

---

**The application is ready for testing!** 🚀

Open **http://localhost:3000** in your browser to start testing.
