# Clean Pocket · CHANGELOG

*English · [Ελληνικά](CHANGELOG.md)*

Versions follow `CACHE_VERSION` in `sw.js`. Every entry names how it was verified.
Keep this file and the Greek `CHANGELOG.md` in sync.

## 3.1.12 · 2026-10-06
- VAT is now computed **per month** (was: per quarter), because riders remit it every month. One obligation for
  each month with shifts, reminded on the 1st of the next month, also shown on the calendar. Keys change from
  `vat-2026-Q3` to `vat-2026-07`, so anyone who had ticked "Paid" on a quarterly VAT needs to tick the months.
- Verified: `npm test` (tax: `vatMonthDue`; calc: keys, due date and amount of the monthly VAT).

## 3.1.11 · 2026-10-05
- Income-tax installments appear in the obligations only once there are shifts in 6 completed half-months
  (about three months), or when the user has entered an annual income by hand. Until then an information note
  is shown. Before, the projection from a single shift produced installments that did not hold up (e.g. 184 a
  month from one 60 EUR shift).
- "Set aside" is now only the unpaid EFKA. "Net for you" still subtracts the estimated tax: the app informs,
  it does not tell the rider how to manage their money.
- The first-shift explainer is now informational ("about X goes to EFKA and tax").
- Verified: `npm test` 35/35 (tax 7, calc 17, csv 8, i18n 3; 2 new tests for the 6 half-month threshold and
  the hand-entered income). Smoke: every functional check PASS; the "0 console errors" check failed only on
  loading Google Fonts, which the test environment could not reach.

## 3.1.10 · 2026-10-05
- The "Coming up" card left the home screen; obligations stay on the "Obligations & Goals" page. "Last 7
  days" moved up in its place.
- The GitHub Pages deploy of 3.1.9 was cancelled by GitHub (no runner available); its changes went live
  together with 3.1.10.
- Verified: `npm test` 33/33, smoke as in 3.1.11; live `sw.js` = 3.1.10.

## 3.1.9 · 2026-10-05
- VAT is no longer part of "Set aside": the platform pays it to the rider separately, so it stays only as an
  obligation card with amount and due date. New note on the onboarding VAT question explaining when to pick
  "Without VAT".
- Verified: `npm test` 33/33.

## 3.1.8 · 2026-10-05
- The backup reminder appears from the first shift (was: after 10 shifts or a week) and again every 7 days
  after a backup (was: 14), matching "Later". Prompted by a rider who lost his whole history after clearing
  browser data.
- Verified: `npm test` 33/33; in a private window, one shift → the bar appears, "Back up now" → it hides.

## 3.1.7 · 2026-10-04
- New onboarding step, "How do you work?": freelancer only (default) or salaried employee and freelancer.
  The summary now has 7 rows.
- For salaried + freelancer the monthly EFKA is reduced by the special-category amount (special category:
  0.00; 1st category: 90.31). The rule lives in `js/tax.js` (`efkaForEmployment`). Confirmed by an
  accountant. Income tax does not take the salary into account yet.
- When the monthly EFKA is 0, no EFKA cards are created in the obligations.
- `package.json` follows the `sw.js` version again.
- Verified: `npm test` 33/33 (tax 7, calc 16, csv 7, i18n 3), smoke 25 checks × 2 languages PASS (7-row
  summary), `tools/contrast.py` 16/16.

## 3.1.6 · 2026-09-28
- `mobile-web-app-capable` meta and `crossorigin="use-credentials"` on the manifest link.

## 3.1.5 · 2026-09-27
- The privacy policy now lists a contact email (cleanpockethr@gmail.com) instead of GitHub Issues.

## 3.1.4 · 2026-09-27
- Update fix: the service worker fetched the shell through the browser's HTTP cache (GitHub Pages sends
  max-age=600), so a new version could precache a fresh `index.html` next to a stale `app.js`. Found while
  deploying 3.1.3 (the privacy-policy link rendered without text). The shell is now always fetched from the
  server (`cache: "reload"`).
- Verified: in the browser, after the 3.1.3 → 3.1.4 update the cached `app.js` contains the new changes.

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
