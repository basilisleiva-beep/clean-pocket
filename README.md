# Clean Pocket

A mobile-first, installable, offline PWA for Greek freelance food-delivery couriers (efood/Wolt
riders on a freelance registration). Shows what a shift really leaves after expenses, EFKA,
income tax and VAT, plus upcoming debts and goals.

## Run it

```
npm test                                              # tax + calc + csv unit tests (node --test)
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

**GitHub Pages**
1. Push this folder to a GitHub repo (root, or a `/docs` folder on `main`).
2. Repo Settings → Pages → Source → the branch/folder above.
3. GitHub serves it over HTTPS at `https://<user>.github.io/<repo>/` within a minute or two.
4. Re-push after bumping `CACHE_VERSION` in `sw.js` for every release, or installed users keep
   seeing the old cached shell until the "new version" banner appears and they tap it.

**Netlify Drop**
1. Open [app.netlify.com/drop](https://app.netlify.com/drop).
2. Drag the whole `clean-pocket` folder onto the page. No account or build command needed.
3. Netlify gives back an HTTPS URL immediately; drag the folder again for every release.

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
