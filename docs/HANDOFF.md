# Clean Pocket · Hand-off to the owner

Read this first. It tells you what you are holding, how to get it onto your phone today, and what is
left before you hand it to riders. Everything technical for your Claude (or any developer) is in
`FOR_YOUR_CLAUDE.md`.

## What you are holding
Clean Pocket v3.1.2: a phone app (a "PWA", installs from the browser, works offline) for freelance
food-delivery couriers in Greece. Greek or English, the user picks on the first screen. It answers one
question after every shift: **how much of this is really mine** after fuel, EFKA, income tax and VAT, and
what bills are coming and when. It also imports the data from the old single-file version you had.

Everything is in this folder. No accounts, no servers, no subscriptions, no cost. The data stays on the
rider's phone (backup and import are built in).

## Get it on your phone (15 minutes, free)
The app needs to be reached over HTTPS to install and work offline. Opening `index.html` from a file will
show the page but will not install. Pick one:

**Option A · Netlify Drop (no account needed to start)**
1. Open https://app.netlify.com/drop in a desktop browser.
2. Drag the folder `app/` from this package onto the page.
3. You get a link like `https://something-random.netlify.app`. Open it on your phone.
4. Android (Chrome): the app offers "Install" itself, or use the browser menu → "Add to Home screen".
   iPhone (Safari): Share button → "Add to Home Screen".
5. The link is public but unlisted. Anyone with it can use the app.

**Option B · GitHub Pages (if you have a GitHub account)**
1. Create a repository, upload the contents of `app/`, Settings → Pages → deploy from the main branch.
2. Open the Pages URL on your phone and install as above.

**Updating later:** replace the files on the same host. Whoever edits the app must raise the version in
`app/sw.js` (`CACHE_VERSION`) or installed phones will keep the old version. `FOR_YOUR_CLAUDE.md` covers it.

## First minute in the app
1. Choose language.
2. Five quick questions: VAT status, age and children, years active, EFKA category, days per week. Skip
   anything you are not sure about; defaults are safe (VAT is counted until an accountant says otherwise).
3. Say yes to the one-minute tour, or tap "Try with sample data" to see it full.
4. Log a shift with the big + button. The date moves forward by itself for the next one.
5. "More → My data" has backup, CSV export for the accountant, and import (old app backups and spreadsheets).

## What has been checked, and what has not
Checked (details in `progress/STATUS.md`): the 2026 tax and EFKA rules from Law 5246/2025 and EFKA
circular 6/2026, 30 automated tests, a scripted phone-size run in both languages, contrast in all four
themes, data surviving reloads and app updates.

**Not checked, and required before riders rely on a number:**
1. **An accountant** compares the app against three real riders (young/first years, VAT normal, VAT exempt).
   The rules are in `app/js/tax.js`; the disclaimer in the app says "estimate, not tax advice" for this reason.
2. **A name and identity** for the app if it ships under a brand.
3. **Hosting** as above, then **20 to 30 riders** from rider groups. The number to watch is how many log
   8 or more shifts in 14 days, not how many install.

## Folder map
```
HANDOFF.md            this file
FOR_YOUR_CLAUDE.md    technical brief and rules for whoever continues the build
app/                  the deployable app (drag this folder to the host)
progress/             STATUS.md (verified truth), CHANGELOG.md, agent reports
screenshots/          phone-size screenshots, Greek and English
original-v2.html      the single-file app this was rebuilt from
```
