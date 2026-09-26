# Clean Pocket · Brief for the Claude (or developer) who continues this

You are picking up a working, verified v3.1.2. Read `progress/STATUS.md` for the current truth and
`progress/CHANGELOG.md` for what changed per version. Then read `app/README.md`. This file holds the
rules and context that are not obvious from the code.

## What it is, in one paragraph
Mobile-first offline PWA for Greek freelance food-delivery couriers (efood/Wolt style, paid per half-month,
freelance tax registration, usually VAT-registered). Vanilla ES modules, no build step, no dependencies.
Per shift: platform income, tips, hours, expenses. Per half-month/month/year: net after expenses, fixed costs,
EFKA (prorated in the current period), income-tax reserve (effective rate on a projected annual profit) and
VAT shown separately (never deducted from net). Obligations: EFKA monthly (due end of next month), VAT per
quarter (due end of the month after the quarter), income tax in 8 installments from July of the next year,
custom debts. Goals: annual net (with hours still needed) and savings goals.

## Architecture (app/)
- `js/tax.js`: the ONLY place with tax law. Pure. Tax year 2026: brackets 9/20/26/34/39/44 at 10k/20k/30k/40k/60k;
  age ≤ 25 pays 0% on the first 20k, 26–30 pays 9%; child reductions on brackets 1–3; prepayment 55%, or 27.5%
  for the first 3 years; presumed minimum income applies from year 4 when higher than real profit; EFKA
  160.46 (special category, first 5 years) or 250.77 (1st category). Sources: Ν. 5246/2025 art. 15 ΚΦΕ,
  ΕΦΚΑ εγκ. 6/2026. Re-verify every January.
- `js/calc.js`: pure `(db, todayISO) → numbers`. Period totals, projection (average of completed half-months × 24,
  or profit-per-shift × daysPerWeek × 48 when fewer than 2 completed), EFKA proration, obligations with stable
  keys (`efka-2026-09`, `vat-2026-Q3`, `tax-2026-0`, `debt-<id>-<date>`), set-aside, goals, `realEntries()`
  (excludes sample data).
- `js/store.js`: storage adapter (LocalStorage now). Schema v3: every record has `id`, `updatedAt`, deletes keep
  `deleted: true` tombstones, so a RemoteAdapter can merge later. Imports v3 and the original app's v2 backups.
- `js/csv.js`: pure CSV parser (delimiter, decimal comma, 4 date formats, EL/EN headers).
- `js/i18n.js`: every user-visible string, `{ el, en }`. `tests/i18n.test.js` fails if a key lacks a language or
  if Greek is hard-coded in `index.html`/`js/app.js` outside `I.t(...)`.
- `js/app.js`: UI only. Bottom nav (Home, Calendar, +, Debts & Goals, More), onboarding (language first, 5
  skippable questions, summary), 6-step coach-mark tour, sample data, banners (install, update, backup, sample).
- `sw.js`: cache-first app shell, runtime caching of Google Fonts, network-only for open-meteo.

## Rules that must not be broken
1. **Bump `CACHE_VERSION` in `sw.js` on every deploy.** Installed phones keep the old shell until a new worker
   installs; the page then shows "New version, tap to refresh" and reloads after `controllerchange`.
2. **Tax math only in `tax.js`; behaviour changes only with a test.** `npm test` must stay green.
3. **VAT default is ON.** "I don't know" and skipped onboarding count as normal regime; only "exempt" turns it off.
   Under-reserving is the worse failure for this app.
4. **No em dashes or long dashes in any copy** (use "·", ":" or "-"); empty values show "-". Both languages.
5. **Every string through i18n**, both languages, formatted with the chosen locale (el-GR / en-GB).
6. **No hard-coded city or location.** Weather is off unless the user picks a city or allows location.
7. **Sample data** (`sample: true`) never reaches exports, cloud-ready counts or the backup reminder.
8. Touch targets ≥ 44px, focus-visible everywhere, contrast ≥ 4.5 (`python tools/contrast.py`), reduced-motion respected.
9. Verify claims by running things, not by reading reports. A screenshot or raw test output, or it did not happen.

## How to verify (from `app/`)
```
npm test                                                  # 30 tests: tax 7, calc 13, csv 7, i18n 3
python -m http.server 8791 --directory .                  # serve
CP_BASE_URL=http://localhost:8791 python tools/smoke.py   # Playwright, 25 checks × el/en, screenshots to _shots/round2/
python tools/contrast.py                                  # 16 contrast rows, all ≥ 4.5
grep -rn -- "—" index.html css js sw.js README.md         # must be empty
```
Playwright for Python and Pillow are needed for the tools; the app itself needs nothing.

## Open work, in order
1. **Accountant validation**: three profiles (age 24 / years 1–3 / EFKA special; age 35 / years 6 / VAT normal /
   presumed income set; VAT exempt). Compare annual tax, prepayment, VAT per quarter, EFKA. Fix `tax.js` with tests.
2. **Deploy** (HTTPS static host; steps in `HANDOFF.md` and `README.md`). Zero spend.
3. **Measurement**: anonymous counts only (shifts logged per device, 7/14-day return) and a feedback link. No
   personal data. Success signal: riders logging 8+ shifts in 14 days.
4. **Name and identity** before public distribution; update `manifest.webmanifest`, `<title>`, About, icons.
5. Later, SaaS path: a `RemoteAdapter` in `store.js` (same interface as `LocalStorageAdapter`), sign-in, merge by
   `updatedAt` with tombstones. `tax.js` and `calc.js` run unchanged on a server.

## Known gaps (from `progress/STATUS.md`)
- Weather picker is best-effort and untested by automation.
- Tour spotlight uses a large box-shadow; re-check on a low-end Android.
- One unexplained wiped-profile observation during review, not reproduced; both user paths (reload, update)
  were then tested and preserve data. If it recurs, capture localStorage before and after.

## Decisions already made (do not reopen without a reason)
- Half-month periods (1–14, 15–end) match how platforms pay; kept from the original.
- VAT is shown but never deducted from net (it is not the rider's money).
- The first shift must not show a large negative number: current-period EFKA is prorated by days elapsed.
- Backup reminder only after 10 shifts or 7 days of history.
- Fonts: Fira Sans Condensed for numbers and headings, Fira Sans for body, system fallback, cached at runtime.
