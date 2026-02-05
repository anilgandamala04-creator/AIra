# Firebase Backend Documentation

This document describes the Firebase backend integration for the AI Tutor application.

## Overview

The application is fully connected to Firebase for:
- **Authentication**: Google, Apple, and Email/Password sign-in (session persistence, redirect handling, error handling)
- **Firestore**: User document (`users/{uid}`) for profile, settings, analytics; subcollections for sessions, doubts, notes, flashcards, mind maps
- **Real-time sync**: App subscribes to the user document so profile, settings, and analytics stay in sync across tabs and devices
- **Storage**: File uploads for user-generated content (10MB max per file)
- **Environment**: Optional `.env` with `VITE_FIREBASE_*` overrides; built-in defaults for the aira-27a47 project

## Architecture

```
Firebase Project: aira-27a47
├── Authentication
│   ├── Google OAuth
│   ├── Apple OAuth
│   └── Email/Password
├── Firestore Database
│   └── users/{uid}
│       ├── profile (UserProfile)
│       ├── settings (AppSettings)
│       ├── analytics (SessionAnalytics[])
│       ├── curriculum (CurriculumProgress)
│       └── Subcollections:
│           ├── sessions/{sessionId}
│           ├── doubts/{doubtId}
│           ├── notes/{noteId}
│           ├── flashcards/{cardId}
│           └── mindmaps/{mapId}
└── Storage
    └── users/{uid}/
        └── (user files)
```

## Firestore Collections

### Users Collection (`users/{uid}`)

Main document containing:
- `profile`: User profile data
- `settings`: Application settings
- `analytics`: Learning analytics
- `curriculum`: Curriculum progress
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

### Teaching Sessions (`users/{uid}/sessions/{sessionId}`)

```typescript
{
  id: string;
  userId: string;
  topicId: string;
  topicName: string;
  startTime: Timestamp;
  endTime?: Timestamp;
  status: 'active' | 'paused' | 'completed';
  currentStep: number;
  totalSteps: number;
  progress: number;
  teachingSteps: TeachingStep[];
  doubts: Doubt[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Doubts (`users/{uid}/doubts/{doubtId}`)

```typescript
{
  id: string;
  sessionId: string;
  question: string;
  timestamp: Timestamp;
  context: {
    stepNumber: number;
    stepTitle: string;
  };
  status: 'pending' | 'resolving' | 'resolved';
  resolution?: DoubtResolution;
  createdAt: Timestamp;
}
```

### Notes (`users/{uid}/notes/{noteId}`)

```typescript
{
  id: string;
  sessionId: string;
  topicName: string;
  title: string;
  content: string;
  sections: NoteSection[];
  userDoubts: string[];
  qualityScore: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Flashcards (`users/{uid}/flashcards/{cardId}`)

```typescript
{
  id: string;
  sessionId: string;
  question: string;
  answer: string;
  explanation?: string;
  hint?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  nextReview?: Timestamp;
  lastReviewed?: Timestamp;
  intervalDays: number;
  easeFactor: number;
  repetitions: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### Mind Maps (`users/{uid}/mindmaps/{mapId}`)

```typescript
{
  id: string;
  sessionId: string;
  topicName: string;
  nodes: MindMapNode[];
  connections: Connection[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Security Rules

Deploy these rules to your Firebase project:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper function to check if user is authenticated
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check if user owns the document
    function isOwner(uid) {
      return isAuthenticated() && request.auth.uid == uid;
    }
    
    // Users collection
    match /users/{userId} {
      // Users can read/write their own data
      allow read, write: if isOwner(userId);
      
      // Teaching sessions subcollection
      match /sessions/{sessionId} {
        allow read, write: if isOwner(userId);
      }
      
      // Doubts subcollection
      match /doubts/{doubtId} {
        allow read, write: if isOwner(userId);
      }
      
      // Notes subcollection
      match /notes/{noteId} {
        allow read, write: if isOwner(userId);
      }
      
      // Flashcards subcollection
      match /flashcards/{cardId} {
        allow read, write: if isOwner(userId);
      }
      
      // Mind maps subcollection
      match /mindmaps/{mapId} {
        allow read, write: if isOwner(userId);
      }
    }
    
    // Deny all other access
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

## Storage Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can read/write their own files
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

## Real-Time Features

### Automatic Sync

All stores automatically sync to Firebase when the user is authenticated:

- **Profile changes** → Synced immediately
- **Settings changes** → Synced immediately
- **Teaching sessions** → Created on start, updated on progress, completed on end
- **Doubts** → Saved when raised, updated when resolved
- **Notes/Flashcards/Mind Maps** → Saved after generation

### Real-Time Listeners

Use the Firebase hooks for real-time updates:

```typescript
import { useFirebaseUser, useTeachingSessions, useNotes } from '../hooks/useFirebase';

function MyComponent() {
  const { userData, loading } = useFirebaseUser();
  const { sessions } = useTeachingSessions();
  const { notes, addNote } = useNotes();
  
  // Data updates automatically when changed in Firebase
}
```

### Offline Support

Firestore persistence is enabled automatically:
- Data is cached locally in IndexedDB
- App works offline with cached data
- Changes sync when connection is restored
- Multiple tabs limitation: persistence works in one tab only

## Guest Users

Guest users (not authenticated with Firebase):
- Data stored in local storage only
- No cloud sync or backup
- Data persists across sessions via Zustand persist middleware
- Can upgrade to full account to start syncing

## Environment Setup

The Firebase configuration is in `src/lib/firebase.ts`. For production:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication providers (Google, Apple, Email/Password)
3. Create Firestore database in production mode
4. Deploy security rules
5. Update `firebaseConfig` with your project's credentials

## API Reference

### Core Functions

```typescript
// User data
getUser(uid: string): Promise<FirebaseUser | null>
setUser(uid: string, data: Partial<FirebaseUser>): Promise<void>
subscribeToUser(uid, onData, onError): Unsubscribe

// Teaching sessions
createTeachingSession(uid, session): Promise<string>
updateTeachingSession(uid, sessionId, updates): Promise<void>
subscribeToTeachingSessions(uid, onData, onError): Unsubscribe

// Doubts
saveDoubt(uid, doubt): Promise<string>
updateDoubt(uid, doubtId, updates): Promise<void>
subscribeToDoubts(uid, onData, sessionId?): Unsubscribe

// Notes
saveNote(uid, note): Promise<string>
deleteNote(uid, noteId): Promise<void>
subscribeToNotes(uid, onData): Unsubscribe

// Flashcards
saveFlashcards(uid, cards): Promise<void>
updateFlashcard(uid, cardId, updates): Promise<void>
getDueFlashcards(uid): Promise<Flashcard[]>
subscribeToFlashcards(uid, onData, sessionId?): Unsubscribe

// Mind maps
saveMindMap(uid, map): Promise<string>
deleteMindMap(uid, mapId): Promise<void>
subscribeToMindMaps(uid, onData): Unsubscribe

// File storage
uploadFile(uid, path, file): Promise<string>
deleteFile(uid, path): Promise<void>
listFiles(uid, path): Promise<string[]>

// Account management
deleteAllUserData(uid): Promise<void>
```

### React Hooks

```typescript
useFirebaseUser(): { userData, loading, error }
useTeachingSessions(): { sessions, loading, error, createSession, updateSession }
useDoubts(sessionId?): { doubts, loading, error, addDoubt, resolveDoubt }
useNotes(): { notes, loading, error, addNote, removeNote }
useFlashcards(sessionId?): { flashcards, loading, error, addFlashcards, updateCard, removeCard }
useMindMaps(): { mindMaps, loading, error, addMindMap, removeMindMap }
useSyncStatus(): { isSyncing, lastSyncTime, syncError }
useAutoSave(data, saveFn, options): { isSaving, lastSaved, error }
```

## Error Handling

Firebase operations may fail due to:
- Network issues (offline mode handles this gracefully)
- Permission denied (security rules)
- Invalid data format

All Firebase operations are wrapped in try-catch blocks and log errors to console. The UI continues to work with local state even if sync fails.

## Performance Considerations

1. **Batch Writes**: Flashcards are saved in batches for efficiency
2. **Pagination**: Lists are limited (50-200 items) to prevent large reads
3. **Selective Subscriptions**: Only subscribe to data you need
4. **Offline First**: UI updates immediately, sync happens in background
