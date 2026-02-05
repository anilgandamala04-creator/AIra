# Comprehensive Validation Framework

This document defines the complete validation framework for Project AIra, ensuring every feature works correctly across all devices, states, and edge cases.

## Overview

A feature is considered **working properly** only if it satisfies all 10 validation categories below. No release without passing all checks.

---

## 1. Core Feature Functionality Validation

**Requirement:** Every feature must execute its intended action without errors, broken states, or unintended side effects.

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `teaching-panel-toggle` | Teaching panel maximize/minimize toggles correctly every time and preserves content state | Toggle Teaching panel maximize/minimize multiple times; verify content remains intact | Panel toggles without errors; content state preserved; no broken states |
| `studio-panel-lifecycle` | Studio panel opens, minimizes, restores, and closes without layout shift or content loss | Open Studio, minimize, restore, close; repeat 10 times rapidly | No layout shift; no content loss; smooth transitions |

### Validation Rules

- ✅ Feature executes intended action
- ✅ No errors or broken states
- ✅ No unintended side effects
- ✅ State preserved across interactions

---

## 2. Header & Panel Alignment Verification

**Requirement:** All header icons, badges, and panels must maintain defined alignment rules under all conditions.

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `home-chat-alignment-desktop` | Home icon remains vertically aligned with Chat panel on desktop and laptop | View at desktop (≥1280px) and laptop (1024–1279px); check Home icon vs Chat panel edge | Home icon vertically aligned with Chat panel content edge |
| `profile-studio-alignment-badges` | Profile avatar remains vertically aligned with Studio panel even when badges increase in width | Increase badge count from 1 to 99+; verify Profile avatar alignment with Studio panel | Profile avatar stays aligned with Studio panel edge; badges compress/truncate without breaking alignment |

### Alignment Rules

- **Desktop (≥1280px):** Home icon aligns with Chat panel content left edge
- **Laptop (1024–1279px):** Home icon aligns with Chat panel content left edge
- **Tablet (768–1023px):** Profile avatar aligns with Studio panel edge when visible
- **Mobile (≤767px):** Icons maintain order; badges stay in single row

### Validation Rules

- ✅ Alignment maintained during badge count changes
- ✅ Alignment maintained during panel maximize/minimize
- ✅ Alignment maintained during window resize
- ✅ No vertical shift of header elements

---

## 3. Responsiveness & Layout Integrity

**Requirement:** The application must adapt correctly to desktop, laptop, tablet, and mobile screens with no overflow, clipping, or misalignment.

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `resize-desktop-to-tablet` | Resizing from desktop to tablet does not cause panel overlap or hidden controls | Resize window from desktop (≥1280px) to tablet (768–1023px) continuously | No panel overlap; all controls visible and accessible; no clipping |
| `mobile-full-usability` | Mobile layout maintains full usability with all essential actions reachable | View at mobile (≤767px); verify all essential actions are reachable | All essential actions accessible; no dead space; proper touch targets (min 44px) |

### Viewport Ranges

- **Desktop:** ≥1280px
- **Laptop:** 1024–1279px
- **Tablet:** 768–1023px
- **Mobile:** ≤767px

### Validation Rules

- ✅ No overflow or clipping at any viewport size
- ✅ All controls accessible at all sizes
- ✅ Touch targets minimum 44px on mobile
- ✅ Smooth transitions between viewport sizes

---

## 4. Dynamic Content Handling

**Requirement:** UI must remain stable when content size changes dynamically (badges, AI output, topic steps).

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `badge-count-increase-alignment` | Increasing badge count shifts header icons left without breaking alignment | Simulate badge count increase from 1 to 99+; observe header icon positions | Icons shift left smoothly; alignment maintained; badges stay in single row |
| `long-ai-response-containment` | Long AI-generated responses stay contained within their panels without affecting header or layout | Trigger very long AI response in Chat or Teaching panel | Content scrolls inside panel only; header and other panels unaffected; no layout shift |

### Validation Rules

- ✅ Badges compress/truncate when needed; stay in single row
- ✅ Long content scrolls inside panels only
- ✅ Header and other panels unaffected by content changes
- ✅ No layout shift during dynamic content updates

---

## 5. AI Feature Verification

**Requirement:** All AI-powered features must respond correctly, contextually, and reliably.

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `teaching-question-scope` | Teaching questions produce responses only inside the Teaching panel | Ask a question in Chat; verify response appears only in Teaching/Chat panels | Response appears only in Teaching/Chat; Studio panel unchanged |
| `ai-timeout-fallback` | If AI fails or times out, a controlled fallback state appears instead of blank or frozen UI | Disconnect network or force timeout; send chat message | Fallback message/retry UI appears; no blank screen; no frozen panel; retry possible |

### AI Features

- **Chat:** Real-time conversation with AI
- **Doubt Resolution:** Structured explanations with examples and quiz
- **Notes:** AI-generated study notes
- **Mind Map:** AI-generated mind maps
- **Flashcards:** AI-generated flashcards

### Validation Rules

- ✅ AI responses appear in correct panels only
- ✅ Context-aware output (panel-scoped)
- ✅ Graceful failure handling (fallback UI, not silent freeze)
- ✅ Retry mechanism available on failure

---

## 6. Interaction & State Transition Testing

**Requirement:** All user interactions must work across mouse, touch, and keyboard where applicable.

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `profile-avatar-click` | Clicking profile avatar opens in-app profile settings (not a side drawer) | Click profile avatar in header | Profile opens as centered overlay inside app; not side drawer |
| `google-login-profile-picture` | Logging in with Google immediately reflects the real profile picture in the header | Log in with Google; check header profile avatar | Real profile picture appears in header immediately after login |

### Interaction Types

- **Mouse:** Click, hover, drag
- **Touch:** Tap, swipe, pinch
- **Keyboard:** Tab navigation, Enter, Escape

### Validation Rules

- ✅ All interactions work across input methods
- ✅ State transitions are smooth and predictable
- ✅ Focus management correct (keyboard navigation)
- ✅ No layout shift during interactions

---

## 7. Animation & Motion Validation

**Requirement:** All animations must run smoothly without interfering with usability or layout.

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `floating-emoji-no-reflow` | Floating emoji animation does not trigger layout reflow | Observe AI avatar floating animation on Teaching page | Animation runs smoothly; no layout reflow; no visual glitches |
| `login-to-main-transition` | Page transitions from login to main OS screen complete without flicker or jump | Complete login flow; observe transition to main screen | Smooth transition; no flicker; no jump; no layout shift |

### Animation Types

- **Floating emoji:** Gentle breathing motion, soft glow pulse, natural eye blink
- **Panel transitions:** Maximize/minimize, open/close
- **Page transitions:** Login to main screen
- **Micro interactions:** Button presses, hover states

### Validation Rules

- ✅ Animations respect `reduceAnimations` setting
- ✅ No layout reflow during animations
- ✅ Smooth 60fps performance
- ✅ No visual glitches or flicker

---

## 8. Performance & Stability Checks

**Requirement:** No feature may degrade performance or introduce instability under normal usage.

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `rapid-panel-toggle` | Rapidly toggling panels does not cause lag or visual glitches | Rapidly toggle Teaching and Studio panels maximize/minimize 20 times | No lag; no visual glitches; smooth transitions throughout |
| `slow-network-ai-ui` | Slow network conditions do not break AI or UI behavior | Throttle network to Slow 3G; use AI features and interact with UI | AI shows loading states; UI remains responsive; no broken behavior |

### Performance Targets

- **Panel toggles:** < 100ms response time
- **AI requests:** Show loading state immediately; timeout after 60s
- **Large content:** Scroll performance smooth (60fps)
- **Network throttling:** UI remains responsive

### Validation Rules

- ✅ No lag during rapid interactions
- ✅ Loading states visible during async operations
- ✅ UI remains responsive under slow network
- ✅ No memory leaks or performance degradation

---

## 9. Error Handling & Edge Case Coverage

**Requirement:** Every feature must define and handle failure states gracefully.

### Concrete Examples

| Check ID | Description | How to Verify | Pass Criteria |
|----------|-------------|---------------|---------------|
| `missing-badge-data` | Missing badge data does not break header layout | Simulate missing profession/subject badge data | Header layout remains stable; height unchanged; icons positioned correctly |
| `ai-service-failure-retry` | AI service failure shows retry or error message instead of silent failure | Force AI API error; attempt to use AI feature | Error/retry message visible; user can retry; no silent failure |

### Failure Rules

- **AI empty or error:** Show fallback message + retry; never leave panel frozen
- **Badge data missing:** Header spacing and height remain stable
- **Lesson content missing:** Show retry state, not infinite loading
- **Long content:** Scroll inside panel only; no overflow or layout shift
- **Step indicator:** Updates must not move other header/panel elements

### Validation Rules

- ✅ All failure states have defined UI
- ✅ User can recover from errors (retry, go back)
- ✅ No silent failures
- ✅ Layout remains stable during errors

---

## 10. Final Acceptance Criteria (Non-Negotiable)

A feature is considered **working properly** only if:

1. ✅ **It behaves correctly across all supported devices** (Desktop ≥1280px, Laptop 1024–1279px, Tablet 768–1023px, Mobile ≤767px)
2. ✅ **It survives resizing, dynamic content, and repeated interaction** (no layout shift, no content loss, no broken states)
3. ✅ **It does not break alignment, responsiveness, or other features** (no side effects, no regression)

### Release Gate

**No release without passing all validation checks.** Use the verification checklist (`src/constants/verificationChecklist.ts`) for manual QA or E2E integration.

---

## Validation Checklist

See `docs/VERIFICATION_CHECKLIST.md` for the complete checklist with all test cases organized by category.

## Implementation

- **Contracts:** `src/constants/featureContracts.ts`
- **Checklist:** `src/constants/verificationChecklist.ts`
- **Documentation:** `docs/VERIFICATION_CHECKLIST.md`, `docs/VALIDATION_FRAMEWORK.md`
