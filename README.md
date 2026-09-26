# Clean Pocket 🛵

**Net-income tracker for freelance delivery riders in Greece.**
Log each shift right after it ends and see what you *actually* keep after expenses, EFKA (social security), income tax and VAT.

*Ελληνικά παρακάτω / Greek version below.*

---

## What it does

- **Shift log** with platform income, tips (tracked separately), hours and shift expenses.
- **Net income per half-month (1–14, 15–end), per month and per year**, plus net per hour and per shift.
- **VAT handling**: platform income is entered without VAT; the VAT collected is shown as "VAT payable" (minus deductible VAT on expenses) and does **not** reduce your net.
- **Yearly net goal** with a scooter riding along a road. Progress counts only what you keep, and the app estimates how many hours and full-time days you need to reach the goal.
- **Calendar** showing logged days, missed days, days off and monthly VAT obligations; **history by month**; **7-day chart**.
- **Fixed monthly costs** split automatically across periods.
- **Backup / restore** (JSON) and **CSV export** for your accountant.
- **Greek and English**, and four colour themes.
- **Installable (PWA)** and works offline.

## Try it / install

Open the app's URL on your phone:

- **Android (Chrome):** use the *Install* button in the app, or menu → *Install app*.
- **iPhone (Safari):** *Share* → *Add to Home Screen*.

## Deploy your own copy on GitHub Pages

1. Create a public repository, e.g. `clean-pocket`, and upload all files from this folder (keep the `icons` folder).
2. In the repository go to **Settings → Pages**.
3. Under *Build and deployment* choose **Deploy from a branch**, branch `main`, folder `/ (root)`, and save.
4. After a minute or two the app is live at `https://<your-username>.github.io/clean-pocket/`.

To run it locally: `python3 -m http.server` in this folder and open `http://localhost:8000`.

## Moving your data from another device

Data is stored **on your device** (browser `localStorage`). To move it: in the old app open *Fixed costs and settings → Backup*, save the `.json` file, then import it in the new app.

## Files

| File | Purpose |
|---|---|
| `index.html` | The whole app (HTML, CSS and JavaScript). |
| `manifest.webmanifest` | PWA metadata (name, icons, colours). |
| `sw.js` | Service worker: offline support and caching. Bump `CACHE_VERSION` on each release. |
| `icons/` | App icons. |

## Important notes

- **This is an estimate, not tax advice.** Contribution amounts and tax scales (EFKA circular 6/2026, business-income scale) were taken from public sources and must be verified with AADE/EFKA or an accountant. They live in the `CONFIG` object at the top of the script.
- VAT deductibility of expenses (fuel, servicing, phone) depends on your situation; the app leaves it at 0% until you set it.
- The optional live weather banner uses the free [Open-Meteo](https://open-meteo.com) API. Check its terms before any commercial use.
- **Built with AI assistance.** The code was written in conversation with an AI assistant (Claude) and reviewed and tested by the author.

## Roadmap

- Orders and platform per shift, "same as yesterday" quick entry
- Automated tests for the tax/VAT calculations and split into modules
- Optional accounts and sync (e.g. with Supabase)

---

# Clean Pocket 🛵 (Ελληνικά)

**Εφαρμογή για ελεύθερους διανομείς: δες πόσα πραγματικά κρατάς.**
Καταχωρείς κάθε βάρδια μόλις τελειώσει και βλέπεις τα καθαρά σου μετά από έξοδα, ΕΦΚΑ, φόρο και ΦΠΑ.

## Τι κάνει

- Καταγραφή βαρδιών με έσοδα πλατφόρμας, tips (ξεχωριστά), ώρες και έξοδα.
- Καθαρά ανά **δεκαπενθήμερο (1–14, 15–τέλος)**, ανά μήνα και ανά έτος, καθώς και ανά ώρα και ανά βάρδια.
- **ΦΠΑ**: καταχωρείς την αμοιβή χωρίς ΦΠΑ. Το ΦΠΑ εμφανίζεται ως «προς απόδοση» (μείον το ΦΠΑ εξόδων που εκπίπτει) και **δεν μειώνει τα καθαρά**.
- **Ετήσιος στόχος** με μηχανάκι σε δρόμο. Μετράνε μόνο τα καθαρά, και υπολογίζεται πόσες ώρες και μέρες full-time χρειάζονται.
- Ημερολόγιο (μέρες με καταχώριση, ρεπό, υποχρεώσεις ΦΠΑ), ιστορικό ανά μήνα, γράφημα 7 ημερών.
- Αντίγραφο ασφαλείας (JSON) και εξαγωγή CSV για τον λογιστή.
- Ελληνικά και αγγλικά, τέσσερα θέματα χρωμάτων, εγκατάσταση σαν εφαρμογή και χρήση χωρίς σύνδεση.

## Εγκατάσταση στο κινητό

- **Android (Chrome):** κουμπί «Εγκατάσταση» μέσα στην εφαρμογή, ή μενού → *Εγκατάσταση εφαρμογής*.
- **iPhone (Safari):** *Κοινοποίηση* → *Προσθήκη στην αρχική οθόνη*.

## Δική σου έκδοση στο GitHub Pages

1. Φτιάξε δημόσιο repository (π.χ. `clean-pocket`) και ανέβασε όλα τα αρχεία (μαζί με τον φάκελο `icons`).
2. **Settings → Pages → Deploy from a branch → main → / (root) → Save**.
3. Σε 1–2 λεπτά η εφαρμογή είναι διαθέσιμη στο `https://<το-όνομά-σου>.github.io/clean-pocket/`.

## Τα δεδομένα σου

Αποθηκεύονται **στη συσκευή σου**. Για μεταφορά σε άλλη συσκευή: *Πάγια και ρυθμίσεις → Αντίγραφο ασφαλείας*, κατεβάζεις το `.json` και το εισάγεις στη νέα.

## Σημαντικό

- **Είναι εκτίμηση, όχι φορολογική συμβουλή.** Ποσά ΕΦΚΑ και φορολογικές κλίμακες πρέπει να επαληθεύονται με ΑΑΔΕ/ΕΦΚΑ ή λογιστή (βρίσκονται στο `CONFIG` στην κορυφή του script).
- Το ΦΠΑ εξόδων που εκπίπτει το ορίζει ο χρήστης, μετά από συνεννόηση με τον λογιστή του.
- **Φτιάχτηκε με τη βοήθεια AI** (Claude) και ελέγχθηκε από τον δημιουργό.
