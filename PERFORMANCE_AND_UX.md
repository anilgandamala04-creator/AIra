# Performance and User Experience

The application is designed to deliver **stable performance**, **responsive interactions**, and a **seamless, consistent user experience**, with no broken functionality, incomplete behavior, or degraded performance at any stage.

## Guarantees

- **Stable performance** — No unnecessary re-renders or jank; heavy work is deferred or chunked (e.g. lazy AI health).
- **Responsive interactions** — Buttons and inputs reflect state immediately; loading states are shown for async actions (AI lesson, quiz, notes, mind map, flashcards, chat).
- **Seamless UX** — Consistent step display ("Step X of Y" never shows X > Y), fallbacks for missing data ("Loading...", empty states), and clear error messages with recovery hints.
- **No broken functionality** — Error boundaries catch render failures; async paths clear loading state in all branches (success, catch, finally) so the UI never stays stuck in "loading".

## Implementation Highlights

| Area | Behavior |
|------|----------|
| **Teaching step display** | `stepDisplayNum` and `stepDisplayTotal` clamp values so "Step X of Y" is always consistent (e.g. never "Step 6 of 3"). |
| **AI operations** | `isGeneratingAiLesson`, `isGeneratingQuiz`, and store flags (`isGeneratingNotes`, etc.) are cleared in `finally` or in every `catch` path. |
| **Chat** | `isWaitingForAI` is set to `false` in both `.then()` and `.catch()` of `generateChatResponse`. Input is disabled and a typing indicator is shown while waiting. |
| **Errors** | Toasts and inline messages explain failures; backend-unavailable messages include the exact command to start the backend (`npm run dev:backend`). |
| **Motion** | `reduceAnimations` (from settings) is respected via MotionConfig so animations can be disabled for accessibility. |
| **Suspense / routing** | Route-level error boundaries and full-page loader prevent blank screens; lazy-loaded panels use appropriate fallbacks. |

## Consistency with Feature Contracts

Async flows and error handling align with `src/constants/featureContracts.ts` (e.g. FAILURE_RULES): users always see a clear outcome (success toast, error message, or fallback content) and are never left with an infinite loading state or empty panel without explanation.
