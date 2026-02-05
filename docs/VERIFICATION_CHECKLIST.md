# Verification Checklist (Non-Optional Release Gate)

No release without passing these checks. Use for manual QA or E2E integration.

---

## 1. Feature "works properly" definition

A feature is considered working only if:

- It behaves correctly across **all supported devices** (Desktop ≥1280px, Laptop 1024–1279px, Tablet 768–1023px, Mobile ≤767px).
- It **survives dynamic state changes** (login, logout, resize, data growth).
- It produces **deterministic results** under the same inputs.

---

## 2. Core Feature Functionality Validation

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `teaching-panel-toggle` | Teaching panel maximize/minimize toggles correctly every time and preserves content state | Toggle Teaching panel maximize/minimize multiple times; verify content remains intact | Panel toggles without errors; content state preserved; no broken states |
| `studio-panel-lifecycle` | Studio panel opens, minimizes, restores, and closes without layout shift or content loss | Open Studio, minimize, restore, close; repeat 10 times rapidly | No layout shift; no content loss; smooth transitions |

---

## 3. Header & Panel Alignment Verification

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `home-chat-alignment-desktop` | Home icon remains vertically aligned with Chat panel on desktop and laptop | View at desktop (≥1280px) and laptop (1024–1279px); check Home icon vs Chat panel edge | Home icon vertically aligned with Chat panel content edge |
| `profile-studio-alignment-badges` | Profile avatar remains vertically aligned with Studio panel even when badges increase in width | Increase badge count from 1 to 99+; verify Profile avatar alignment with Studio panel | Profile avatar stays aligned with Studio panel edge; badges compress/truncate without breaking alignment |
| `desktop-alignment` | Desktop (≥1280px): Home icon aligns with Chat panel edge | View at width ≥1280px | Home icon and Chat panel content left edge align |
| `tablet-alignment` | Tablet (768–1023px): Profile avatar aligns with Studio panel edge when visible | View at 768–1023px | Profile and panel edges align; touch targets adequate |
| `badge-1-to-99` | Header icons keep order and alignment when badge count changes 1 → 99+ | Simulate or add many badges; verify header | Icons stay in order; no vertical shift; badges remain single row (compress/truncate) |

---

## 4. Responsiveness & Layout Integrity

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `resize-desktop-to-tablet` | Resizing from desktop to tablet does not cause panel overlap or hidden controls | Resize window from desktop (≥1280px) to tablet (768–1023px) continuously | No panel overlap; all controls visible and accessible; no clipping |
| `mobile-full-usability` | Mobile layout maintains full usability with all essential actions reachable | View at mobile (≤767px); verify all essential actions are reachable | All essential actions accessible; no dead space; proper touch targets (min 44px) |
| `resize-no-jump` | Resize window continuously for 30 seconds | Resize browser from mobile width to desktop and back repeatedly for 30s | No header icon jumps; badges stay in one row; panel alignment stable |
| `laptop-alignment` | Laptop (1024–1279px): layout and alignment correct | View at 1024–1279px | Header and panels usable; no overflow or misalignment |
| `mobile-alignment` | Mobile (≤767px): header and tabs usable | View at ≤767px | No dead space; icons in correct order; badges single row |

---

## 5. Dynamic Content Handling

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `badge-count-increase-alignment` | Increasing badge count shifts header icons left without breaking alignment | Simulate badge count increase from 1 to 99+; observe header icon positions | Icons shift left smoothly; alignment maintained; badges stay in single row |
| `long-ai-response-containment` | Long AI-generated responses stay contained within their panels without affecting header or layout | Trigger very long AI response in Chat or Teaching panel | Content scrolls inside panel only; header and other panels unaffected; no layout shift |
| `long-explanation-scroll` | Long AI explanations scroll inside Teaching panel, not overflow screen | Trigger long step content or long AI reply in Chat | Content scrolls inside panel; no body overflow; header fixed |
| `step-indicator-no-move` | AI-generated steps update step indicator without moving header elements | Advance steps; observe header (step X of Y) | Step text updates; no shift in icons or layout |

---

## 6. AI Feature Verification

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `teaching-question-scope` | Teaching questions produce responses only inside the Teaching panel | Ask a question in Chat; verify response appears only in Teaching/Chat panels | Response appears only in Teaching/Chat; Studio panel unchanged |
| `ai-timeout-fallback` | If AI fails or times out, a controlled fallback state appears instead of blank or frozen UI | Disconnect network or force timeout; send chat message | Fallback message/retry UI appears; no blank screen; no frozen panel; retry possible |
| `ai-empty-content` | If AI returns empty content, panel shows retry state | Simulate empty AI response or use mock | User sees message + retry option; panel does not freeze |

---

## 7. Interaction & State Transition Testing

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `profile-avatar-click` | Clicking profile avatar opens in-app profile settings (not a side drawer) | Click profile avatar in header | Profile opens as centered overlay inside app; not side drawer |
| `google-login-profile-picture` | Logging in with Google immediately reflects the real profile picture in the header | Log in with Google; check header profile avatar | Real profile picture appears in header immediately after login |
| `login-logout` | Login and logout do not break layout or panel state | Log in, navigate to Teaching, then log out (or switch user) | No layout shift; no stale panel state |

---

## 8. Animation & Motion Validation

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `floating-emoji-no-reflow` | Floating emoji animation does not trigger layout reflow | Observe AI avatar floating animation on Teaching page | Animation runs smoothly; no layout reflow; no visual glitches |
| `login-to-main-transition` | Page transitions from login to main OS screen complete without flicker or jump | Complete login flow; observe transition to main screen | Smooth transition; no flicker; no jump; no layout shift |

---

## 9. Performance & Stability Checks

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `rapid-panel-toggle` | Rapidly toggling panels does not cause lag or visual glitches | Rapidly toggle Teaching and Studio panels maximize/minimize 20 times | No lag; no visual glitches; smooth transitions throughout |
| `slow-network-ai-ui` | Slow network conditions do not break AI or UI behavior | Throttle network to Slow 3G; use AI features and interact with UI | AI shows loading states; UI remains responsive; no broken behavior |
| `slow-network-loading` | With slow connection, UI shows loading states without shifting icons | Throttle network to Slow 3G; load Teaching page and send chat | Loading indicators visible; header/icons stable; no layout jump |
| `large-ai-output` | Large AI outputs do not cause header reflow or panel jumps | Receive a very long AI message in Chat | Chat scrolls internally; header and other panels stable |
| `studio-toggle-10x` | Rapidly toggle Studio panel maximize/minimize 10 times | Click maximize then restore 10 times quickly | No visual glitches; layout restores correctly each time |

---

## 10. Error Handling & Edge Case Coverage

| ID | Check | How to verify | Pass criteria |
|----|--------|----------------|----------------|
| `missing-badge-data` | Missing badge data does not break header layout | Simulate missing profession/subject badge data | Header layout remains stable; height unchanged; icons positioned correctly |
| `ai-service-failure-retry` | AI service failure shows retry or error message instead of silent failure | Force AI API error; attempt to use AI feature | Error/retry message visible; user can retry; no silent failure |
| `lesson-content-empty` | If lesson content fails to load, show retry state not infinite loading | Simulate topic with no content or API failure | Retry or error state visible; user can retry or go back |

---

## Failure Rules (Contracts)

- **AI empty or error:** Show fallback message + retry; never leave panel frozen.
- **Badge data missing:** Header spacing and height remain stable.
- **Lesson content missing:** Show retry state, not infinite loading.
- **Long content:** Scroll inside panel only; no overflow or layout shift.
- **Step indicator:** Updates must not move other header/panel elements.

---

## Validation Layers (Every Feature)

1. **Interaction:** Click, tap, keyboard.
2. **State change:** Login, logout, resize, toggle.
3. **Regression:** No side effects elsewhere (e.g. profile open doesn't affect Studio alignment).

---

## Final Acceptance Criteria (Non-Negotiable)

A feature is considered **working properly** only if:

1. ✅ It behaves correctly across **all supported devices**
2. ✅ It **survives resizing, dynamic content, and repeated interaction**
3. ✅ It **does not break alignment, responsiveness, or other features**

---

*Contracts and checklist items are also defined in code: `src/constants/featureContracts.ts`, `src/constants/verificationChecklist.ts`. See `docs/VALIDATION_FRAMEWORK.md` for comprehensive validation framework documentation.*
