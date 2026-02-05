/**
 * Navigation Utilities
 * 
 * Smart navigation helpers that respect the application's navigation requirements:
 * - Topic selection goes directly to Main OS Screen
 * - Dashboard is only accessible via Profile panel
 * - Default redirects go to active session or curriculum, not dashboard
 */

import { useTeachingStore } from '../stores/teachingStore';

/**
 * Get the default redirect path after login or app initialization.
 * Priority:
 * 1. Active teaching session (Main OS Screen)
 * 2. Curriculum (to select a topic)
 */
export function getDefaultRedirectPath(): string {
    const currentSession = useTeachingStore.getState().currentSession;
    
    // If there's an active session, go directly to Main OS Screen
    if (currentSession?.topicId) {
        return `/learn/${currentSession.topicId}`;
    }
    
    // Otherwise, go to curriculum to let user select a topic
    // Dashboard is only accessible via Profile panel
    return '/curriculum';
}

