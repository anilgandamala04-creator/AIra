# Application Testing Guide

## Quick Start

### 1. Start Development Server
```bash
cd AIra
npm run dev
```

The application will be available at: **http://localhost:3000**

### 2. Test Authentication Flows

#### Google Sign-In
1. Click "Sign in with Google"
2. Complete Google OAuth flow
3. Should redirect to `/onboarding` (new users) or `/dashboard` (existing users)
4. Verify no "Failed to fetch dynamically imported module" errors

#### Apple Sign-In
1. Click "Sign in with Apple" (if available on your platform)
2. Complete Apple OAuth flow
3. Should redirect appropriately based on user status

#### Email/Password Sign-In
1. Click "Sign in with Email"
2. Enter email and password
3. Click "Sign In"
4. Should redirect to appropriate page

#### Email/Password Sign-Up
1. Click "Sign in with Email"
2. Toggle to "Sign Up"
3. Enter name, email, and password
4. Click "Sign Up"
5. Should redirect to `/onboarding`

### 3. Test Navigation Flows

#### New User Flow
1. Sign up with new account
2. Should land on `/onboarding`
3. Complete onboarding steps:
   - Select profession
   - Select sub-profession
   - Select subject
   - Select topic
4. Should navigate to `/learn/{topicId}`

#### Existing User Flow
1. Sign in with existing account
2. Should land on `/dashboard`
3. Navigate to different pages:
   - `/dashboard` - Analytics and progress
   - `/curriculum` - Browse learning paths
   - `/learn/{topicId}` - Teaching page
   - `/settings` - User settings

### 4. Test Key Features

#### Teaching Page (`/learn/{topicId}`)
- [ ] Three-panel layout loads correctly
- [ ] Chat panel is functional
- [ ] Board panel displays content
- [ ] Studio panel (Notes, Mind Maps, Flashcards, Quiz) works
- [ ] Text-to-speech works (if enabled)
- [ ] Doubt panel can be raised
- [ ] Session persists across refreshes

#### Dashboard (`/dashboard`)
- [ ] Displays user progress
- [ ] Shows recommended topics
- [ ] Analytics data is visible
- [ ] Navigation to other pages works

#### Settings (`/settings`)
- [ ] All tabs are accessible
- [ ] Theme switching works
- [ ] Language switching works
- [ ] Accessibility settings apply
- [ ] Learning preferences can be updated
- [ ] File import works (if applicable)

#### Curriculum (`/curriculum`)
- [ ] Profession selection works
- [ ] Subject browsing works
- [ ] Topic selection navigates to teaching page

### 5. Test Error Handling

#### Module Loading Errors
- [ ] No "Failed to fetch dynamically imported module" errors
- [ ] Pages load smoothly after login
- [ ] Retry logic works if initial load fails

#### Network Errors
- [ ] Offline mode works (Firestore persistence)
- [ ] Error messages are user-friendly
- [ ] Retry mechanisms work

#### Authentication Errors
- [ ] Invalid credentials show clear error
- [ ] OAuth errors are handled gracefully
- [ ] Session expiration is handled

### 6. Test Real-Time Features

#### Firestore Sync
- [ ] User data syncs across tabs
- [ ] Settings changes reflect immediately
- [ ] Profile updates sync in real-time
- [ ] Analytics update in real-time

#### State Management
- [ ] Zustand stores update correctly
- [ ] Cross-component communication works
- [ ] State persists across refreshes (via Firestore)

### 7. Test Responsive Design

#### Mobile (< 768px)
- [ ] Layout adapts to mobile
- [ ] Navigation works on mobile
- [ ] Touch interactions work
- [ ] Text is readable

#### Tablet (768px - 1024px)
- [ ] Layout is optimized
- [ ] Panels are appropriately sized

#### Desktop (> 1024px)
- [ ] Full three-panel layout visible
- [ ] All features accessible

### 8. Test Accessibility

#### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Focus indicators are visible
- [ ] Tab order is logical

#### Screen Reader
- [ ] ARIA labels are present
- [ ] Semantic HTML is used
- [ ] Error messages are announced

#### Visual Accessibility
- [ ] High contrast mode works
- [ ] Font size adjustments work
- [ ] Reduce animations option works

### 9. Test Performance

#### Initial Load
- [ ] Page loads in < 3 seconds
- [ ] No blocking resources
- [ ] Code splitting works

#### Navigation
- [ ] Page transitions are smooth
- [ ] No janky animations
- [ ] Lazy loading works correctly

#### Memory
- [ ] No memory leaks
- [ ] Event listeners are cleaned up
- [ ] Subscriptions are disposed

## Common Issues and Solutions

### Issue: "Failed to fetch dynamically imported module"
**Solution**: This has been fixed with:
- Module preloading on login page
- Retry logic in lazy imports
- Improved Vite configuration

### Issue: Pages not loading after login
**Solution**: 
- Check browser console for errors
- Verify Firebase configuration
- Check network tab for failed requests
- Try refreshing the page

### Issue: Authentication not working
**Solution**:
- Verify Firebase Auth providers are enabled
- Check OAuth redirect URIs in Firebase Console
- Verify environment variables are set

### Issue: Data not syncing
**Solution**:
- Check Firestore security rules
- Verify user is authenticated
- Check browser console for Firestore errors
- Verify offline persistence is enabled

## Testing Checklist

- [ ] All authentication methods work
- [ ] Navigation flows correctly
- [ ] All pages load without errors
- [ ] Real-time sync works
- [ ] Error handling is graceful
- [ ] Responsive design works
- [ ] Accessibility features work
- [ ] Performance is acceptable
- [ ] No console errors
- [ ] No memory leaks

## Next Steps

After testing:
1. Fix any issues found
2. Run production build: `npm run build`
3. Test production build: `npm run preview`
4. Deploy to Firebase: `npm run deploy`
