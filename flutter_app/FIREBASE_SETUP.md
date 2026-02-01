# Firebase Setup Guide for Flutter

## Prerequisites

1. Firebase project created at https://console.firebase.google.com/
2. Flutter SDK installed
3. Platform-specific setup completed

## Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
```

## Step 2: Add Firebase to Flutter Project

### Android Setup

1. **Get `google-services.json`**:
   - Go to Firebase Console → Project Settings
   - Under "Your apps", select Android app or add one
   - Download `google-services.json`

2. **Place the file**:
   ```
   flutter_app/android/app/google-services.json
   ```

3. **Update `android/build.gradle`**:
   ```gradle
   buildscript {
       dependencies {
           classpath 'com.google.gms:google-services:4.4.0'
       }
   }
   ```

4. **Update `android/app/build.gradle`**:
   ```gradle
   apply plugin: 'com.google.gms.google-services'
   ```

### iOS Setup

1. **Get `GoogleService-Info.plist`**:
   - Go to Firebase Console → Project Settings
   - Under "Your apps", select iOS app or add one
   - Download `GoogleService-Info.plist`

2. **Place the file**:
   ```
   flutter_app/ios/Runner/GoogleService-Info.plist
   ```

3. **Update `ios/Podfile`** (if needed):
   ```ruby
   platform :ios, '12.0'
   ```

### Web Setup

1. **Get Firebase Config**:
   - Go to Firebase Console → Project Settings
   - Under "Your apps", select Web app or add one
   - Copy the Firebase config

2. **Create `lib/firebase_options.dart`**:
   ```bash
   flutter pub add firebase_core
   flutterfire configure
   ```

## Step 3: Enable Authentication Methods

In Firebase Console → Authentication → Sign-in method:

- ✅ Email/Password
- ✅ Google
- ✅ Apple (iOS/macOS only)

## Step 4: Initialize Firebase in Code

Firebase is already initialized in `lib/main.dart`. Make sure your `firebase_options.dart` is properly configured.

## Step 5: Test Firebase Connection

Run the app and test authentication:

```bash
flutter run
```

## Troubleshooting

### Android: "Default FirebaseApp is not initialized"

- Ensure `google-services.json` is in `android/app/`
- Run `flutter clean` and `flutter pub get`
- Rebuild the app

### iOS: Build errors

- Run `cd ios && pod install`
- Clean build: `flutter clean && flutter pub get`

### Web: Firebase not working

- Ensure Firebase config is correct
- Check browser console for errors
- Verify Firebase SDK is loaded

## Next Steps

- Configure Firestore rules
- Set up Cloud Storage
- Enable Analytics
- Configure hosting (if needed)
