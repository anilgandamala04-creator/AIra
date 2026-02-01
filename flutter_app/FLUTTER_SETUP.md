# Flutter Setup & Build Instructions

## Prerequisites

1. **Install Flutter SDK** (3.0.0 or higher)
   - Download from: https://flutter.dev/docs/get-started/install
   - Add Flutter to PATH
   - Verify: `flutter doctor`

2. **Install Platform-Specific Tools**:

   **For Android:**
   - Android Studio
   - Android SDK
   - Accept Android licenses: `flutter doctor --android-licenses`

   **For iOS (macOS only):**
   - Xcode
   - CocoaPods: `sudo gem install cocoapods`

   **For Desktop:**
   - Enable desktop support: `flutter config --enable-windows-desktop` (or macos/linux)

## Installation Steps

### 1. Navigate to Flutter App Directory

```bash
cd flutter_app
```

### 2. Install Dependencies

```bash
flutter pub get
```

### 3. Setup Firebase

Follow instructions in `FIREBASE_SETUP.md`

### 4. Generate Code (if using code generation)

```bash
flutter pub run build_runner build
```

## Running the App

### Mobile

```bash
# List available devices
flutter devices

# Run on connected device/emulator
flutter run

# Run on specific device
flutter run -d <device-id>
```

### Desktop

```bash
# Windows
flutter run -d windows

# macOS
flutter run -d macos

# Linux
flutter run -d linux
```

## Building for Production

### Android

```bash
# APK
flutter build apk --release

# App Bundle (for Play Store)
flutter build appbundle --release
```

### iOS

```bash
flutter build ios --release
```

Then open Xcode and archive for App Store.

### Desktop

```bash
# Windows
flutter build windows --release

# macOS
flutter build macos --release

# Linux
flutter build linux --release
```

## Project Structure

```
flutter_app/
├── lib/
│   ├── main.dart              # App entry point
│   ├── models/                # Data models
│   ├── providers/             # State management (Riverpod)
│   ├── screens/               # UI screens
│   ├── widgets/               # Reusable widgets
│   ├── services/              # Business logic
│   ├── router/                # Navigation
│   ├── utils/                 # Utilities
│   └── constants/            # Constants
├── android/                   # Android-specific files
├── ios/                       # iOS-specific files
├── windows/                   # Windows-specific files
├── macos/                     # macOS-specific files
├── linux/                     # Linux-specific files
└── pubspec.yaml              # Dependencies
```

## Common Commands

```bash
# Check Flutter setup
flutter doctor

# Clean build
flutter clean
flutter pub get

# Analyze code
flutter analyze

# Format code
flutter format .

# Run tests
flutter test
```

## Troubleshooting

### "No devices found"
- Start an emulator/simulator
- Connect a physical device with USB debugging enabled
- For desktop: Enable desktop support in Flutter config

### Build errors
- Run `flutter clean`
- Delete `pubspec.lock` and run `flutter pub get`
- Check platform-specific setup

### Firebase errors
- Verify Firebase configuration files are in place
- Check Firebase project settings
- Review `FIREBASE_SETUP.md`

## Next Steps

1. Complete Firebase setup
2. Implement remaining screens
3. Add platform-specific features
4. Test on all target platforms
5. Build and deploy
