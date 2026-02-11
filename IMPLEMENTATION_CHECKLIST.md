# Architecture & Scaling Implementation Checklist

This checklist tracks measures for stability, performance, and scalability to ~1M users. Treat Hosting + Functions + Firestore + Auth + Storage as the production system.

## Backend (Cloud Functions / Express)

- [x] **Health/readiness** — `/health` (liveness) and `/health/ready` (readiness with Firestore ping) implemented; use `/health/ready` for load balancer or monitoring.
- [x] **Central error middleware** — Structured error shape `{ error: string, code?: string }`; no raw stack to clients; full error logged server-side only.
- [x] **Timeouts** — Request-level timeout (60s in Functions); AI calls use timeout in aiService; 504 returned when exceeded.
- [x] **Retries** — Transient failures (5xx, 429, network) retried with backoff in aiApi/aiService; idempotent operations only.
- [x] **Rate limiting** — Per-uid limits on `/api/*` (Firestore in Functions, in-memory in Express); 429 with `Retry-After` header; user-facing message in frontend.
- [x] **Request body validation** — Zod schemas for `/api/*` payloads in Functions; reject oversized/invalid early; Express has manual checks + `express.json({ limit: '10mb' })`.
- [ ] **Idempotency (optional)** — For high-value writes: accept `Idempotency-Key` header; store result by key in Firestore with TTL; return same response for duplicates.

## Firestore

- [x] **Indexes** — Composite indexes in `firestore.indexes.json` for teaching_sessions, doubts, notes, flashcards, mind_maps; deploy with `firebase deploy --only firestore:indexes`.
- [x] **Security rules** — Rules in repo; `user_id` / `request.auth.uid` checks; **rate_limits** explicitly denied for clients (server-only).
- [x] **Pagination** — All list endpoints and app lists use `.limit()` and cursor/offset; virtualize long lists on frontend (notes, flashcards, curriculum).
- [ ] **Backup & recovery** — Enable scheduled Firestore exports to Cloud Storage; document restore steps and RTO/RPO.

## Functions scalability

- [ ] **2nd gen & split** — Prefer 2nd gen Functions; split `api` into multiple callable routes (e.g. api-resolve-doubt, api-generate-content) for memory/timeout and min instances.
- [ ] **Min instances** — Set min instances (e.g. 1) for most-used routes to reduce cold starts.
- [x] **Caching** — In-memory TTL cache for read-only/slow-changing data (AI model status, curriculum config).

## Frontend (Vite/React)

- [x] **Lazy routes** — Teaching, Studio, Admin, Teacher, Settings, Curriculum, etc. lazy-loaded with retry.
- [x] **Virtualized lists** — react-window used in Curriculum, Dashboard, Chat, and Leaderboard; single-pane navigation for Studio.
- [x] **Retry & offline** — Retry on failed AI/API; offline indicator; ensure critical paths have "Retry" and error boundaries.
- [x] **Error boundaries** — Route and key panels wrapped; fallback UI and "Try again" / "Go home".
- [x] **429/503 user messages** — "Too many requests" / "Service busy" with optional Retry-After; toasts in aiIntegration.
- [ ] **Bundle size** — Monitor in CI; fail or warn on large increases; lazy-load heavy libs (charting, PDF).

## Security

- [x] **CORS** — Restricted to Hosting domain(s) and known origins; no `*` in production.
- [x] **Secrets** — API keys (OpenRouter, Mistral) in Secret Manager or env; never in client or repo.
- [x] **Security headers** — X-Content-Type-Options, X-Frame-Options, Referrer-Policy via `helmet` and Hosting.
- [ ] **reCAPTCHA** — Optional on login, signup, or expensive AI endpoints (abuse protection).
- [ ] **Re-auth** — Require re-authentication for delete account / change password.

## Observability

- [x] **Structured logging** — JSON logs with method, path, duration, status, and uid (Phase 12).
- [ ] **Metrics & alerts** — Cloud Monitoring (invocations, latency, errors); alerts on error rate, p99, health failures, quotas.
- [ ] **Tracing** — Cloud Trace for Functions; optional OpenTelemetry for AI/Firestore.
- [x] **Health checks** — External HTTP checks on `/health` (with 5min in-memory caching).
- [ ] **Error tracking** — Frontend: send non-PII errors to Sentry (or similar) with consent; backend: log and optionally forward.

## CI/CD & capacity

- [ ] **CI** — On PR/main: lint, unit tests, build (frontend + Functions); block merge on failure.
- [ ] **CD** — Deploy Hosting + Functions + rules/indexes from main; use Firebase prod project; secrets from Secret Manager.
- [ ] **Rollback** — Document Hosting rollback and Functions redeploy of previous commit.
- [ ] **Load tests** — Simulate concurrent users (auth, Firestore, AI) with k6/Artillery; target p95/p99 and error rate.
- [ ] **Quotas & cost** — Set and monitor Firestore, Functions, AI provider quotas; budget alerts.

---

**Implementation order (high impact first):** Health/readiness → Error shape & timeouts → Rate limit + Retry-After → Validation (Zod) → Security headers → Firestore rules → Frontend 429/503 → Checklist doc → Pagination & virtualization → Caching → Split Functions → Observability → CI/CD & load tests.
