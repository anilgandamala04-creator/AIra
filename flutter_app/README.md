# AIra Flutter App (Mobile & Desktop)

The Flutter app is the mobile/desktop counterpart to the main **Vite/React web app** (AIra). The primary app is the web app; this Flutter app can be built and run for iOS, Android, and desktop targets.

## Prerequisites

- Flutter SDK (stable): [Install Flutter](https://docs.flutter.dev/get-started/install)
- For Android: Android Studio / SDK
- For iOS: Xcode (macOS only)
- For Windows: Visual Studio with Desktop development with C++

## Run the app

From this directory (`AIra/flutter_app`):

```bash
# Get dependencies
flutter pub get

# Run on connected device or emulator (defaults to first available)
flutter run

# Run on a specific device
flutter devices
flutter run -d <device_id>

# Run on Chrome (web)
flutter run -d chrome
```

## Build

```bash
# Debug APK (Android)
flutter build apk --debug

# Release APK (Android) — requires signing config for production
flutter build apk --release

# Release App Bundle for Play Store
flutter build appbundle --release

# iOS (macOS only)
flutter build ios --release

# Windows
flutter build windows
```

## Configuration TODOs (before production)

1. **Fonts (pubspec.yaml)**  
   Inter font is commented out. To use it:
   - Add font files under `assets/fonts/` (e.g. `Inter-Regular.ttf`, `Inter-Medium.ttf`, `Inter-SemiBold.ttf`, `Inter-Bold.ttf`).
   - Uncomment the `fonts` block in `pubspec.yaml` under `flutter:`.

2. **Android applicationId (android/app/build.gradle.kts)**  
   Replace `com.example.ai_tutor` with your own package ID (e.g. `com.airaedtech.aitutor`).

3. **Android signing (android/app/build.gradle.kts)**  
   For release builds, add a signing config (keystore) and reference it in `buildTypes.release.signingConfig`. See [Flutter Android signing](https://docs.flutter.dev/deployment/android#signing-the-app).

4. **Windows (optional)**  
   If you see a CMake or Windows SDK TODO in the Windows build, ensure Visual Studio has “Desktop development with C++” and the Windows 10/11 SDK installed.

## Root script (optional)

From the **project root** (`Project AIra`), you can add:

- `"flutter:get": "cd AIra/flutter_app && flutter pub get"`
- `"flutter:run": "cd AIra/flutter_app && flutter run"`
- `"flutter:build:apk": "cd AIra/flutter_app && flutter build apk --release"`

Add these to the root `package.json` scripts if you want to drive the Flutter app from the monorepo root.
