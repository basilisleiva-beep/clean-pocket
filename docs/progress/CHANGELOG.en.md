# Clean Pocket · CHANGELOG

*English · [Ελληνικά](CHANGELOG.md)*

Versions follow `CACHE_VERSION` in `sw.js`. Every entry names how it was verified.
Keep this file and the Greek `CHANGELOG.md` in sync.

## 3.1.3 · 2026-09-27 (Google Play preparation)
- New `privacy.html` (privacy policy, Greek and English) linked from More → "About"; the page is precached by
  the service worker.
- Android package (Trusted Web Activity, `io.github.basilisleivabeep.cleanpocket`, target SDK 36) built with
  Bubblewrap; asset links served from the `basilisleiva-beep.github.io` repo; store material in `docs/play-store/`.
- Verified: `npm test` 30/30; the APK is signed and `apksigner verify` shows the upload key; Google's Digital
  Asset Links API returns the package and SHA-256.

## 3.1.2 · 2026-09-26 23:45
- Tour spotlight clamped to the viewport and re-positioned on scroll/resize (tall targets, mid-scroll measurement).
- Verified: `npm test` 30/30, smoke PASS in el and en, data preserved through the 3.1.1 → 3.1.2 update banner.

## 3.1.1 · 2026-09-26
- VAT status "I don't know" now counts as normal regime (was exempt); onboarding note says so.
- Summary shows "Age not set" instead of "Age -"; paid checkboxes get accessible names.
- Verified: `npm test` 30/30; VAT Q3 = 228.00 appears with sample data in the browser.

## 3.1.0 · 2026-09-26 (round 2, agent build, graded 23:45)
- Language choice is onboarding step 0 (preselected from the phone), EL/EN toggle in Home and Settings,
  i18n completeness test (3 tests) so no string ships in one language only.
- UI/UX: Fira Sans Condensed hero and tiles with a system fallback, fonts cached by the worker at runtime;
  4px spacing scale; 3-word tile captions; empty states with one action; staggered reveal once per boot
  (agent found and fixed a re-trigger flash when returning to Home); named nav buttons; contrast ≥ 4.5 in all themes.
- Onboarding: skip on every step, summary step with per-row change.
- Guided tour: 6 coach-mark steps with spotlight, keyboard and screen-reader support, re-launchable from More.
- Sample data: ~3 weeks of realistic shifts flagged `sample`, banner with one-tap removal, excluded from exports.
- Share the app (native share sheet, copy-link fallback). README: deploy for free (GitHub Pages, Netlify Drop).
- Verified: `npm test` 30/30, smoke 25 checks × 2 languages PASS, `tools/contrast.py` 16/16.

## 3.0.3 · 2026-09-26
- Import control is a button; live data summary line (shifts, first date, last backup). Verified in browser at 375px.

## 3.0.2 · 2026-09-26
- Update banner waits for `controllerchange` before reloading (previously reloaded into the old shell). Verified: one tap now loads the new version.

## 3.0.1 · 2026-09-26
- Period initialised to today's half-month; after saving a shift the view jumps to that shift's half-month.
- Tax installments of 0.00 no longer listed as obligations.
- Backup reminder only after 10 shifts or 7 days of history when never backed up.
- Verified: `npm test` 26/26, smoke 9/9, hand check of net 16.46 and set-aside 278.97.

## 3.0.0 · 2026-09-26 (rebuild from original-v2.html)
- New tax engine `js/tax.js` for tax year 2026 (Law 5246/2025, EFKA circ. 6/2026): brackets 9/20/26/34/39/44,
  youth and child rates, presumed income from year 4, prepayment 27.5% first 3 years, due-date helpers.
- Split into ES modules: app / calc (pure) / csv (pure) / store (adapter, schema v3 with ids, updatedAt, tombstones) / i18n.
- Onboarding (VAT, age + children, years active, EFKA category, days per week). No hard-coded city; weather off by default.
- Bottom-nav mobile layout, obligations with paid toggles and custom debts, savings goals, CSV import with preview,
  JSON backup/import (also the original app's v2 format), PWA manifest + service worker + icons.
- Dropped: claude.ai runtime coupling, Google Fonts (round 2 brings fonts back with runtime caching).
- Verified: `npm test` 26/26, `tools/smoke.py` 9/9 at 390x844.

## 2.1 · original (operator's file `pososa-krataw-v2_1.html`)
Audit findings: 2025 tax table labelled 2026, no youth or presumed-income rules, VAT on by default, first shift
shows a large negative number, not installable outside claude.ai, Thessaloniki hard-coded, no measurement.
