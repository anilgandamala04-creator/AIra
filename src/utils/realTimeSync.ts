/**
 * Real-time synchronization utilities for cross-store state management.
 * Ensures all user actions, state changes, and UI updates are reflected
 * immediately across the application without page refreshes.
 */

import { useEffect, useCallback, useRef, useState, useSyncExternalStore } from 'react';
import { useUserStore } from '../stores/userStore';
import { useSettingsStore } from '../stores/settingsStore';
import { useTeachingStore } from '../stores/teachingStore';
import { useAuthStore } from '../stores/authStore';
import { useDoubtStore } from '../stores/doubtStore';
import { useResourceStore } from '../stores/resourceStore';
import { useAnalyticsStore } from '../stores/analyticsStore';

type UnsubscribeFn = () => void;
type EventCallback = (...args: unknown[]) => void;

// ============================================================================
// Event Emitter for Cross-Component Communication
// ============================================================================

class RealTimeEventEmitter {
    private listeners: Map<string, Set<EventCallback>> = new Map();
    private lastEvents: Map<string, unknown[]> = new Map();

    emit(event: string, ...args: unknown[]): void {
        this.lastEvents.set(event, args);
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            // Execute all callbacks synchronously for immediate updates
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (error) {
                    console.error(`[RealTimeSync] Event handler error for "${event}":`, error);
                }
            });
        }
    }

    on(event: string, callback: EventCallback): UnsubscribeFn {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            callbacks.add(callback);
        }
        
        return () => {
            const callbacks = this.listeners.get(event);
            if (callbacks) {
                callbacks.delete(callback);
                if (callbacks.size === 0) {
                    this.listeners.delete(event);
                }
            }
        };
    }

    once(event: string, callback: EventCallback): UnsubscribeFn {
        const wrappedCallback = (...args: unknown[]) => {
            unsubscribe();
            callback(...args);
        };
        const unsubscribe = this.on(event, wrappedCallback);
        return unsubscribe;
    }

    getLastEvent(event: string): unknown[] | undefined {
        return this.lastEvents.get(event);
    }

    clear(): void {
        this.listeners.clear();
        this.lastEvents.clear();
    }
}

// Global event emitter instance
export const realTimeEvents = new RealTimeEventEmitter();

// Event types for type safety
export const EVENTS = {
    // Auth events
    AUTH_LOGIN: 'auth:login',
    AUTH_LOGOUT: 'auth:logout',
    AUTH_STATE_CHANGE: 'auth:state_change',
    
    // Profile events
    PROFILE_UPDATE: 'profile:update',
    PROFESSION_CHANGE: 'profile:profession_change',
    SUB_PROFESSION_CHANGE: 'profile:sub_profession_change',
    
    // Settings events
    SETTINGS_UPDATE: 'settings:update',
    THEME_CHANGE: 'settings:theme_change',
    LANGUAGE_CHANGE: 'settings:language_change',
    ACCESSIBILITY_CHANGE: 'settings:accessibility_change',
    
    // Teaching events
    SESSION_START: 'teaching:session_start',
    SESSION_END: 'teaching:session_end',
    STEP_CHANGE: 'teaching:step_change',
    STEP_COMPLETE: 'teaching:step_complete',
    SPEAKING_CHANGE: 'teaching:speaking_change',
    
    // Doubt events
    DOUBT_RAISED: 'doubt:raised',
    DOUBT_RESOLVED: 'doubt:resolved',
    
    // Resource events
    NOTES_GENERATED: 'resource:notes_generated',
    MINDMAP_GENERATED: 'resource:mindmap_generated',
    FLASHCARDS_GENERATED: 'resource:flashcards_generated',
    
    // Analytics events
    SESSION_RECORDED: 'analytics:session_recorded',
    ACHIEVEMENT_UNLOCKED: 'analytics:achievement_unlocked',
} as const;

// ============================================================================
// Store Subscription Utilities
// ============================================================================

/**
 * Subscribe to store changes and execute callback immediately when state changes.
 * Returns unsubscribe function for cleanup.
 */
export function subscribeToStore<T>(
    store: { subscribe: (callback: (state: T, prevState: T) => void) => UnsubscribeFn; getState: () => T },
    selector: (state: T) => unknown,
    callback: (selectedState: unknown, previousState: unknown) => void
): UnsubscribeFn {
    let previousValue = selector(store.getState());
    
    return store.subscribe((state) => {
        const newValue = selector(state);
        if (newValue !== previousValue) {
            const prevForCallback = previousValue;
            previousValue = newValue;
            // Execute callback immediately (synchronously) for real-time updates
            callback(newValue, prevForCallback);
        }
    });
}

/**
 * Subscribe to multiple selectors from a store
 */
export function subscribeToStoreMultiple<T>(
    store: { subscribe: (callback: (state: T, prevState: T) => void) => UnsubscribeFn; getState: () => T },
    selectors: Array<{ selector: (state: T) => unknown; callback: (value: unknown, prev: unknown) => void }>
): UnsubscribeFn {
    const previousValues = selectors.map(s => s.selector(store.getState()));
    
    return store.subscribe((state) => {
        selectors.forEach((s, index) => {
            const newValue = s.selector(state);
            if (newValue !== previousValues[index]) {
                const prevValue = previousValues[index];
                previousValues[index] = newValue;
                s.callback(newValue, prevValue);
            }
        });
    });
}

// ============================================================================
// Real-Time Sync Hooks
// ============================================================================

/**
 * Hook to subscribe to profile changes and execute callback in real time.
 * Automatically cleans up subscription on unmount.
 */
export function useProfileSync(
    onProfileChange?: (profile: ReturnType<typeof useUserStore.getState>['profile']) => void
) {
    const callbackRef = useRef(onProfileChange);
    callbackRef.current = onProfileChange;

    useEffect(() => {
        if (!callbackRef.current) return;

        const unsubscribe = useUserStore.subscribe((state, prevState) => {
            if (state.profile !== prevState.profile) {
                callbackRef.current?.(state.profile);
            }
        });

        return unsubscribe;
    }, []);
}

/**
 * Hook to subscribe to settings changes and execute callback in real time.
 */
export function useSettingsSync(
    onSettingsChange?: (settings: ReturnType<typeof useSettingsStore.getState>['settings']) => void
) {
    const callbackRef = useRef(onSettingsChange);
    callbackRef.current = onSettingsChange;

    useEffect(() => {
        if (!callbackRef.current) return;

        const unsubscribe = useSettingsStore.subscribe((state, prevState) => {
            if (state.settings !== prevState.settings) {
                callbackRef.current?.(state.settings);
            }
        });

        return unsubscribe;
    }, []);
}

/**
 * Hook to subscribe to teaching session changes in real time.
 */
export function useTeachingSessionSync(
    onSessionChange?: (session: ReturnType<typeof useTeachingStore.getState>['currentSession']) => void
) {
    const callbackRef = useRef(onSessionChange);
    callbackRef.current = onSessionChange;

    useEffect(() => {
        if (!callbackRef.current) return;

        const unsubscribe = useTeachingStore.subscribe((state, prevState) => {
            if (state.currentSession !== prevState.currentSession) {
                callbackRef.current?.(state.currentSession);
            }
        });

        return unsubscribe;
    }, []);
}

/**
 * Hook to subscribe to doubt changes in real time.
 */
export function useDoubtSync(
    onDoubtChange?: (doubts: ReturnType<typeof useDoubtStore.getState>['doubts']) => void
) {
    const callbackRef = useRef(onDoubtChange);
    callbackRef.current = onDoubtChange;

    useEffect(() => {
        if (!callbackRef.current) return;

        const unsubscribe = useDoubtStore.subscribe((state, prevState) => {
            if (state.doubts !== prevState.doubts) {
                callbackRef.current?.(state.doubts);
            }
        });

        return unsubscribe;
    }, []);
}

/**
 * Hook to subscribe to resource changes in real time.
 */
export function useResourceSync(callbacks?: {
    onNotesChange?: (notes: ReturnType<typeof useResourceStore.getState>['notes']) => void;
    onMindMapsChange?: (mindMaps: ReturnType<typeof useResourceStore.getState>['mindMaps']) => void;
    onFlashcardsChange?: (flashcards: ReturnType<typeof useResourceStore.getState>['flashcards']) => void;
}) {
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;

    useEffect(() => {
        if (!callbacksRef.current) return;

        const unsubscribe = useResourceStore.subscribe((state, prevState) => {
            if (state.notes !== prevState.notes) {
                callbacksRef.current?.onNotesChange?.(state.notes);
            }
            if (state.mindMaps !== prevState.mindMaps) {
                callbacksRef.current?.onMindMapsChange?.(state.mindMaps);
            }
            if (state.flashcards !== prevState.flashcards) {
                callbacksRef.current?.onFlashcardsChange?.(state.flashcards);
            }
        });

        return unsubscribe;
    }, []);
}

/**
 * Hook to force re-render when any of the specified stores change.
 * Useful for components that need to stay in sync with multiple stores.
 */
export function useRealTimeSync(stores: ('user' | 'settings' | 'teaching' | 'auth' | 'doubt' | 'resource' | 'analytics')[]) {
    const [, forceUpdate] = useState(0);
    const triggerUpdate = useCallback(() => forceUpdate(c => c + 1), []);

    useEffect(() => {
        const unsubscribers: UnsubscribeFn[] = [];

        const storeMap = {
            user: useUserStore,
            settings: useSettingsStore,
            teaching: useTeachingStore,
            auth: useAuthStore,
            doubt: useDoubtStore,
            resource: useResourceStore,
            analytics: useAnalyticsStore,
        };

        stores.forEach(storeName => {
            const store = storeMap[storeName];
            if (store) {
                unsubscribers.push(store.subscribe(triggerUpdate));
            }
        });

        return () => {
            unsubscribers.forEach(unsub => unsub());
        };
    }, [stores, triggerUpdate]);
}

/**
 * Hook to listen to real-time events
 */
export function useRealTimeEvent(event: string, callback: EventCallback) {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    useEffect(() => {
        const unsubscribe = realTimeEvents.on(event, (...args) => {
            callbackRef.current(...args);
        });
        return unsubscribe;
    }, [event]);
}

/**
 * Hook to get a value from a store with automatic updates
 */
export function useStoreValue<S, T>(
    store: { subscribe: (callback: () => void) => UnsubscribeFn; getState: () => S },
    selector: (state: S) => T
): T {
    return useSyncExternalStore(
        store.subscribe,
        () => selector(store.getState()),
        () => selector(store.getState())
    );
}

// ============================================================================
// Initialize Cross-Store Synchronization
// ============================================================================

/**
 * Initialize cross-store synchronization.
 * Call this once in App.tsx to set up automatic state propagation.
 */
export function initRealTimeSync(): UnsubscribeFn {
    const unsubscribers: UnsubscribeFn[] = [];

    // Sync auth changes to user store and emit events
    unsubscribers.push(
        useAuthStore.subscribe((state, prevState) => {
            // Emit auth state change event
            realTimeEvents.emit(EVENTS.AUTH_STATE_CHANGE, state.isAuthenticated, state.user);
            
            // When user logs out, clear profile-related state to avoid stale data
            if (prevState.isAuthenticated && !state.isAuthenticated) {
                useUserStore.getState().resetOnboarding();
                useUserStore.getState().clearProfile();
                realTimeEvents.emit(EVENTS.AUTH_LOGOUT);
            }
            
            // When user logs in
            if (!prevState.isAuthenticated && state.isAuthenticated) {
                realTimeEvents.emit(EVENTS.AUTH_LOGIN, state.user);
            }
        })
    );

    // Sync profile profession changes to selectedProfession and emit events
    unsubscribers.push(
        useUserStore.subscribe((state, prevState) => {
            // Profile update event
            if (state.profile !== prevState.profile) {
                realTimeEvents.emit(EVENTS.PROFILE_UPDATE, state.profile);
            }
            
            // Profession change event
            if (state.selectedProfession !== prevState.selectedProfession) {
                realTimeEvents.emit(EVENTS.PROFESSION_CHANGE, state.selectedProfession);
            }
            
            // Sub-profession change event
            if (state.selectedSubProfession !== prevState.selectedSubProfession) {
                realTimeEvents.emit(EVENTS.SUB_PROFESSION_CHANGE, state.selectedSubProfession);
            }
            
            // Keep selectedProfession in sync with profile.profession
            if (state.profile?.profession !== prevState.profile?.profession) {
                if (state.profile?.profession && state.selectedProfession?.id !== state.profile.profession.id) {
                    // Profile was updated externally (e.g., from Firestore), sync to selected
                    useUserStore.setState({
                        selectedProfession: state.profile.profession,
                        selectedSubProfession: state.profile.subProfession,
                    });
                }
            }
        })
    );

    // Settings change events
    unsubscribers.push(
        useSettingsStore.subscribe((state, prevState) => {
            if (state.settings !== prevState.settings) {
                realTimeEvents.emit(EVENTS.SETTINGS_UPDATE, state.settings);
                
                if (state.settings.theme !== prevState.settings.theme) {
                    realTimeEvents.emit(EVENTS.THEME_CHANGE, state.settings.theme);
                }
                if (state.settings.language !== prevState.settings.language) {
                    realTimeEvents.emit(EVENTS.LANGUAGE_CHANGE, state.settings.language);
                }
                if (state.settings.accessibility !== prevState.settings.accessibility) {
                    realTimeEvents.emit(EVENTS.ACCESSIBILITY_CHANGE, state.settings.accessibility);
                }
            }
        })
    );

    // Teaching session events
    unsubscribers.push(
        useTeachingStore.subscribe((state, prevState) => {
            // Session start/end
            if (state.currentSession && !prevState.currentSession) {
                realTimeEvents.emit(EVENTS.SESSION_START, state.currentSession);
            }
            if (!state.currentSession && prevState.currentSession) {
                realTimeEvents.emit(EVENTS.SESSION_END, prevState.currentSession);
            }
            
            // Step change
            if (state.currentStep !== prevState.currentStep) {
                realTimeEvents.emit(EVENTS.STEP_CHANGE, state.currentStep, state.getCurrentStepData?.());
            }
            
            // Speaking state change
            if (state.isSpeaking !== prevState.isSpeaking) {
                realTimeEvents.emit(EVENTS.SPEAKING_CHANGE, state.isSpeaking);
            }
        })
    );

    // Doubt events
    unsubscribers.push(
        useDoubtStore.subscribe((state, prevState) => {
            // New doubt raised
            if (state.doubts.length > prevState.doubts.length) {
                const newDoubt = state.doubts[state.doubts.length - 1];
                realTimeEvents.emit(EVENTS.DOUBT_RAISED, newDoubt);
            }
            
            // Doubt resolved
            const resolvedDoubt = state.doubts.find((d, i) => 
                prevState.doubts[i] && 
                d.status === 'resolved' && 
                prevState.doubts[i].status !== 'resolved'
            );
            if (resolvedDoubt) {
                realTimeEvents.emit(EVENTS.DOUBT_RESOLVED, resolvedDoubt);
            }
        })
    );

    // Resource generation events
    unsubscribers.push(
        useResourceStore.subscribe((state, prevState) => {
            if (state.notes.length > prevState.notes.length) {
                const newNote = state.notes[state.notes.length - 1];
                realTimeEvents.emit(EVENTS.NOTES_GENERATED, newNote);
            }
            if (state.mindMaps.length > prevState.mindMaps.length) {
                const newMindMap = state.mindMaps[state.mindMaps.length - 1];
                realTimeEvents.emit(EVENTS.MINDMAP_GENERATED, newMindMap);
            }
            if (state.flashcards.length > prevState.flashcards.length) {
                realTimeEvents.emit(EVENTS.FLASHCARDS_GENERATED, state.flashcards);
            }
        })
    );

    // Analytics events
    unsubscribers.push(
        useAnalyticsStore.subscribe((state, prevState) => {
            // Session recorded
            if (state.sessions.length > prevState.sessions.length) {
                const newSession = state.sessions[state.sessions.length - 1];
                realTimeEvents.emit(EVENTS.SESSION_RECORDED, newSession);
            }
            
            // Achievement unlocked
            const newlyUnlocked = state.achievements.find((a, i) => 
                a.unlockedAt && (!prevState.achievements[i]?.unlockedAt)
            );
            if (newlyUnlocked) {
                realTimeEvents.emit(EVENTS.ACHIEVEMENT_UNLOCKED, newlyUnlocked);
            }
        })
    );

    return () => {
        unsubscribers.forEach(unsub => unsub());
        realTimeEvents.clear();
    };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Batch multiple state updates into a single render cycle.
 * Use this when you need to update multiple stores atomically.
 */
export function batchStateUpdates(updates: (() => void)[]): void {
    // React 18 automatically batches state updates, but we can use this
    // for explicit batching in older versions or for clarity
    updates.forEach(update => update());
}

/**
 * Create a debounced state update function.
 * Useful for high-frequency updates like typing or scrolling.
 */
export function createDebouncedUpdate<T>(
    updateFn: (value: T) => void,
    delayMs: number = 100
): (value: T) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    return (value: T) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            updateFn(value);
            timeoutId = null;
        }, delayMs);
    };
}

/**
 * Create a throttled state update function.
 * Ensures updates happen at most once per interval.
 */
export function createThrottledUpdate<T>(
    updateFn: (value: T) => void,
    intervalMs: number = 100
): (value: T) => void {
    let lastUpdateTime = 0;
    let pendingValue: T | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    
    return (value: T) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateTime;
        
        if (timeSinceLastUpdate >= intervalMs) {
            // Enough time has passed, update immediately
            updateFn(value);
            lastUpdateTime = now;
            pendingValue = null;
        } else {
            // Store pending value and schedule update
            pendingValue = value;
            if (!timeoutId) {
                timeoutId = setTimeout(() => {
                    if (pendingValue !== null) {
                        updateFn(pendingValue);
                        lastUpdateTime = Date.now();
                        pendingValue = null;
                    }
                    timeoutId = null;
                }, intervalMs - timeSinceLastUpdate);
            }
        }
    };
}

/**
 * Create an immediate state update that also emits an event
 */
export function createEventedUpdate<T>(
    updateFn: (value: T) => void,
    eventName: string
): (value: T) => void {
    return (value: T) => {
        updateFn(value);
        realTimeEvents.emit(eventName, value);
    };
}

/**
 * Get state version for change detection
 */
export function getStateVersion(): number {
    return (
        (useUserStore.getState().profile?.name?.length ?? 0) +
        useSettingsStore.getState().settings.theme.length +
        (useTeachingStore.getState().currentSession?.id?.length ?? 0)
    );
}
