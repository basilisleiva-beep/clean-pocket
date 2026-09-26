# Clean Pocket

*English · [Ελληνικά](README.md)*

A mobile-first, installable, offline PWA for Greek freelance food-delivery couriers (efood/Wolt
riders on a freelance registration). Shows what a shift really leaves after expenses, EFKA,
income tax and VAT, plus upcoming debts and goals.

**Live:** https://basilisleiva-beep.github.io/clean-pocket/ (GitHub Pages, `main` branch, repository root).
Open it on a phone and install it: Android (Chrome) offers "Install", iPhone (Safari) Share → "Add to Home Screen".

## Repository layout

```
index.html, manifest.webmanifest, sw.js   the app shell (served as-is by GitHub Pages)
js/, css/, icons/                         app modules, styles and icons
tests/                                    unit tests (npm test)
tools/                                    smoke test, contrast check, icon generator (Python)
package.json                              version and the npm test script
README.md, README.en.md                   Greek README (shown on GitHub) and this English version
docs/                                     handoff notes, progress reports, screenshots (not part of the app)
  HANDOFF.md                              owner's guide: install, first minute, what is still unchecked
  FOR_YOUR_CLAUDE.md                      rules and context for whoever continues the build
  progress/                               STATUS.md (verified truth), CHANGELOG.md, review reports
  screenshots/                            phone-size screenshots, Greek and English
  original-v2.html                        the single-file v2 app this was rebuilt from
```

The app has no build step: every file at the root is what gets deployed. All commands below run
from the repository root.

## Run it

Needs [Node.js](https://nodejs.org) 22 LTS or newer for the tests (on Windows, `npm test` relies on
Node expanding the `tests/*.test.js` glob itself) and Python 3 for the local server and tools.

```
npm test                                              # 30 unit tests: tax, calc, csv, i18n (node --test)
python -m http.server 8790 --directory .              # serve the app
```

Then open `http://localhost:8790/index.html` on a phone-width viewport (or resize your browser).
It works fully offline after the first load (service worker precaches the app shell).

Smoke test (Playwright, needs a server running on port 8791, run twice: Greek then English):

```
python -m http.server 8791 --directory .
python tools/smoke.py
```

Contrast check (prints a table, exits 1 if any theme's muted text fails 4.5:1):

```
python tools/contrast.py
```

Regenerate icons (Pillow):

```
python tools/make_icons.py
```

## First run: language, onboarding, tour

- The very first screen is a language choice (Ελληνικά / English), preselected from the
  browser's `navigator.language`. Every later screen, including the rest of onboarding, renders
  in the chosen language immediately. An EL/EN toggle is always reachable in the Home top bar
  and in Settings.
- Onboarding asks VAT regime, age/children, years active, EFKA category and days/week, with a
  "Παράλειψη" (skip) link on every step that jumps straight to a summary step applying whatever
  defaults were not yet answered. The summary repeats every choice with an "Αλλαγή" (change) link
  per row that jumps back into that step.
- Finishing onboarding offers a one-minute guided tour (coach marks over the period switcher,
  hero, + button, calendar, obligations/goals and My data). It can be replayed any time from
  Περισσότερα → "Ξενάγηση". "Δοκίμασε με δείγμα" loads about three weeks of sample shifts
  (flagged `sample: true`) so the tour has something to show; a thin banner lets you remove just
  the sample records later. Sample shifts never appear in a JSON/CSV export or in the shift
  counts shown in the backup banner (see `realEntries` in `js/calc.js`).

## Deploy for free

The app is static (no server, no build step) and only needs HTTPS for the service worker to
register (installable PWAs and `serviceWorker.register` both require a secure origin; plain
`http://` only works on `localhost`).

**GitHub Pages (current deployment)**
1. This repository is already set up: Settings → Pages → Deploy from a branch → `main` → `/ (root)`.
   Keep it on the root. `docs/` holds the handoff notes, not the app, so do not point Pages at it.
2. Every push to `main` redeploys to https://basilisleiva-beep.github.io/clean-pocket/ within a minute or two.
3. Bump `CACHE_VERSION` in `sw.js` before every release push, or installed users keep seeing the
   old cached shell.

For your own copy: fork or clone this repository and enable Pages the same way; it will be served at
`https://<user>.github.io/<repo>/`. All paths in the app are relative, so it works under any sub-path.

**Netlify Drop**
1. Open [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the repository folder onto the page (the app is at its root). No account or build command needed.
3. Netlify gives back an HTTPS URL immediately; drag the folder again for every release.

## Moving data from the old v2 app

v3 stores its data under a new key, so records from the single-file v2 app do not appear on their own
(they are not deleted either). In the old app make a backup (JSON), then in v3 open
More → My data → Import. The importer reads v2 backups.

## Releasing a new version

Bump `CACHE_VERSION` in `sw.js` on every deploy. Installed apps keep serving the cached shell
until a new worker installs; the page then shows "Νέα έκδοση, πάτα για ανανέωση" and reloads
after the new worker takes control. Forgetting the bump means users never see the update.

## Architecture

Vanilla ES modules, no build step, no npm dependencies.

- `js/tax.js` - the 2026 Greek tax/EFKA/VAT engine (given, untouched, still covered by its own
  7 tests). Pure functions, no DOM, no storage.
- `js/calc.js` - pure calculation engine: period totals (half-month/month/year), the annual
  profit projection (with its two fallback paths), EFKA proration for the period you're viewing,
  the obligations list (EFKA/VAT/income-tax/custom debts) with stable keys, "set aside", the
  annual goal and savings-goal math. Takes `(db, todayISO)`, returns numbers. No DOM.
- `js/csv.js` - pure CSV parser for the shift importer (delimiter/decimal/date auto-detection,
  Greek/English header mapping, duplicate detection).
- `js/store.js` - the storage adapter (`LocalStorageAdapter`) behind a small interface
  (`load/save/exportJSON/importJSON`) so a `RemoteAdapter` can be swapped in later for a SaaS
  backend without touching the UI. Schema v3: every entry/fixed cost/debt/goal has a stable
  `id` and `updatedAt`; deletes leave a `deleted: true` tombstone so a future sync can merge.
  Import accepts both this app's v3 backup and the original app's v2 backup format.
- `js/i18n.js` - the EL/EN dictionary (`t(key, vars)`) plus locale-aware number/date formatting.
- `js/app.js` - UI only. Renders the four views (Home, Calendar, Obligations & Goals, More),
  the bottom nav, the new-shift bottom sheet, the CSV import preview, the onboarding flow
  (language → profile questions → summary), the tour prompt, the coach-mark guided tour and the
  sample-data demo. Talks to the modules above; no tax/EFKA/VAT/date math lives here.
- `css/app.css` - mobile-first "night-shift dashboard" styling, four themes (forest default,
  graphite, black, light), a 4px spacing scale, bottom navigation, bottom sheets, the guided
  tour's spotlight overlay. Fira Sans / Fira Sans Condensed from Google Fonts with a system
  fallback stack, tabular numerals on every value that can change width.
- `manifest.webmanifest`, `sw.js` - PWA install + offline shell caching (cache-first for the
  shell, network-only for open-meteo, cache-first with opaque responses for the Google Fonts CSS
  and font files so the chosen typeface still renders offline; a "new version" banner appears on
  update).
- `tests/` - `calc.test.js`, `csv.test.js`, `i18n.test.js` (this app) and `tax.test.js` (given).
  `i18n.test.js` checks every dictionary key has both languages and scans `index.html`/`js/app.js`
  for hard-coded Greek text outside `I.t(...)` calls, markup attributes and the settings city
  list. `tests/fixtures/` holds the CSV smoke fixture.
- `tools/make_icons.py` - draws the pocket/banknote/€ icon at the four required sizes.
- `tools/contrast.py` - prints the WCAG contrast ratio of `--muted`/`--ink` against
  `--surface`/`--bg` for every theme, straight out of `css/app.css`.
- `tools/smoke.py` - Playwright end-to-end smoke test at 390x844, run twice (Greek, English):
  language choice, skip-to-summary, the guided tour, sample data add/remove, the first-shift
  explainer, CSV import, obligations, persistence and the service worker.

## SaaS path

The storage layer is already behind an adapter interface. To move to a backend: implement a
`RemoteAdapter` with the same four methods, sync on the `id`/`updatedAt`/`deleted` fields already
present on every record (last-write-wins or a proper CRDT merge), and swap the adapter instance
in `js/app.js`. Nothing else in the app touches storage directly.

## Tax/EFKA/VAT disclaimer

All figures are an estimate for information, not tax advice (see the About panel, which surfaces
`tax.RULES.source`). Verify with AADE/EFKA or an accountant before making decisions.
The open items before riders rely on a number are listed in `docs/progress/STATUS.md`.
