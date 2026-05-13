# Crohna — Code Audit

## Overview

This document tracks the status of issues identified during code review.
It started as an external audit (Round 2, 2026-03-20) and has been kept up
to date as fixes land.

**Last verified:** 2026-05-13

| Category | Total | Fixed | Open |
|---|---|---|---|
| Critical | 6 | 6 | 0 |
| High | 10 | 10 | 0 |
| Medium | 34 | ~32 | 2 |
| Low | 20 | ~14 | 6 |

CI gates (lint, typecheck, vitest, prisma migrate deploy, next build,
playwright e2e) all pass on `claude/codebase-analysis-plan-UOmyn`.

---

## Critical — all FIXED

| # | Issue | Resolved by |
|---|-------|-------------|
| C1 | CSRF bypass when origin + referer both missing | `src/lib/csrf.ts:13-18` rejects with 403; `src/middleware.ts:10-15` enforces the same check at the edge. |
| C2 | Middleware disabled (no central auth/CSRF) | `src/middleware.ts:60-105` runs on `/api/*` (except `/api/auth/*` and `/api/health`) and on HTML routes. |
| C3 | CSP `unsafe-inline` defeats XSS protection | `src/middleware.ts:43-57` builds a per-request CSP with a nonce and `strict-dynamic`. `unsafe-inline` is kept as a CSP1 fallback only (modern browsers ignore it when nonces are present). |
| C4 | `req.json()` not wrapped in try/catch | `src/lib/validation.ts:105-126` exports `parseBody()`, used by every mutating route. |
| C5 | SSRF — image URLs accept private IPs | `src/lib/url-validation.ts:24-46` blocks 10/8, 172.16/12, 192.168/16, 169.254/16, 0.0.0.0, and localhost. Used in `api/events/route.ts` and `api/events/[id]/route.ts`. |
| C6 | Google Photos proxy is an open redirect | `src/app/api/google/photos/proxy/route.ts:91-104` now fetches the image server-side and streams the bytes back. |

---

## High — all FIXED

| # | Issue | Resolved by |
|---|-------|-------------|
| H1 | Missing `@@index([userId])` on Account/Session | `prisma/schema.prisma` lines 41, 51. |
| H2 | No rate limiting on insights/health | `src/app/api/insights/route.ts:8`, `src/app/api/health/route.ts:5`. |
| H3 | No confirmation on account deletion | `src/app/api/user/route.ts:95` requires `{ confirm: "DELETE_MY_ACCOUNT" }` via `deleteAccountSchema`. UI uses `ConfirmDialog` in `app/settings/page.tsx`. |
| H4 | Upload extension spoofing | `src/app/api/upload/route.ts:48` derives extension from `getExtensionFromMime(file.type)`. |
| H5 | Upload paths not user-scoped | `src/app/api/upload/route.ts:50` prefixes with `{safeUserId}/`. |
| H6 | Supabase singleton not `globalThis`-scoped | `src/lib/supabase.ts:3-6`. |
| H7 | Privacy settings are client-only | `src/lib/preferences.ts` exposes `getUserPreferences()`; `src/app/api/stories/[id]/share/route.ts` returns 403 when `shareableStories === false` and strips location-derived stats when `showLocationOnShared === false`. `ShareCard` consumes only the server-sanitized payload. |
| H8 | Story generation UI missing | `src/app/insights/page.tsx:303-320` ships two "Generate Story" buttons (current year + all-time). |
| H9 | Session refresh error never surfaced | `src/components/ui/SessionErrorBanner.tsx` reads `RefreshAccessTokenError` from the session and is mounted at `src/app/layout.tsx:88`. |
| H10 | Map always uses dark tiles | `src/components/map/EventMap.tsx:90-96` switches tile URLs based on `useTheme()`. |

---

## Medium — mostly FIXED

Open items are flagged with **OPEN**.

| # | Issue | Status |
|---|-------|--------|
| M1 | Unauth insights returns `{stats: null}` instead of 401 | FIXED — `api/insights/route.ts:13-15`. |
| M2 | Unauth events/stories return empty arrays | FIXED — all GET routes return 401 when there's no session. |
| M3 | Google status returns false booleans for unauth | FIXED — `api/google/status/route.ts:14-15`. |
| M4 | No rate limit on Google status | FIXED — `api/google/status/route.ts:8`. |
| M5 | Story regeneration race condition | FIXED — `api/stories/[id]/route.ts:130-150` wraps the re-check and update in `prisma.$transaction()`. |
| M6 | CSRF manual per-route | DEFENSE-IN-DEPTH — enforced both per-route (`validateCsrf()`) and at middleware. |
| M7 | No `endDate > startDate` check | FIXED — `src/lib/validation.ts:36-44, 62-70` via Zod `refine()`. |
| M8 | Location string has no length limit | FIXED — `validation.ts:29, 51` (`max(200)`). |
| M9 | Year param not validated for empty string | FIXED — `api/events/route.ts:71-78` skips empty + validates range. |
| M10 | No Zod schemas | FIXED — `src/lib/validation.ts` is used across every mutating route. |
| M11 | Google Photos imports loads all URLs into memory | FIXED — `api/google/photos/route.ts:111-119` queries with `WHERE imageUrl IN (...)` against the candidate batch only. |
| M12 | Google Calendar import same pattern | FIXED — `api/google/calendar/route.ts:92-99`. |
| M13 | Silent 500-item cap | FIXED — both routes return `warning` field when capped. |
| M14 | Insights unbounded findMany | FIXED — `api/insights/route.ts:54-59` uses `groupBy` and caps the date list at 2,000. |
| M15 | `handleScroll` recreated every render | FIXED — `Navigation.tsx` uses `useCallback`. |
| M16 | Missing `React.memo` | FIXED — `TimelineCard.tsx`, `AddMemoryButton.tsx` are wrapped in `memo()`. |
| M17 | Missing Suspense around `useSearchParams` | FIXED — wrappers in timeline, map, insights pages. |
| M18 | Photo drop zone not keyboard-accessible | FIXED — `EventModal.tsx` handles Enter/Space. |
| M19 | Map markers not keyboard-navigable | FIXED — `EventMap.tsx:172-187` sets tabindex/role + keydown. |
| M20 | TimelineCard not semantic | FIXED — uses `<motion.article>` with aria-label. |
| M21 | StatCard missing aria-label | FIXED. |
| M22 | Map legend missing roles | FIXED — `EventMap.tsx:307-318`. |
| M23 | No focus return on modal close | FIXED — `EventModal.tsx:54-71`. |
| M24 | Category buttons lack role | FIXED — `timeline/page.tsx` uses `role="radiogroup"` and `role="radio"`. |
| M25 | No GET on `/api/events/[id]` or `/api/stories/[id]` | FIXED — both handlers present. |
| M26 | Leaflet init has no try/catch | FIXED — `EventMap.tsx:62-79`. |
| M27 | Marker click handlers accumulate | FIXED — `EventMap.tsx:104-109` resets cleanup fns + markers each effect run. |
| M28 | Image upload races with form validation | FIXED — `useEventForm.ts` uses an AbortController. |
| M29 | setTimeout leak on unmount | FIXED — `EventModal.tsx` cleans up the timer. |
| M30 | `uploadImageIfNeeded` has no AbortController | FIXED. |
| M31 | Map theme effect leak | FIXED — separate effects for init vs theme. |
| M32 | No standard API response envelope | FIXED — `src/lib/api-response.ts` is used everywhere. |
| M33 | Pagination patterns differ | **OPEN** — events use cursor + `apiPaginated`; stories use cursor + `apiPaginated`. Both share helpers now, but the response shape still differs slightly in error cases. Not blocking. |
| M34 | Calendar dedup uses name+date instead of Google event ID | FIXED — `api/google/calendar/route.ts:88-99` dedupes on `sourceId` (Google event ID). |

---

## Low

| # | Issue | Status |
|---|-------|--------|
| L1 | No timezone handling | **OPEN** — all dates stored as UTC. Out of scope for this round. |
| L2 | `cn()` passes array instead of spreading | **OPEN** — minor; behavior is correct because clsx handles arrays. |
| L3 | Unused Tailwind content path `./src/pages` | **OPEN** — harmless. |
| L4 | Duplicate CSS variable definitions | **OPEN** — cosmetic. |
| L5 | Unused CSS classes | **OPEN** — would need a CSS coverage tool to verify. |
| L6 | `::selection` styled twice | FIXED. |
| L7 | Missing `onUpdate: Cascade` on Account | **OPEN** — not actually needed; provider IDs don't change. |
| L8 | Non-null assertions without guards | FIXED — `EventMap.tsx` uses `as number` after null filter. |
| L9 | Type cast without verification | **OPEN** — minor. |
| L10 | Google API error details logged | FIXED — only `status` is logged now. |
| L11 | Search input has no max length | FIXED — `Navigation.tsx:160` has `maxLength={200}`. |
| L12 | No request dedup on story generation | **OPEN** — rate limiter (5/min) provides coarse protection. |
| L13 | `eslint-disable no-explicit-any` in some routes | **OPEN** — would need targeted typing of Google API responses. |
| L14 | Duplicate navigation definitions | **OPEN** — single declaration verified, but the AUDIT note may have referred to a different file. |
| L15 | Hero uses hardcoded sign-in path | FIXED — uses `signIn("google", {...})`. |
| L16 | Demo events use Unsplash without attribution | **OPEN** — would need to add attribution to demo cards. |
| L17 | PWA manifest minimal | FIXED — `public/manifest.json` has icons, start_url, theme_color, shortcuts. |
| L18 | Map legend colors don't match markers | FIXED — markers use category colors (`EventMap.tsx:115-136`). |
| L19 | `getEventsByYear` lives in `data/demo.ts` | FIXED — now lives in `src/lib/utils.ts:64` only. |
| L20 | "Longest active run" metric is misleading | **OPEN** — label could be clearer; computation is correct. |

---

## Tooling and infrastructure

| Concern | Status |
|---|---|
| Tests | 215 unit + 4 e2e suites; coverage threshold 80% on `src/lib/**`, `src/app/api/**`, `src/middleware.ts`. |
| Lint | Clean (`next/core-web-vitals` + `next/typescript`). |
| Type-check | `tsc --noEmit` clean (strict mode). |
| Build | `next build` succeeds. |
| Prisma migrations | Baseline `20260513000000_init` committed under `prisma/migrations/`. CI runs `prisma migrate deploy` against a fresh Postgres service. See `prisma/migrations/README.md` for the baseline procedure on existing databases. |
| Logging | Structured JSON via `src/lib/logger.ts`. |
| Telemetry | `src/instrumentation.ts` boots env validation + emits unhandled errors to stderr. Sentry integration is stubbed (commented). |

---

## Known dependency CVEs (not yet patched here)

| Package | Severity | Why we haven't fixed it |
|---|---|---|
| `next@14.2.35` | High (multiple) — incl. GHSA-ffhc-5mcf-pf4q (CSP nonce XSS in App Router) | First patched version is 15.4.7 / 16.x. Major version bump with breaking changes (React 19 default, async APIs) — out of scope here. |
| `postcss` (transitive via next) | Moderate | Resolves with the Next.js bump above. |

`@anthropic-ai/sdk` was bumped from 0.80 → 0.95.2 in this round, which closes
the moderate memory-tool path-validation advisory.

---

## Feature recommendations (not yet implemented)

- Authenticated-flow e2e tests (create event → see it → delete it).
- Sentry/Datadog integration via `src/instrumentation.ts`.
- Tighten `next.config.mjs` CSP fallback now that the middleware sets a
  per-request CSP with a nonce.
- ESLint guardrails (e.g. forbid `console.error` in favor of `logger`).
- Geocoding for free-text locations.
- Optional public share links that respect `shareableStories` server-side
  (the current `/api/stories/[id]/share` endpoint is authenticated-only —
  unauthenticated public links would build on top of it).
