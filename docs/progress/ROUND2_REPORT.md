# Round 2 report

## Files changed
`js/i18n.js` (60+ keys), `js/app.js` (language-first onboarding + summary, tour prompt,
coach-mark tour, sample-data demo, dismissible first-shift explainer, empty-state actions,
share-the-app, aria-labels, CSV header fix), `js/calc.js` (+`realEntries`, untouched otherwise),
`js/store.js` (`exportJSON` excludes samples), `index.html` (language toggle, tour/prompt/
sample-banner/explainer/toast markup, Google Fonts links), `css/app.css` (Fira Sans/Condensed,
4px spacing scale, hero glow, tile captions, tour overlay, staggered reveal, 44px touch targets,
nav active state), `sw.js` (cache bump `v3.1.0`, runtime font caching), `tests/i18n.test.js`
(new), `tests/calc.test.js` (+1 test), `tools/contrast.py` (new), `tools/smoke.py` (rewritten,
runs twice), `README.md`, `package.json` (3.1.0).

## Tests
`npm test`: **30/30 green** (26 existing + 1 calc sample-data test + 3 i18n tests: dictionary
completeness, no hard-coded Greek in index.html, no hard-coded Greek in js/app.js). `js/tax.js`
and `js/calc.js` behavior untouched, only additive.

## Smoke (both languages, 25 checks each)
Greek: `SMOKE: PASS` - language step, skip-to-summary (6 rows), tour 1/6 -> 6/6 -> Τέλος closes,
sample add/remove, first-shift explainer, CSV import (3 rows), custom debt, reload persistence,
service worker, share button, zero console errors.
English: `SMOKE: PASS` - identical flow, English strings throughout. Screenshots in
`_shots/round2/` (`onboarding_lang`, `onboarding_summary`, `home_empty`, `home`, `tour_step2`,
`obligations`, `more`) x2 languages.

## Contrast (`tools/contrast.py`)
| theme | muted/surface | muted/bg |
|---|---|---|
| forest | 6.13 | 7.41 |
| graphite | 5.93 | 6.69 |
| black | 5.39 | 6.61 |
| light | 5.82 | 5.10 |
All 16 rows (muted + ink, x2 backgrounds, x4 themes) pass 4.5:1; no CSS changes were needed.

## Em/long dash grep
Zero hits across index.html, css/app.css, js/*.js, sw.js, manifest.webmanifest, README.md,
tests/*.js, tools/*.py.

## Gaps / found-and-fixed
- Manual browser QA (outside the smoke) caught a real bug: the Home stagger animation was tied
  to fixed IDs, which restarts on every `display:none -> block`, so leaving Home via the bottom
  nav and back flashed cards through their near-invisible "from" frame (worst on light theme).
  Fixed with a one-shot `body.boot-reveal` class app.js drops ~900ms after boot; re-verified
  visually and re-ran the full suite.
- Tour spotlight uses a box-shadow cut-out, not an SVG mask; not checked on very small viewports.
- Sample-data export exclusion has a calc test; the export payload itself (store.js) is reasoned
  about, not separately tested.
- Fixed two more pre-existing round-1 bugs in passing: a stray Cyrillic char in the "(ФΠΑ)"
  suffix, and onboarding Skip/Back buttons that never had visible labels.
