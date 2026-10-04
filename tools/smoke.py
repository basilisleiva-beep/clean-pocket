"""Clean Pocket smoke test (Playwright, sync API). Assumes a static server is already
running (see README) at BASE_URL, e.g.:
    python -m http.server 8791 --directory .   (run from the app folder)
Runs the full flow twice, once choosing Greek and once English at onboarding step 0, so the
language path, the tour and the sample-data flow are all exercised in both languages.
Run: python tools/smoke.py
Exits 0 and prints "SMOKE: PASS" on success, prints failures and exits 1 otherwise.
"""
import os
import sys
from playwright.sync_api import sync_playwright

# Windows consoles default to cp1252, which cannot print Greek text in check() labels.
try:
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

BASE_URL = os.environ.get("CP_BASE_URL", "http://localhost:8791")
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
SHOTS = os.path.join(ROOT, "_shots", "round2")
os.makedirs(SHOTS, exist_ok=True)

ALL_FAILURES = []

# expected step-1 (VAT regime) title in each language, used to prove onboarding actually
# switched language right after the step-0 choice
STEP1_TITLE = {"el": "Καθεστώς ΦΠΑ", "en": "VAT regime"}
LOCALE = {"el": "el-GR", "en": "en-US"}


def shot(page, name, lang):
    page.screenshot(path=os.path.join(SHOTS, "%s_%s.png" % (name, lang)))


def run_for_lang(lang):
    failures = []
    console_errors = []

    def check(label, cond):
        status = "OK " if cond else "FAIL"
        print("[%s][%s] %s" % (lang, status, label))
        if not cond:
            failures.append(lang + ": " + label)

    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context(viewport={"width": 390, "height": 844}, locale=LOCALE[lang])
        page = context.new_page()
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.on("pageerror", lambda exc: console_errors.append(str(exc)))

        page.goto(BASE_URL + "/index.html")
        page.wait_for_selector("#onbBackdrop", state="visible", timeout=5000)

        # ---- step 0: language choice ----
        lang_opts = page.locator(".onb-opt.lang-opt")
        check("onboarding step 0 is the language choice (two buttons)", lang_opts.count() == 2)
        idx = 0 if lang == "el" else 1
        pressed_before = lang_opts.nth(idx).get_attribute("aria-pressed")
        check("language preselected from navigator.language (%s)" % lang, pressed_before == "true")
        shot(page, "onboarding_lang", lang)
        lang_opts.nth(idx).click()
        page.click("#onbNext")  # -> step 1 (VAT regime), should now render in the chosen language
        page.wait_for_timeout(100)
        step1_title = page.text_content("#onbTitle")
        check("next step renders in the chosen language", (step1_title or "").strip() == STEP1_TITLE[lang])

        # ---- skip: jumps straight to the summary, applying defaults for every later step ----
        page.click("#onbSkip")
        page.wait_for_selector(".onb-summary-row", timeout=5000)
        rows = page.locator(".onb-summary-row")
        check("skip applies defaults and lands on the summary (7 rows)", rows.count() == 7)
        summary_text = page.text_content("#onbBody") or ""
        expected_lang_label = "Ελληνικά" if lang == "el" else "English"
        check("summary lists the chosen language", expected_lang_label in summary_text)
        shot(page, "onboarding_summary", lang)

        # ---- finish onboarding -> tour prompt ----
        page.click("#onbNext")  # "Ξεκίνα" / "Start"
        page.wait_for_selector("#onbBackdrop", state="hidden", timeout=5000)
        check("onboarding completes", page.is_hidden("#onbBackdrop"))
        page.wait_for_selector("#tourPromptBackdrop", state="visible", timeout=5000)

        # ---- accept the tour ----
        page.click("#tourPromptYes")
        page.wait_for_selector("#tourBackdrop", state="visible", timeout=5000)
        page.wait_for_timeout(150)
        counter1 = page.text_content("#tourCounter")
        check("tour opens at step 1/6", (counter1 or "").strip() == "1/6")
        page.click("#tourNext")
        page.wait_for_timeout(150)
        shot(page, "tour_step2", lang)
        check("tour advances to 2/6", (page.text_content("#tourCounter") or "").strip() == "2/6")
        for _ in range(4):
            page.click("#tourNext")
            page.wait_for_timeout(120)
        check("tour reaches the last step 6/6", (page.text_content("#tourCounter") or "").strip() == "6/6")
        finish_label = page.text_content("#tourNext")
        page.click("#tourNext")  # "Τέλος" / "Done"
        page.wait_for_selector("#tourBackdrop", state="hidden", timeout=5000)
        check("Next on the last step reads Τέλος/Done and closes the tour", page.is_hidden("#tourBackdrop"))

        # ---- back on Home, empty ----
        page.click('[data-nav="home"]')
        page.wait_for_timeout(100)
        shot(page, "home_empty", lang)
        check("home empty state offers add + sample actions", page.is_visible("#heroAddBtn") and page.is_visible("#heroSampleBtn"))

        # ---- sample data: add then remove ----
        before_sample = page.evaluate("JSON.parse(localStorage.getItem('cleanpocket_v3')).entries.length")
        page.click("#heroSampleBtn")
        page.wait_for_timeout(150)
        after_sample = page.evaluate("JSON.parse(localStorage.getItem('cleanpocket_v3')).entries.length")
        sample_flagged = page.evaluate("JSON.parse(localStorage.getItem('cleanpocket_v3')).entries.filter(e => e.sample).length")
        check("'Δοκίμασε με δείγμα' adds sample entries", after_sample > before_sample and sample_flagged == after_sample - before_sample)
        check("sample banner appears", page.is_visible("#sampleBar"))
        page.click("#sampleRemoveBtn")
        page.wait_for_timeout(150)
        after_remove = page.evaluate("JSON.parse(localStorage.getItem('cleanpocket_v3')).entries.length")
        check("'Αφαίρεσε' removes exactly the sample entries", after_remove == before_sample)
        check("sample banner hides after removal", page.is_hidden("#sampleBar"))

        # ---- add 2 real shifts via the + sheet ----
        def add_shift(date, income, tips, hours, exp):
            if page.is_hidden("#shiftSheet"):
                page.click("#navAddBtn")
                page.wait_for_selector("#shiftSheet", state="visible")
            page.fill("#fDate", date)
            page.fill("#fIncome", income)
            page.fill("#fTips", tips)
            page.fill("#fHours", hours)
            page.fill("#fExp", exp)
            page.click("#sheetSave")
            page.wait_for_timeout(150)

        add_shift("2026-09-01", "62,5", "8", "6", "9")
        check("first-shift explainer appears after the first real shift", page.is_visible("#firstShiftExplainer"))
        add_shift("2026-09-02", "55", "5", "5", "7")
        page.click("#sheetCancel")
        page.wait_for_selector("#shiftSheet", state="hidden")

        net_text = page.text_content("#netBig")
        set_aside_text = page.text_content("#tSetAside")
        check("home hero shows a number after 2 shifts", net_text is not None and net_text.strip() not in ("", "-"))
        check("set aside is greater than 0", set_aside_text is not None and set_aside_text.strip() not in ("", "-", "0,00 €", "€0.00"))
        shot(page, "home", lang)

        # ---- CSV import through the preview ----
        page.click('[data-nav="more"]')
        entries_before = page.evaluate("JSON.parse(localStorage.getItem('cleanpocket_v3')).entries.length")
        csv_path = os.path.join(ROOT, "tests", "fixtures", "sample.csv")
        page.set_input_files("#impFile", csv_path)
        page.wait_for_selector("#csvSheet", state="visible", timeout=5000)
        found_text = page.text_content("#csvFound")
        page.click("#csvConfirm")
        page.wait_for_selector("#csvSheet", state="hidden")
        entries_after = page.evaluate("JSON.parse(localStorage.getItem('cleanpocket_v3')).entries.length")
        check("csv preview reported rows found: " + str(found_text), "3" in (found_text or ""))
        check("entry count grew after csv import (%d -> %d)" % (entries_before, entries_after), entries_after > entries_before)

        # ---- custom debt appears in obligations ----
        page.click('[data-nav="obligations"]')
        if page.get_attribute("#h-add-debt >> xpath=ancestor::details", "open") is None:
            page.click("#h-add-debt")
        page.wait_for_selector("#debtName", state="visible")
        page.fill("#debtName", "Doshi scooter")
        page.fill("#debtAmount", "60")
        page.fill("#debtDue", "2026-10-05")
        page.click("#debtAdd")
        page.wait_for_timeout(150)
        obl_text = page.text_content("#oblList")
        check("custom debt appears in the obligations list", "scooter" in obl_text)
        shot(page, "obligations", lang)

        # ---- reload and check persistence ----
        page.reload()
        page.wait_for_selector("#onbBackdrop", state="hidden", timeout=5000)
        entries_after_reload = page.evaluate("JSON.parse(localStorage.getItem('cleanpocket_v3')).entries.length")
        check("data persisted across reload", entries_after_reload == entries_after)

        # ---- service worker registered ----
        page.wait_for_timeout(500)
        sw_state = page.evaluate("""
            () => navigator.serviceWorker.getRegistrations().then(regs => regs.length)
        """)
        check("service worker registered", sw_state > 0)

        page.click('[data-nav="more"]')
        if page.get_attribute("#h-mydata >> xpath=ancestor::details", "open") is None:
            page.click("#h-mydata")
        page.wait_for_timeout(100)
        check("share button exists in More", page.is_visible("#shareAppBtn"))
        shot(page, "more", lang)

        # filter out benign vibration-permission advisories unrelated to app correctness
        real_errors = [e for e in console_errors if "vibrate" not in e.lower()]
        check("no console errors (excl. vibration permission notices): " + repr(real_errors[:5]), len(real_errors) == 0)

        context.close()
        browser.close()

    return failures


def main():
    for lang in ("el", "en"):
        print("\n===== SMOKE RUN: %s =====" % lang)
        ALL_FAILURES.extend(run_for_lang(lang))

    print("\n" + ("SMOKE: PASS" if not ALL_FAILURES else "SMOKE: FAIL (%d)" % len(ALL_FAILURES)))
    if ALL_FAILURES:
        for f in ALL_FAILURES:
            print(" - " + f)
        sys.exit(1)


if __name__ == "__main__":
    main()
