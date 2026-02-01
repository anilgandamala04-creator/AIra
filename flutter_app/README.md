# AI Tutor - Flutter Mobile & Desktop Application

A comprehensive Flutter port of the AI Tutor web application, supporting iOS, Android, Windows, macOS, and Linux.

## 🚀 Features

- **Cross-Platform**: iOS, Android, Windows, macOS, Linux
- **Interactive Teaching**: 3-panel layout with Chat, Classroom Board, and Studio
- **Voice Narration**: Text-to-Speech (TTS) support
- **Resource Generation**: Notes, Mind Maps, and Flashcards
- **Analytics Dashboard**: Track learning progress
- **Firebase Integration**: Authentication, Analytics, Firestore
- **Internationalization**: Multi-language support
- **State Management**: Riverpod for reactive state management

## 📦 Installation

1. **Install Flutter SDK** (3.0.0 or higher)
   ```bash
   flutter --version
   ```

2. **Install Dependencies**
   ```bash
   cd flutter_app
   flutter pub get
   ```

3. **Setup Firebase**
   - Follow Firebase setup instructions in `FIREBASE_SETUP.md`
   - Add `google-services.json` (Android) and `GoogleService-Info.plist` (iOS)

## 🔧 Development

### Run on Mobile
```bash
# Android
flutter run

# iOS
flutter run -d ios
```

### Run on Desktop
```bash
# Windows
flutter run -d windows

# macOS
flutter run -d macos

# Linux
flutter run -d linux
```

### Build for Production
```bash
# Android APK
flutter build apk --release

# Android App Bundle
flutter build appbundle --release

# iOS
flutter build ios --release

# Windows
flutter build windows --release

# macOS
flutter build macos --release

# Linux
flutter build linux --release
```

## 📁 Project Structure

```
lib/
├── main.dart                 # App entry point
├── models/                   # Data models
├── providers/               # Riverpod providers (state management)
├── screens/                  # UI screens/pages
├── widgets/                  # Reusable widgets
├── services/                 # Business logic & API services
├── utils/                    # Utilities & helpers
├── constants/                # App constants
└── localization/             # i18n files
```

## 🛠 Tech Stack

- **Framework**: Flutter 3.0+
- **State Management**: Riverpod
- **Navigation**: GoRouter
- **Backend**: Firebase (Auth, Firestore, Analytics)
- **Local Storage**: Hive + SharedPreferences
- **i18n**: Easy Localization
- **UI**: Material Design 3

## 📱 Platform Support

- ✅ Android (API 21+)
- ✅ iOS (iOS 12+)
- ✅ Windows (Windows 10+)
- ✅ macOS (macOS 10.14+)
- ✅ Linux (Ubuntu 18.04+)

## 🔐 Firebase Setup

See `FIREBASE_SETUP.md` for detailed Firebase configuration instructions.

## 📝 License

Private - All rights reserved
