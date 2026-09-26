// Clean Pocket: EL/EN dictionary. Every user-visible string lives here so the app can be
// translated by swapping one flag. Copy rule: no em dashes or long dashes anywhere, use
// "·", ":" or "-" instead. Empty-value placeholder is always "-".

export const STRINGS = {
  "app.name": { el: "Clean Pocket", en: "Clean Pocket" },
  "app.tagline": { el: "Για να ξέρεις πάντα τι σου μένει καθαρό στην τσέπη.", en: "So you always know what you really keep." },

  "nav.home": { el: "Αρχική", en: "Home" },
  "nav.calendar": { el: "Ημερολόγιο", en: "Calendar" },
  "nav.add": { el: "Νέα βάρδια", en: "New shift" },
  "nav.obligations": { el: "Υποχρεώσεις & Στόχοι", en: "Debts & Goals" },
  "nav.more": { el: "Περισσότερα", en: "More" },

  "period.h1": { el: "1-14", en: "1-14" },
  "period.h2": { el: "15-τέλος", en: "15-end" },
  "period.month": { el: "Μήνας", en: "Month" },
  "period.year": { el: "Έτος", en: "Year" },

  "home.title": { el: "Καθαρά για σένα", en: "Net for you" },
  "home.empty": { el: "Πρόσθεσε μια βάρδια για να δεις το αποτέλεσμα.", en: "Add a shift to see the result." },
  "home.earned": { el: "Κέρδισες", en: "You earned" },
  "home.yours": { el: "Δικά σου", en: "Yours" },
  "home.setaside": { el: "Κράτα στην άκρη", en: "Set aside" },
  "home.nextDue": { el: "Επόμενες υποχρεώσεις", en: "Coming up" },
  "home.noDue": { el: "Καμία εκκρεμότητα προς το παρόν.", en: "Nothing due right now." },
  "home.goalMini": { el: "Στόχος έτους {y}", en: "{y} annual goal" },
  "home.last7": { el: "Τελευταίες 7 ημέρες", en: "Last 7 days" },
  "home.last7empty": { el: "Δεν υπάρχουν καταχωρίσεις τις τελευταίες 7 ημέρες.", en: "No entries in the last 7 days." },
  "home.breakdown": { el: "Ανάλυση", en: "Breakdown" },
  "home.perHour": { el: "καθαρά/ώρα", en: "net/hour" },
  "home.perShift": { el: "καθαρά/βάρδια", en: "net/shift" },
  "home.hours": { el: "ώρες", en: "hours" },
  "home.explainer": { el: "Από αυτή τη βάρδια κράτα {amt} για ΕΦΚΑ και φόρο.", en: "From this shift, set aside {amt} for EFKA and tax." },
  "home.presumedWarning": { el: "Χωρίς το ελάχιστο τεκμαρτό εισόδημα από τον λογιστή σου, ο πραγματικός φόρος μπορεί να είναι μεγαλύτερος.", en: "Without the minimum presumed income from your accountant, the real tax may be higher." },
  "home.taxRateNote": { el: "Εκτιμώμενος φορολογικός συντελεστής: {r}%, με βάση ετήσιο κέρδος περίπου {p}.", en: "Estimated tax rate: {r}%, based on an annual profit of about {p}." },

  "lane.exp": { el: "Έξοδα βαρδιών και έκτακτα", en: "Shift and one-off expenses" },
  "lane.fixed": { el: "Πάγια έξοδα", en: "Fixed expenses" },
  "lane.efka": { el: "ΕΦΚΑ", en: "EFKA" },
  "lane.tax": { el: "Φόρος (κράτημα)", en: "Tax (set aside)" },
  "lane.vat": { el: "ΦΠΑ προς απόδοση", en: "VAT due" },
  "lane.net": { el: "Καθαρά", en: "Net" },
  "lane.income": { el: "Έσοδα πλατφόρμας", en: "Platform income" },
  "lane.incomeExVat": { el: "Έσοδα πλατφόρμας (χωρίς ΦΠΑ)", en: "Platform income (excl. VAT)" },
  "lane.tips": { el: "Tips", en: "Tips" },

  "sheet.title": { el: "Νέα βάρδια", en: "New shift" },
  "sheet.titleEdit": { el: "Επεξεργασία βάρδιας", en: "Edit shift" },
  "sheet.date": { el: "Ημερομηνία", en: "Date" },
  "sheet.income": { el: "Έσοδα πλατφόρμας, €", en: "Platform income, €" },
  "sheet.tips": { el: "Tips, €", en: "Tips, €" },
  "sheet.hours": { el: "Ώρες βάρδιας", en: "Shift hours" },
  "sheet.exp": { el: "Έξοδα βάρδιας, €", en: "Shift expenses, €" },
  "sheet.save": { el: "Αποθήκευση βάρδιας", en: "Save shift" },
  "sheet.saveEdit": { el: "Αποθήκευση αλλαγών", en: "Save changes" },
  "sheet.cancel": { el: "Ακύρωση", en: "Cancel" },
  "sheet.delete": { el: "Διαγραφή", en: "Delete" },
  "sheet.dayOff": { el: "Ρεπό αυτή τη μέρα", en: "Day off" },
  "sheet.saved": { el: "Αποθηκεύτηκε", en: "Saved" },

  "cal.done": { el: "Καταχωρισμένη", en: "Logged" },
  "cal.missing": { el: "Χωρίς καταχώριση", en: "No entry" },
  "cal.off": { el: "Ρεπό", en: "Day off" },
  "cal.vat": { el: "Υποχρέωση ΦΠΑ", en: "VAT due" },
  "cal.today": { el: "Σήμερα", en: "Today" },
  "cal.noEntry": { el: "Καμία καταχώριση αυτή τη μέρα.", en: "No entry for this day." },
  "cal.addShift": { el: "Προσθήκη βάρδιας", en: "Add shift" },
  "cal.markOff": { el: "Σήμανση ρεπό", en: "Mark day off" },
  "cal.unmarkOff": { el: "Αναίρεση ρεπό", en: "Unmark day off" },

  "obl.title": { el: "Υποχρεώσεις", en: "Obligations" },
  "obl.empty": { el: "Καμία υποχρέωση προς το παρόν.", en: "No obligations yet." },
  "obl.overdue": { el: "Εκπρόθεσμη", en: "Overdue" },
  "obl.markPaid": { el: "Πληρώθηκε", en: "Mark paid" },
  "obl.markUnpaid": { el: "Αναίρεση πληρωμής", en: "Mark unpaid" },
  "obl.efka": { el: "ΕΦΚΑ {m}", en: "EFKA {m}" },
  "obl.vat": { el: "ΦΠΑ {q}", en: "VAT {q}" },
  "obl.tax": { el: "Δόση φόρου {i}/{n}", en: "Tax installment {i}/{n}" },
  "more.dataSummary": { el: "{n} βάρδιες · από {first} · τελευταίο αντίγραφο: {last}", en: "{n} shifts · since {first} · last backup: {last}" },
  "more.dataEmpty": { el: "Δεν υπάρχουν ακόμη βάρδιες. Πρόσθεσε μία ή φόρτωσε ένα αρχείο.", en: "No shifts yet. Add one or import a file." },
  "more.never": { el: "ποτέ", en: "never" },
  "obl.estimate": { el: "εκτίμηση", en: "estimate" },
  "obl.addDebt": { el: "Χρέος", en: "Debt" },
  "obl.debtName": { el: "Όνομα", en: "Name" },
  "obl.debtAmount": { el: "Ποσό, €", en: "Amount, €" },
  "obl.debtDue": { el: "Ημερομηνία λήξης", en: "Due date" },
  "obl.debtRepeat": { el: "Επανάληψη", en: "Repeat" },
  "obl.repeatNone": { el: "Καμία", en: "None" },
  "obl.repeatMonthly": { el: "Μηνιαία", en: "Monthly" },
  "obl.addDebtBtn": { el: "Προσθήκη χρέους", en: "Add debt" },
  "obl.setAsideNote": { el: "Άθροισμα ΕΦΚΑ και ΦΠΑ που δεν έχεις πληρώσει μέχρι τώρα, συν τον φόρο που έχεις μαζέψει φέτος.", en: "Unpaid EFKA and VAT so far, plus the tax reserve you have built up this year." },

  "goal.title": { el: "Ετήσιος στόχος καθαρών {y}", en: "{y} annual net goal" },
  "goal.placeholder": { el: "π.χ. 20000", en: "e.g. 20000" },
  "goal.save": { el: "Ορισμός", en: "Set" },
  "goal.lock": { el: "Κλείδωμα στόχου", en: "Lock goal" },
  "goal.unlock": { el: "Ξεκλείδωμα στόχου", en: "Unlock goal" },
  "goal.empty": { el: "Όρισε έναν ετήσιο στόχο και δες το μηχανάκι να τον πλησιάζει με κάθε βάρδια.", en: "Set an annual goal and watch the scooter get closer with every shift." },
  "goal.onlyNet": { el: "Μετράνε μόνο τα καθαρά που σου μένουν, όχι ο τζίρος.", en: "Only your real net counts, not gross revenue." },
  "goal.progress": { el: "Κράτησες {a} από {b} · {p}%", en: "You kept {a} of {b} · {p}%" },
  "goal.left": { el: " · απομένουν {l}", en: " · {l} left" },
  "goal.locked": { el: " · κλειδωμένος", en: " · locked" },
  "goal.cheer.done": { el: "Έφτασες στον στόχο, συγχαρητήρια!", en: "You reached the goal, congratulations!" },
  "goal.cheer.75": { el: "Δεν έμεινε τίποτα, ο στόχος είναι μπροστά σου.", en: "Almost there, the goal is right in front of you." },
  "goal.cheer.50": { el: "Έφτασες κιόλας στα μισά, πάμε δυνατά!", en: "Already halfway, keep going strong!" },
  "goal.cheer.25": { el: "Είσαι στον δρόμο, συνέχισε.", en: "You are on the road, keep it up." },
  "goal.cheer.start": { el: "Ζεσταίνουμε τις μηχανές.", en: "Warming up the engines." },
  "goal.cheer.none": { el: "Η διαδρομή ξεκινά με την πρώτη βάρδια.", en: "The ride starts with the first shift." },
  "goal.plan.head": { el: "Με τον ρυθμό που δουλεύεις τώρα (περίπου {m} κέρδος/ώρα πριν από ΕΦΚΑ, πάγια και φόρο), χρειάζεσαι:", en: "At your current pace (about {m} profit/hour before EFKA, fixed costs and tax), you need:" },
  "goal.plan.needData": { el: "Πρόσθεσε βάρδιες με ώρες και θετικό κέρδος για να υπολογιστούν οι ώρες που χρειάζονται.", en: "Add shifts with hours and positive profit to calculate the hours needed." },
  "goal.plan.hoursTotal": { el: "ώρες μέσα στο έτος", en: "hours across the year" },
  "goal.plan.hoursLeft": { el: "ώρες απομένουν", en: "hours left" },
  "savings.title": { el: "Στόχοι αποταμίευσης", en: "Savings goals" },
  "savings.name": { el: "Όνομα", en: "Name" },
  "savings.target": { el: "Στόχος, €", en: "Target, €" },
  "savings.saved": { el: "Έχεις ήδη, €", en: "Already saved, €" },
  "savings.date": { el: "Ημερομηνία στόχου", en: "Target date" },
  "savings.add": { el: "Προσθήκη στόχου", en: "Add goal" },
  "savings.perWeek": { el: "{w}/εβδομάδα", en: "{w}/week" },
  "savings.remaining": { el: "Απομένουν {r}", en: "{r} left" },

  "more.title": { el: "Περισσότερα", en: "More" },
  "more.myData": { el: "Τα δεδομένα μου", en: "My data" },
  "more.exportJson": { el: "Αποθήκευση αντιγράφου (.json)", en: "Save backup (.json)" },
  "more.exportCsv": { el: "Εξαγωγή βαρδιών (.csv)", en: "Export shifts (.csv)" },
  "more.share": { el: "Κοινοποίηση αντιγράφου", en: "Share backup" },
  "more.import": { el: "Εισαγωγή αρχείου (.json ή .csv)", en: "Import file (.json or .csv)" },
  "more.deleteAll": { el: "Διαγραφή όλων των δεδομένων", en: "Delete all data" },
  "more.deleteConfirmLabel": { el: "Γράψε ΔΙΑΓΡΑΦΗ για επιβεβαίωση", en: "Type DELETE to confirm" },
  "more.deleteConfirmWord": { el: "ΔΙΑΓΡΑΦΗ", en: "DELETE" },
  "more.deleteBtn": { el: "Οριστική διαγραφή", en: "Delete permanently" },
  "more.fixed": { el: "Πάγια έξοδα", en: "Fixed expenses" },
  "more.fixedNote": { el: "Τα βάζεις μία φορά. Μοιράζονται αυτόματα, μισά σε κάθε δεκαπενθήμερο.", en: "Set these once. They are split automatically, half per half-month." },
  "more.fixedName": { el: "Όνομα", en: "Name" },
  "more.fixedAmount": { el: "Ποσό ανά μήνα, €", en: "Amount per month, €" },
  "more.fixedVat": { el: "Περιλαμβάνει ΦΠΑ που εκπίπτει", en: "Includes deductible VAT" },
  "more.fixedAdd": { el: "Προσθήκη πάγιου εξόδου", en: "Add fixed expense" },
  "more.history": { el: "Ιστορικό", en: "History" },
  "more.historyEmpty": { el: "Το ιστορικό σου θα εμφανιστεί εδώ μόλις καταχωρίσεις την πρώτη βάρδια.", en: "Your history appears here after your first shift." },
  "more.pie": { el: "Πού πάνε τα λεφτά", en: "Where the money goes" },
  "more.pieEmpty": { el: "Πρόσθεσε βάρδιες για να δεις την ανάλυση.", en: "Add shifts to see the breakdown." },
  "more.settings": { el: "Ρυθμίσεις", en: "Settings" },
  "more.theme": { el: "Θέμα εμφάνισης", en: "Theme" },
  "more.language": { el: "Γλώσσα", en: "Language" },
  "more.weather": { el: "Καιρός", en: "Weather" },
  "more.weatherOff": { el: "Απενεργοποιημένος", en: "Off" },
  "more.weatherCity": { el: "Πόλη", en: "City" },
  "more.weatherLocation": { el: "Χρήση της τοποθεσίας μου", en: "Use my location" },
  "more.about": { el: "Σχετικά", en: "About" },
  "more.disclaimer": { el: "Εκτίμηση για ενημέρωση, όχι φορολογική συμβουλή. Επαλήθευσέ τα στοιχεία στο ΑΑΔΕ/ΕΦΚΑ ή με τον λογιστή σου πριν πάρεις αποφάσεις.", en: "An estimate for information, not tax advice. Verify with AADE/EFKA or your accountant before deciding anything." },
  "more.editOnboarding": { el: "Επεξεργασία αρχικών ερωτήσεων", en: "Edit onboarding answers" },
  "more.reonboard": { el: "Ξανά αρχικές ερωτήσεις", en: "Restart onboarding" },

  "onb.skip": { el: "Παράλειψη", en: "Skip" },
  "onb.next": { el: "Επόμενο", en: "Next" },
  "onb.back": { el: "Πίσω", en: "Back" },
  "onb.finish": { el: "Ξεκίνα", en: "Start" },
  "onb.step1.title": { el: "Καθεστώς ΦΠΑ", en: "VAT regime" },
  "onb.step1.normal": { el: "Κανονικό καθεστώς ΦΠΑ", en: "Normal VAT regime" },
  "onb.step1.exempt": { el: "Απαλλαγή (μικρές επιχειρήσεις)", en: "Exempt (small business)" },
  "onb.step1.unknown": { el: "Δεν ξέρω", en: "I don't know" },
  "onb.step1.unknownNote": { el: "Ρώτησε τον λογιστή σου, μπορείς να το αλλάξεις αργότερα. Μέχρι τότε το ΦΠΑ υπολογίζεται με κανονικό καθεστώς.", en: "Ask your accountant, you can change this later. Until then VAT is counted as normal regime." },
  "onb.step1.withVat": { el: "Τα ποσά που καταχωρώ από την πλατφόρμα:", en: "The platform amounts I enter are:" },
  "onb.step1.withVatYes": { el: "Περιλαμβάνουν ΦΠΑ", en: "Include VAT" },
  "onb.step1.withVatNo": { el: "Χωρίς ΦΠΑ", en: "Without VAT" },
  "onb.step2.title": { el: "Ηλικία και εξαρτώμενα τέκνα", en: "Age and dependent children" },
  "onb.step2.age": { el: "Ηλικία", en: "Age" },
  "onb.step2.children": { el: "Εξαρτώμενα τέκνα", en: "Dependent children" },
  "onb.step3.title": { el: "Χρόνια δραστηριότητας", en: "Years active" },
  "onb.step3.a": { el: "1-3 χρόνια", en: "1-3 years" },
  "onb.step3.b": { el: "4+ χρόνια", en: "4+ years" },
  "onb.step3.presumed": { el: "Ελάχιστο τεκμαρτό εισόδημα (από τον λογιστή σου)", en: "Minimum presumed income (from your accountant)" },
  "onb.step3.presumedNote": { el: "Μετά τα πρώτα χρόνια δραστηριότητας μπορεί να ισχύει ένα ελάχιστο τεκμαρτό εισόδημα, ανεξάρτητα από το πραγματικό σου κέρδος. Ρώτησε τον λογιστή σου για το ποσό. Αν το αφήσεις κενό, ο πραγματικός φόρος μπορεί να είναι μεγαλύτερος από την εκτίμηση.", en: "After the first years of activity a minimum presumed income may apply, regardless of your real profit. Ask your accountant for the amount. If left empty, the real tax may be higher than this estimate." },
  "onb.step4.title": { el: "Κατηγορία ΕΦΚΑ", en: "EFKA category" },
  "onb.step4.special": { el: "Ειδική κατηγορία νέων (πρώτα 5 χρόνια) 160,46 €", en: "Special young category (first 5 years) €160.46" },
  "onb.step4.first": { el: "1η κατηγορία 250,77 €", en: "1st category €250.77" },
  "onb.step4.other": { el: "Άλλο ποσό", en: "Other amount" },
  "onb.step5.title": { el: "Μέρες εργασίας ανά εβδομάδα", en: "Days worked per week" },

  "install.text": { el: "Πρόσθεσε το Clean Pocket στην αρχική οθόνη.", en: "Add Clean Pocket to your home screen." },
  "install.btn": { el: "Εγκατάσταση", en: "Install" },
  "install.later": { el: "Όχι τώρα", en: "Not now" },
  "install.iosHint": { el: "Στο iPhone: πάτα «Κοινοποίηση» και μετά «Προσθήκη στην αρχική οθόνη».", en: "On iPhone: tap \"Share\", then \"Add to Home Screen\"." },

  "backup.reminder": { el: "Δεν έχεις κρατήσει αντίγραφο ασφαλείας πρόσφατα.", en: "You have not backed up recently." },
  "backup.now": { el: "Αντίγραφο τώρα", en: "Back up now" },
  "backup.later": { el: "Αργότερα", en: "Later" },

  "sw.update": { el: "Νέα έκδοση, πάτα για ανανέωση", en: "New version, tap to refresh" },

  "csv.previewTitle": { el: "Προεπισκόπηση εισαγωγής", en: "Import preview" },
  "csv.found": { el: "{n} γραμμές βρέθηκαν", en: "{n} rows found" },
  "csv.skipped": { el: "{n} παραλείφθηκαν (λάθος ή διπλές)", en: "{n} skipped (bad or duplicate)" },
  "csv.confirm": { el: "Επιβεβαίωση εισαγωγής", en: "Confirm import" },
  "csv.cancel": { el: "Ακύρωση", en: "Cancel" },
  "csv.badFile": { el: "Το αρχείο δεν είναι έγκυρο αντίγραφο ή CSV αυτής της εφαρμογής.", en: "The file is not a valid backup or CSV for this app." },
  "csv.imported": { el: "Εισήχθησαν {n} βάρδιες.", en: "{n} shifts imported." },

  "misc.dash": { el: "-", en: "-" },
  "misc.shift1": { el: "βάρδια", en: "shift" },
  "misc.shiftN": { el: "βάρδιες", en: "shifts" },
  "misc.close": { el: "Κλείσιμο", en: "Close" },

  "nav.aria": { el: "Πλοήγηση", en: "Navigation" },
  "period.aria": { el: "Περίοδος", en: "Period" },
  "period.prev": { el: "Προηγούμενη περίοδος", en: "Previous period" },
  "period.next": { el: "Επόμενη περίοδος", en: "Next period" },
  "cal.prev": { el: "Προηγούμενος μήνας", en: "Previous month" },
  "cal.next": { el: "Επόμενος μήνας", en: "Next month" },

  "onb.step0.title": { el: "Γλώσσα", en: "Language" },
  "onb.langEl": { el: "Ελληνικά", en: "Ελληνικά" },
  "onb.langEn": { el: "English", en: "English" },
  "onb.change": { el: "Αλλαγή", en: "Change" },
  "onb.summary.title": { el: "Σύνοψη", en: "Summary" },
  "onb.summary.age": { el: "Ηλικία {a} · τέκνα {c}", en: "Age {a} · children {c}" },
  "onb.summary.ageUnset": { el: "Ηλικία: δεν ορίστηκε · τέκνα {c}", en: "Age not set · children {c}" },
  "obl.paidLabel": { el: "Πληρώθηκε: {o}", en: "Paid: {o}" },
  "onb.summary.days": { el: "{d} ημέρες/εβδομάδα", en: "{d} days/week" },
  "onb.tourAsk": { el: "Θέλεις μια γρήγορη ξενάγηση; Ένα λεπτό.", en: "Want a quick tour? One minute." },
  "onb.tourYes": { el: "Ναι, δείξε μου", en: "Yes, show me" },
  "onb.tourNo": { el: "Όχι, ξεκινάω", en: "No, let's start" },

  "more.tour": { el: "Ξενάγηση", en: "Tour" },
  "more.shareApp": { el: "Μοιράσου την εφαρμογή", en: "Share the app" },
  "share.text": { el: "Δες τι σου μένει καθαρό μετά τα έξοδα, ΕΦΚΑ, φόρο και ΦΠΑ.", en: "See what you really keep after expenses, EFKA, tax and VAT." },
  "share.copied": { el: "Ο σύνδεσμος αντιγράφηκε", en: "Link copied" },

  "tour.step": { el: "{i}/{n}", en: "{i}/{n}" },
  "tour.skip": { el: "Παράλειψη", en: "Skip" },
  "tour.back": { el: "Πίσω", en: "Back" },
  "tour.next": { el: "Επόμενο", en: "Next" },
  "tour.finish": { el: "Τέλος", en: "Done" },
  "tour.step1.title": { el: "Εναλλαγή περιόδου", en: "Period switcher" },
  "tour.step1.desc": { el: "Άλλαξε ανάμεσα σε δεκαπενθήμερο, μήνα και έτος για να δεις διαφορετικές περιόδους.", en: "Switch between half-month, month and year to see different periods." },
  "tour.step2.title": { el: "Το καθαρό σου", en: "Your net" },
  "tour.step2.desc": { el: "Ο μεγάλος αριθμός είναι το καθαρό σου. Τα τρία πλαίσια δείχνουν πώς φτάνεις σε αυτόν.", en: "The big number is your net. The three tiles show how you get there." },
  "tour.step3.title": { el: "Νέα βάρδια", en: "New shift" },
  "tour.step3.desc": { el: "Πάτα εδώ για να καταχωρίσεις μια βάρδια σε λίγα δευτερόλεπτα.", en: "Tap here to log a shift in a few seconds." },
  "tour.step4.title": { el: "Ημερολόγιο", en: "Calendar" },
  "tour.step4.desc": { el: "Δες ποιες μέρες λείπουν και συμπλήρωσέ τες.", en: "See which days are missing and fill them in." },
  "tour.step5.title": { el: "Υποχρεώσεις & Στόχοι", en: "Obligations & Goals" },
  "tour.step5.desc": { el: "Παρακολούθησε ΕΦΚΑ, ΦΠΑ, φόρο και τον ετήσιο στόχο σου.", en: "Track EFKA, VAT, tax and your annual goal." },
  "tour.step6.title": { el: "Τα δεδομένα μου", en: "My data" },
  "tour.step6.desc": { el: "Κράτα αντίγραφο ασφαλείας ή εισήγαγε βάρδιες από αρχείο.", en: "Back up your data or import shifts from a file." },

  "sample.try": { el: "Δοκίμασε με δείγμα", en: "Try with sample data" },
  "sample.banner": { el: "Δείγμα δεδομένων", en: "Sample data" },
  "sample.remove": { el: "Αφαίρεσε", en: "Remove" },
  "sample.removed": { el: "Το δείγμα αφαιρέθηκε.", en: "Sample data removed." },

  "home.emptyAdd": { el: "Πρόσθεσε την πρώτη", en: "Add your first" },
  "home.earnedCaption": { el: "μαζί με tips", en: "with tips" },
  "home.yoursCaption": { el: "μετά από όλα", en: "after everything" },
  "home.setasideCaption": { el: "ΕΦΚΑ + ΦΠΑ + φόρος", en: "EFKA + VAT + tax" },

  "cal.emptyNote": { el: "Δεν έχεις καταχωρίσεις ακόμη.", en: "You have no entries yet." },
  "obl.emptyAction": { el: "Προσθήκη βάρδιας", en: "Add shift" },

  "csv.hdrDate": { el: "Ημερομηνία", en: "Date" },
  "csv.hdrIncome": { el: "Έσοδα πλατφόρμας", en: "Platform income" },
  "csv.hdrTips": { el: "Tips", en: "Tips" },
  "csv.hdrHours": { el: "Ώρες", en: "Hours" },
  "csv.hdrExp": { el: "Έξοδα βάρδιας", en: "Shift expenses" },

  "more.fixedVatMark": { el: "ΦΠΑ", en: "VAT" }
};

let lang = "el";
export function setLang(l) { lang = l === "en" ? "en" : "el"; }
export function getLang() { return lang; }
export function locale() { return lang === "en" ? "en-GB" : "el-GR"; }

export function t(key, vars) {
  var entry = STRINGS[key];
  var s = entry ? (entry[lang] || entry.el || key) : key;
  if (vars) s = s.replace(/\{(\w+)\}/g, function (m, k) { return vars[k] !== undefined ? vars[k] : m; });
  return s;
}

let eurFmt = {};
export function fmtEUR(v) {
  var l = locale();
  if (!eurFmt[l]) eurFmt[l] = new Intl.NumberFormat(l, { style: "currency", currency: "EUR" });
  return eurFmt[l].format(v || 0);
}
export function fmtInt(v) {
  return Math.round(v || 0).toLocaleString(locale(), { maximumFractionDigits: 0 });
}
export function fmtDec(v, digits) {
  return (+v || 0).toLocaleString(locale(), { maximumFractionDigits: digits == null ? 2 : digits });
}
export function fmtDateShort(iso) {
  if (!iso) return "-";
  var p = iso.split("-");
  return p[2] + "/" + p[1] + "/" + p[0];
}

export const MONTHS_EL = ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μάι", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"];
export const MONTHS_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const MONTHS_FULL_EL = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
export const MONTHS_FULL_EN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
export const WD_EL = ["Δε", "Τρ", "Τε", "Πε", "Πα", "Σα", "Κυ"];
export const WD_EN = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

export function monthShort(m) { return (lang === "en" ? MONTHS_EN : MONTHS_EL)[m]; }
export function monthFull(m) { return (lang === "en" ? MONTHS_FULL_EN : MONTHS_FULL_EL)[m]; }
export function weekdayShort(i) { return (lang === "en" ? WD_EN : WD_EL)[i]; }
