# Clean Pocket · STATUS

*English · [Ελληνικά](STATUS.md)*

> Current truth for this project. Update the "Last verified" stamp whenever a claim below is re-checked.
> Conventions: verification means a command or a browser run whose raw output was seen, not a report.
> Keep this file and the Greek `STATUS.md` in sync.

**Last verified:** 2026-10-05 (Athens): `npm test`, smoke; contrast is from 2026-10-04, the manual rows from 2026-09-26
**Version:** 3.1.12 (sw.js CACHE_VERSION) · **Rounds done:** 1 (rebuild), 2 (UI/UX, language, onboarding, tour)
**Location:** GitHub repo `basilisleiva-beep/clean-pocket`: app at the repository root (was `app/` in the
handoff package), this file and the rest of the handoff material in `docs/`; original single-file app kept as
`docs/original-v2.html`
**Deployed:** 2026-09-27, GitHub Pages from `main` (root): https://basilisleiva-beep.github.io/clean-pocket/
(`npm test` 30/30 before deploy; live page loaded with 0 console errors and SW registered) · **Users:** 0 ·
**Revenue:** EUR 0
**Google Play:** signed `.aab` ready (2026-09-27, in the `clean-pocket-android` folder, outside the repo), not
uploaded yet; developer account and the Play App Signing SHA-256 are pending (contact email: cleanpockethr@gmail.com). All steps in
`docs/play-store/PLAY-STORE.md`.

## What it is
Mobile-first offline PWA for Greek freelance food-delivery couriers, in Greek or English by the user's choice.
Shows what a shift really leaves after expenses, EFKA, income tax and VAT, per half-month / month / year, plus
upcoming obligations (EFKA monthly, VAT monthly with a reminder on the 1st of the next month, 8 income-tax installments once there are three months of shifts, custom debts) and goals (annual net,
savings). First run: language, 6 setup questions (all skippable), summary, then an optional 6-step guided tour
and "try with sample data".

## Verified state (2026-09-26 23:45)
| Claim | How verified | Result |
|---|---|---|
| Tax engine matches Law 5246/2025 + EFKA circ. 6/2026 | `npm test` (tests/tax.test.js) | 7/7 |
| Period totals, projection fallback, EFKA proration, obligations, v2 import, sample data excluded from real counts, EFKA for salaried + freelancer, no EFKA cards when the amount is 0, VAT and income tax out of "Set aside", tax installments only after 6 completed half-months or a hand-entered annual income | `npm test` (tests/calc.test.js) | 17/17 (2026-10-05, 3.1.11) |
| CSV parser: delimiters, decimal comma, 4 date formats, EL/EN headers | `npm test` (tests/csv.test.js) | 7/7 |
| Every i18n key has el + en; no hard-coded Greek in index.html or app.js outside i18n | `npm test` (tests/i18n.test.js) | 3/3 |
| Full flow in Greek AND English at 390x844: language step, skip → summary (7 rows), tour 1/6 → 6/6 → close, sample add/remove, first-shift explainer, 2 shifts → hero + set-aside, CSV import via preview, custom debt, reload persists, SW registered, share button, 0 console errors | `python tools/smoke.py` (25 checks × 2) | PASS, PASS (2026-10-04, 3.1.7). 2026-10-05, 3.1.11: every functional check PASS; the console check failed only on Google Fonts, unreachable from the test environment |
| Contrast of --muted and --ink on --surface and --bg, 4 themes | `python tools/contrast.py` | 16/16 ≥ 4.5 (min 5.10, 2026-10-04) |
| Hand run at 375px: language switch live on the same screen, summary, tour prompt, sample load, tour steps, obligations paid toggles, More/data | manual in the in-app browser | OK |
| Data survives 2 plain reloads and a service-worker version update with the banner (3.1.1 → 3.1.2) | manual, 16 sample entries before/after | 16 / 16 |
| No em/long dashes in shipped copy | grep | 0 |

Hand-checked numbers still hold from round 1 (net 16.46, set-aside 278.97 for the 2-shift profile).
With sample data and VAT status "I don't know": VAT Q3 2026 = 24% × 950.00 gross = 228.00. Matches the screen.

## Found in round 2 review and fixed (3.1.1, 3.1.2)
1. **VAT "I don't know" counted as exempt** (`vatRegime === "normal"` only), so an unsure rider saw no VAT
   obligation and under-reserved. Now only "exempt" turns VAT off; the onboarding note says VAT is counted as
   normal until confirmed. This reverses the agent's choice and matches the brief.
2. Onboarding summary showed "Ηλικία - · τέκνα 0" when age was skipped; now "Ηλικία: δεν ορίστηκε".
3. "Paid" checkboxes had no accessible name; now "Πληρώθηκε: <obligation>".
4. Tour spotlight measured mid-scroll and could exceed the viewport on tall targets; now clamped to the viewport
   and re-positioned on scroll/resize.

## Unexplained observation (logged, not hidden)
During review the in-app browser tab once came back with a fresh English profile (onboarded, no entries) after a
worker update while a Playwright smoke run was active on the same origin. Code review found no path that
completes onboarding or clears entries without a user action, and the two user paths were then tested and
preserve data (table above). Treat as an environment artifact until seen again; if it recurs, capture
localStorage before and after.

## Tooling notes
- The in-app browser's click coordinate frame flipped to 750x1624 after mobile emulation; ref-based taps then
  landed at a quarter of the intended point. Drive the page with Playwright (`tools/smoke.py`) for anything that
  must be proven; use the pane for looking.
- Bump `CACHE_VERSION` in `sw.js` before handing out a new build, otherwise installed users never see it.

## Open items (ordered)
1. **Accountant check** of three sample riders against the app before any stranger relies on a number. Not started.
   For salaried + freelancer (3.1.7) the EFKA reduction by the special-category amount was confirmed by an
   accountant; income tax is still computed without the salary, so it may come out lower than the real one.
2. **Monthly VAT.** Done in 3.1.12: reminder on the 1st of the next month.
3. **"Net for you" relies on the projection.** Since 3.1.11 tax installments are hidden for the first three
   months because the projection from a few shifts is unreliable, yet the tax subtracted from "Net" comes from
   the same projection. Needs a decision.
4. **Deploy** to free static HTTPS hosting. Done 2026-09-27 (GitHub Pages, see above). Zero spend.
5. **Measurement** before the 20-30 rider test: anonymous counts (shifts logged per device, 7/14-day return) + feedback link.
6. **Brand decision**: the app needs its own name and public identity before it ships (the reviewer's own brand
   cannot carry a Greece-market product). Owner's decision.
7. Weather picker untested by automation (best-effort, silent on failure).
8. Tour spotlight uses a 9999px box-shadow; fine on modern phones, re-check on a low-end Android.
9. Re-verify tax constants every January against ΑΑΔΕ/ΕΦΚΑ.

## Success signal for the market test
Share of riders who log 8+ shifts in 14 days. Installs do not count.

## How to work on it
```
npm test                                   # 35 unit tests
python -m http.server 8791 --directory .   # serve (launch.json entry "clean-pocket", port 8791)
CP_BASE_URL=http://localhost:8791 python tools/smoke.py    # both languages, screenshots to _shots/round2/
python tools/contrast.py
```
Progress notes live in this folder: `STATUS.md` (truth), `CHANGELOG.md` (what changed per version),
`ROUND*_REPORT.md` (agent reports, unverified until graded here).
