# Responsive & Cross-Device Verification

This document summarizes responsive design implementation and provides a manual test checklist for all supported screens, user flows, and devices.

## Implemented Responsive Features

### Global
- **Viewport:** `width=device-width, initial-scale=1.0, viewport-fit=cover` in `index.html` for proper scaling and safe areas on notched devices.
- **Overflow:** `html`, `body`, and `#root` use `overflow-x: hidden`; `overscroll-behavior-x: none` to prevent horizontal scroll.
- **Safe areas:** `.safe-top`, `.safe-bottom`, `.safe-left`, `.safe-right` use `env(safe-area-inset-*)` for notches and home indicators.
- **Touch:** `touch-action: manipulation`, `-webkit-tap-highlight-color: transparent` on buttons/links; WCAG 2.5.5 minimum **44×44px** touch targets on mobile (enforced in `index.css` for `max-width: 640px`).
- **Text:** `-webkit-text-size-adjust: 100%` on `body` for mobile readability.
- **Utilities:** `.container-responsive`, `.text-responsive-*`, `.gap-responsive`, `.p-responsive`, `.grid-responsive`, `.scrollbar-hide` for horizontal tab bars.

### Breakpoints (Tailwind / layout.ts)
- **Mobile:** &lt; 640px (sm)
- **Tablet:** 641–1024px (md, lg)
- **Laptop:** 1024–1279px
- **Desktop / 3-panel:** ≥ 1280px (xl)

---

## Page-by-Page Verification

### 1. Login (`/login`)
- [x] Centered layout; `min-h-screen min-h-[100dvh]`; `px-4 sm:px-5`; `safe-top safe-bottom`.
- [x] Role buttons: full-width stacked, `min-h-[52px]`, touch-friendly.
- [x] Avatar and title scale: `text-4xl sm:text-5xl md:text-6xl`, `w-32 h-32 sm:w-40 … md:w-48 … lg:w-56`.
- **Manual check:** Portrait/landscape phone, tablet; no horizontal scroll.

### 2. Onboarding (`/onboarding`)
- [x] Fixed header with `safe-top`; back button `min-h-[44px] min-w-[44px]`, `touch-manipulation`.
- [x] Content: `pt-24 pb-12 px-4 safe-bottom`; grids: `grid-cols-2 sm:grid-cols-2`, `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`, `grid-cols-2 sm:grid-cols-4` / `sm:grid-cols-2`.
- [x] Step cards and topic lists use responsive grids and spacing.
- **Manual check:** All steps (Mode → Board/Exam → Grade/Subject → Subject/Topic → Topic) usable on 320px–768px width; no overflow.

### 3. Curriculum (`/curriculum`)
- [x] Header: `safe-top`, back button 44×44px touch target; title `truncate max-w-[150px] sm:max-w-none`; "SWITCH" and "PROFILE" hidden or shortened on small screens (`hidden sm:inline`).
- [x] Main: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`.
- [x] Subject grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`.
- [x] Topic list: `flex-col sm:flex-row`; search/filter: `flex-col sm:flex-row`; "Topic Explanation" button full-width on small screens via `w-full sm:w-auto`.
- **Manual check:** Subject selection and topic list readable and tappable on phone; filters wrap or scroll.

### 4. Main OS / Teaching (`/learn/:topicId`)
- [x] **Layout switch at 1280px:** `isMobile = (max-width: 1279px)` → single-panel with tab bar (Home | Teach | Studio); ≥1280px → 3-panel layout.
- [x] Mobile tab bar: `min-h-[44px]`, `touch-manipulation`, `focus-visible:ring-2`.
- [x] Panels: on mobile, one panel full-screen at a time; `absolute inset-0`, `w-full h-full`; no body scroll (body overflow hidden on this page).
- [x] Header controls (Settings, Profile, Step counter, Mute, Prev/Next): 44×44px on mobile where applicable; `truncate max-w-[120px] sm:max-w-[160px]` for step text.
- [x] CSS vars: `--layout-page-px-fluid`, `--layout-gap-fluid` for fluid spacing; panels use `min-width: 0` to avoid flex overflow.
- **Manual check:** Resize from 1280px to 320px; switch Home/Teach/Studio; play/pause and step navigation work; no horizontal scroll or clipped content.

### 5. Dashboard (inside Profile panel)
- [x] Grids: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`, `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`; cards `p-4 sm:p-5`; `min-w-0` for truncation.
- [x] Nav icons: `min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0` so touch targets on mobile, compact on desktop.
- **Manual check:** Open Profile → View Dashboard on phone; all cards and links tappable.

### 6. Settings (`/settings`)
- [x] **Tabs:** On `md` and up, sidebar tabs; below `md`, horizontal scrollable tab bar with `overflow-x-auto scrollbar-hide`, `shrink-0`, `min-h-[44px]`.
- [x] Main content: `flex-1 min-w-0` to prevent overflow.
- **Manual check:** Resize to &lt;768px; tab bar scrolls horizontally; form sections readable.

### 7. Profile panel (slide-over)
- [x] Panel: `w-full max-w-md max-h-[85dvh] sm:max-h-[90dvh]`, `overflow-y-auto overflow-x-hidden`; close button 44×44px.
- [x] Backdrop and panel use `safe-top safe-bottom`; content area has `min-w-0` and truncation.
- **Manual check:** Open Profile on phone in portrait/landscape; scroll content; no overflow.

### 8. Teacher dashboard (`/teacher`)
- [x] Grade grid: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4`; subject grid: `grid-cols-2 sm:grid-cols-3`.
- [x] Tables and student cards: responsive padding and text.
- **Manual check:** Grade → Subject → Dashboard and student drilldown on tablet and phone.

### 9. Admin dashboard (`/admin`)
- [x] Same grid pattern as Teacher; tables can scroll horizontally on very small screens if needed (consider `overflow-x-auto` on table wrapper if issues appear).
- **Manual check:** Grade → Subject → Oversight dashboard on small viewports.

---

## User Flows to Test

| Flow | Key checkpoints |
|------|------------------|
| **Student – Curriculum** | Login → Student → Mode: Curriculum → Board → Grade → Subject → Topic → Main OS; change step, mute, switch panel (desktop) or tab (mobile). |
| **Student – Competitive** | Login → Student → Mode: Competitive → Exam → Subject → PYQ + Topic → Main OS; same as above. |
| **Teacher** | Login → Teacher → Grade → Subject → Dashboard → Student drilldown → Back. |
| **Admin** | Login → Admin → Grade → Subject → Oversight → Drilldown link. |
| **Settings** | From any role: open Settings; switch tabs (sidebar on desktop, horizontal scroll on mobile); change theme/language; save. |
| **Profile** | Open Profile; View Dashboard; back; Log out. |

---

## Device / Viewport Checklist

- [ ] **Phone (320px–430px):** Login, Onboarding, Curriculum, Teaching (tab bar), Settings (horizontal tabs), Profile panel.
- [ ] **Phone (430px–640px):** Same; confirm touch targets and no horizontal scroll.
- [ ] **Tablet (640px–1024px):** All flows; Teaching in single-panel mode with tab bar until 1280px.
- [ ] **Laptop (1024px–1279px):** Teaching still single-panel; 3-panel at 1280px+.
- [ ] **Desktop (1280px+):** 3-panel Teaching layout; all dashboards and tables readable.
- [ ] **Notched device / PWA:** Safe areas (safe-top, safe-bottom) leave content visible; no clipping behind notch or home indicator.
- [ ] **Reduced motion:** With `data-reduce-animations="true"`, transitions and animations minimized (App applies this from settings).

---

## Quick Fixes Applied (This Pass)

1. **Onboarding:** Back button 44×44px, `aria-label`, `safe-top` on fixed header, `safe-bottom` on content wrapper.
2. **Curriculum:** Back button 44×44px and `touch-manipulation`, `aria-label`.
3. **Global:** Existing safe areas, touch targets, and overflow rules confirmed; layout constants documented in `constants/layout.ts`.

If you find a viewport or flow where layout breaks or overflows, add it to this doc and fix with the same patterns: fluid grids, `min-w-0` on flex children, `overflow-x-hidden` on containers, and 44px minimum touch targets on mobile.
