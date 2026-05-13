# Changelog

All notable changes are tracked here. Dates use ISO format.

## Unreleased — 2026-05-13

### Added
- **Prisma migrations baseline** (`prisma/migrations/20260513000000_init/`).
  Committing the initial schema so production deploys can use `migrate deploy`
  instead of `db push`. See `prisma/migrations/README.md` for the procedure to
  baseline an existing database (`prisma migrate resolve --applied <name>`).
- **CI: migrations job** spins up a Postgres 16 service container and runs
  `prisma migrate deploy` against an empty database. The `build` job now
  depends on this gate so a broken migration cannot reach production.
- **`/api/stories/[id]/share`** — server-enforced share payload that returns
  403 when the owner has `shareableStories: false` and strips
  location-derived stats (`cities`, `mostVisitedCity`) when
  `showLocationOnShared: false`. The insights page now consumes this endpoint
  for the share modal so the client cannot bypass the toggles.
- **`src/lib/preferences.ts`** — `getUserPreferences(userId)` returns the
  canonical preferences shape (defaults filled in) so other server modules
  can branch on privacy settings without re-implementing fallbacks.
- **`userPreferencesSchema`** in `src/lib/validation.ts` — typed shape with
  the two privacy keys + open catchall for future fields, capped at 10 KB.

### Changed
- **`@anthropic-ai/sdk` 0.80.0 → 0.95.2**, closing the moderate memory-tool
  path-validation advisory (GHSA-5474-4w2j-mq4c, GHSA-p7fg-763f-g4gf).
- **Settings page** now reads privacy prefs from the server only — the
  localStorage shadow copy is gone. Updates are optimistic but roll back on
  failure so the UI never disagrees with the server. Toggles are disabled
  until prefs load to prevent overwriting real values with defaults.
- **`prisma/seed.ts`** uses the same preference keys as the UI
  (`shareableStories`, `showLocationOnShared`) instead of the stale
  `privacy.showMap` / `privacy.showTimeline` shape.
- **`getEventsByYear`** now lives only in `src/lib/utils.ts`; the
  backwards-compat re-export from `src/data/demo.ts` is gone and
  `src/app/timeline/page.tsx` imports it directly.
- **AUDIT.md** rewritten to reflect the actual verified state of each item
  (was last updated 2026-03-20; many items were silently fixed since).

### Notes
- The `story-generator` now warns once (via the structured logger) when
  `ANTHROPIC_API_KEY` is missing so the template fallback isn't silent.
- Next.js 14.2.35 still has open CVEs (notably GHSA-ffhc-5mcf-pf4q affecting
  App Router CSP nonces). Patching requires a major-version bump to 15.4.7+
  or 16.x and is deferred to a dedicated upgrade effort.
