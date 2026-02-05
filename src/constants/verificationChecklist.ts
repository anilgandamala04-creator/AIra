/**
 * Verification checklist (non-optional release gate).
 * No release without passing these checks.
 * Run manually or integrate into E2E/QA.
 */

import { VIEWPORT_RANGES } from './featureContracts';

export type ChecklistItem = {
  id: string;
  category: string;
  description: string;
  howToVerify: string;
  passCriteria: string;
};

/** Release-blocking verification checklist. */
export const VERIFICATION_CHECKLIST: ChecklistItem[] = [
  // 1. Core Feature Functionality Validation
  {
    id: 'teaching-panel-toggle',
    category: 'Core Functionality',
    description: 'Teaching panel maximize/minimize toggles correctly every time and preserves content state',
    howToVerify: 'Toggle Teaching panel maximize/minimize multiple times; verify content remains intact',
    passCriteria: 'Panel toggles without errors; content state preserved; no broken states',
  },
  {
    id: 'studio-panel-lifecycle',
    category: 'Core Functionality',
    description: 'Studio panel opens, minimizes, restores, and closes without layout shift or content loss',
    howToVerify: 'Open Studio, minimize, restore, close; repeat 10 times rapidly',
    passCriteria: 'No layout shift; no content loss; smooth transitions',
  },
  // 2. Header & Panel Alignment Verification
  {
    id: 'home-chat-alignment-desktop',
    category: 'Header Alignment',
    description: 'Home icon remains vertically aligned with Chat panel on desktop and laptop',
    howToVerify: `View at desktop (≥${VIEWPORT_RANGES.desktop.min}px) and laptop (${VIEWPORT_RANGES.laptop.min}–${VIEWPORT_RANGES.laptop.max}px); check Home icon vs Chat panel edge`,
    passCriteria: 'Home icon vertically aligned with Chat panel content edge',
  },
  {
    id: 'profile-studio-alignment-badges',
    category: 'Header Alignment',
    description: 'Profile avatar remains vertically aligned with Studio panel even when badges increase in width',
    howToVerify: 'Increase badge count from 1 to 99+; verify Profile avatar alignment with Studio panel',
    passCriteria: 'Profile avatar stays aligned with Studio panel edge; badges compress/truncate without breaking alignment',
  },
  // 3. Responsiveness & Layout Integrity
  {
    id: 'resize-desktop-to-tablet',
    category: 'Responsiveness',
    description: 'Resizing from desktop to tablet does not cause panel overlap or hidden controls',
    howToVerify: 'Resize window from desktop (≥1280px) to tablet (768–1023px) continuously',
    passCriteria: 'No panel overlap; all controls visible and accessible; no clipping',
  },
  {
    id: 'mobile-full-usability',
    category: 'Responsiveness',
    description: 'Mobile layout maintains full usability with all essential actions reachable',
    howToVerify: `View at mobile (≤${VIEWPORT_RANGES.mobile.max}px); verify all essential actions are reachable`,
    passCriteria: 'All essential actions accessible; no dead space; proper touch targets (min 44px)',
  },
  // 4. Dynamic Content Handling
  {
    id: 'badge-count-increase-alignment',
    category: 'Dynamic Content',
    description: 'Increasing badge count shifts header icons left without breaking alignment',
    howToVerify: 'Simulate badge count increase from 1 to 99+; observe header icon positions',
    passCriteria: 'Icons shift left smoothly; alignment maintained; badges stay in single row',
  },
  {
    id: 'long-ai-response-containment',
    category: 'Dynamic Content',
    description: 'Long AI-generated responses stay contained within their panels without affecting header or layout',
    howToVerify: 'Trigger very long AI response in Chat or Teaching panel',
    passCriteria: 'Content scrolls inside panel only; header and other panels unaffected; no layout shift',
  },
  // 5. AI Feature Verification
  {
    id: 'teaching-question-scope',
    category: 'AI Features',
    description: 'Teaching questions produce responses only inside the Teaching panel',
    howToVerify: 'Ask a question in Chat; verify response appears only in Teaching/Chat panels',
    passCriteria: 'Response appears only in Teaching/Chat; Studio panel unchanged',
  },
  {
    id: 'ai-timeout-fallback',
    category: 'AI Features',
    description: 'If AI fails or times out, a controlled fallback state appears instead of blank or frozen UI',
    howToVerify: 'Disconnect network or force timeout; send chat message',
    passCriteria: 'Fallback message/retry UI appears; no blank screen; no frozen panel; retry possible',
  },
  // 6. Interaction & State Transition Testing
  {
    id: 'profile-avatar-click',
    category: 'Interaction',
    description: 'Clicking profile avatar opens in-app profile settings (not a side drawer)',
    howToVerify: 'Click profile avatar in header',
    passCriteria: 'Profile opens as centered overlay inside app; not side drawer',
  },
  {
    id: 'google-login-profile-picture',
    category: 'State Transition',
    description: 'Logging in with Google immediately reflects the real profile picture in the header',
    howToVerify: 'Log in with Google; check header profile avatar',
    passCriteria: 'Real profile picture appears in header immediately after login',
  },
  // 7. Animation & Motion Validation
  {
    id: 'floating-emoji-no-reflow',
    category: 'Animation',
    description: 'Floating emoji animation does not trigger layout reflow',
    howToVerify: 'Observe AI avatar floating animation on Teaching page',
    passCriteria: 'Animation runs smoothly; no layout reflow; no visual glitches',
  },
  {
    id: 'login-to-main-transition',
    category: 'Animation',
    description: 'Page transitions from login to main OS screen complete without flicker or jump',
    howToVerify: 'Complete login flow; observe transition to main screen',
    passCriteria: 'Smooth transition; no flicker; no jump; no layout shift',
  },
  // 8. Performance & Stability Checks
  {
    id: 'rapid-panel-toggle',
    category: 'Performance',
    description: 'Rapidly toggling panels does not cause lag or visual glitches',
    howToVerify: 'Rapidly toggle Teaching and Studio panels maximize/minimize 20 times',
    passCriteria: 'No lag; no visual glitches; smooth transitions throughout',
  },
  {
    id: 'slow-network-ai-ui',
    category: 'Performance',
    description: 'Slow network conditions do not break AI or UI behavior',
    howToVerify: 'Throttle network to Slow 3G; use AI features and interact with UI',
    passCriteria: 'AI shows loading states; UI remains responsive; no broken behavior',
  },
  // 9. Error Handling & Edge Case Coverage
  {
    id: 'missing-badge-data',
    category: 'Error Handling',
    description: 'Missing badge data does not break header layout',
    howToVerify: 'Simulate missing profession/subject badge data',
    passCriteria: 'Header layout remains stable; height unchanged; icons positioned correctly',
  },
  {
    id: 'ai-service-failure-retry',
    category: 'Error Handling',
    description: 'AI service failure shows retry or error message instead of silent failure',
    howToVerify: 'Force AI API error; attempt to use AI feature',
    passCriteria: 'Error/retry message visible; user can retry; no silent failure',
  },
  // Additional comprehensive checks
  {
    id: 'resize-no-jump',
    category: 'Responsiveness',
    description: 'Resize window continuously for 30 seconds',
    howToVerify: 'Resize browser from mobile width to desktop and back repeatedly for 30s',
    passCriteria: 'No header icon jumps; badges stay in one row; panel alignment stable',
  },
  {
    id: 'studio-toggle-10x',
    category: 'Core Functionality',
    description: 'Rapidly toggle Studio panel maximize/minimize 10 times',
    howToVerify: 'Click maximize then restore 10 times quickly',
    passCriteria: 'No visual glitches; layout restores correctly each time',
  },
  {
    id: 'badge-1-to-99',
    category: 'Dynamic Content',
    description: 'Header icons keep order and alignment when badge count changes 1 → 99+',
    howToVerify: 'Simulate or add many badges; verify header',
    passCriteria: 'Icons stay in order; no vertical shift; badges remain single row (compress/truncate)',
  },
  {
    id: 'desktop-alignment',
    category: 'Header Alignment',
    description: 'Desktop (≥1280px): Home icon aligns with Chat panel edge',
    howToVerify: `View at width >= ${VIEWPORT_RANGES.desktop.min}px`,
    passCriteria: 'Home icon and Chat panel content left edge align',
  },
  {
    id: 'laptop-alignment',
    category: 'Responsiveness',
    description: 'Laptop (1024–1279px): layout and alignment correct',
    howToVerify: `View at width ${VIEWPORT_RANGES.laptop.min}–${VIEWPORT_RANGES.laptop.max}px`,
    passCriteria: 'Header and panels usable; no overflow or misalignment',
  },
  {
    id: 'tablet-alignment',
    category: 'Header Alignment',
    description: 'Tablet (768–1023px): Profile avatar aligns with Studio panel edge when visible',
    howToVerify: `View at width ${VIEWPORT_RANGES.tablet.min}–${VIEWPORT_RANGES.tablet.max}px`,
    passCriteria: 'Profile and panel edges align; touch targets adequate',
  },
  {
    id: 'mobile-alignment',
    category: 'Responsiveness',
    description: 'Mobile (≤767px): header and tabs usable',
    howToVerify: `View at width <= ${VIEWPORT_RANGES.mobile.max}px`,
    passCriteria: 'No dead space; icons in correct order; badges single row',
  },
  {
    id: 'login-logout',
    category: 'State Transition',
    description: 'Login and logout do not break layout or panel state',
    howToVerify: 'Log in, navigate to Teaching, then log out (or switch user)',
    passCriteria: 'No layout shift; no stale panel state',
  },
  {
    id: 'ai-empty-content',
    category: 'AI Features',
    description: 'If AI returns empty content, panel shows retry state',
    howToVerify: 'Simulate empty AI response or use mock',
    passCriteria: 'User sees message + retry option; panel does not freeze',
  },
  {
    id: 'long-explanation-scroll',
    category: 'Dynamic Content',
    description: 'Long AI explanations scroll inside Teaching panel, not overflow screen',
    howToVerify: 'Trigger long step content or long AI reply in Chat',
    passCriteria: 'Content scrolls inside panel; no body overflow; header fixed',
  },
  {
    id: 'step-indicator-no-move',
    category: 'Dynamic Content',
    description: 'AI-generated steps update step indicator without moving header elements',
    howToVerify: 'Advance steps; observe header (step X of Y)',
    passCriteria: 'Step text updates; no shift in icons or layout',
  },
  {
    id: 'slow-network-loading',
    category: 'Performance',
    description: 'With slow connection, UI shows loading states without shifting icons',
    howToVerify: 'Throttle network to Slow 3G; load Teaching page and send chat',
    passCriteria: 'Loading indicators visible; header/icons stable; no layout jump',
  },
  {
    id: 'large-ai-output',
    category: 'Performance',
    description: 'Large AI outputs do not cause header reflow or panel jumps',
    howToVerify: 'Receive a very long AI message in Chat',
    passCriteria: 'Chat scrolls internally; header and other panels stable',
  },
  {
    id: 'lesson-content-empty',
    category: 'Error Handling',
    description: 'If lesson content fails to load, show retry state not infinite loading',
    howToVerify: 'Simulate topic with no content or API failure',
    passCriteria: 'Retry or error state visible; user can retry or go back',
  },
];

/** Categories for grouping checklist in UI/reports. */
export const CHECKLIST_CATEGORIES = [
  'Core Functionality',
  'Header Alignment',
  'Responsiveness',
  'Dynamic Content',
  'AI Features',
  'Interaction',
  'State Transition',
  'Animation',
  'Performance',
  'Error Handling',
] as const;
