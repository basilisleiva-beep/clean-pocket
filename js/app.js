// Clean Pocket v3 - UI layer. Talks to js/calc.js (pure math), js/store.js (persistence),
// js/csv.js (import parsing) and js/i18n.js (strings). No business logic lives here.
import * as C from "./calc.js";
import { LocalStorageAdapter, uuid, nowISO } from "./store.js";
import { parseCSV } from "./csv.js";
import * as I from "./i18n.js";
import { RULES } from "./tax.js";

var store = new LocalStorageAdapter();
var db = store.load();

function $(id) { return document.getElementById(id); }
function persist() { store.save(db); }
function today() { return C.todayISO(); }

var reduced = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);

// ---------------------------------------------------------------------------------------
// Static label wiring: element id -> i18n key (or a function for special cases).
// ---------------------------------------------------------------------------------------
var LABELS = {
  installBtn: "install.btn", installLater: "install.later", updateBtn: "sw.update",
  backupNowBtn: "backup.now", backupLaterBtn: "backup.later",
  navHomeLbl: "nav.home", navCalLbl: "nav.calendar", navOblLbl: "nav.obligations", navMoreLbl: "nav.more",
  "h-last7": "home.last7", "h-breakdown": "home.breakdown",
  lblTotHours: "home.hours", lblPerHour: "home.perHour", lblPerShift: "home.perShift",
  "h-cal-title-top": "nav.calendar", lgDone: "cal.done", lgMissing: "cal.missing", lgOff: "cal.off", lgVat: "cal.vat",
  "h-obl-top": "nav.obligations", "h-obl": "obl.title", "h-setaside": "home.setaside", "h-add-debt": "obl.addDebtBtn",
  lblDebtName: "obl.debtName", lblDebtAmount: "obl.debtAmount", lblDebtDue: "obl.debtDue", lblDebtRepeat: "obl.debtRepeat",
  optRepeatNone: "obl.repeatNone", optRepeatMonthly: "obl.repeatMonthly", debtAdd: "obl.addDebtBtn",
  goalSave: "goal.save", "h-savings": "savings.title", "h-add-savings": "savings.add",
  lblSavName: "savings.name", lblSavTarget: "savings.target", lblSavSaved: "savings.saved", lblSavDate: "savings.date", savAdd: "savings.add",
  "h-more-top": "nav.more", "h-mydata": "more.myData", expJson: "more.exportJson", expCsv: "more.exportCsv",
  shareBtn: "more.share", lblImport: "more.import", "h-delete-all": "more.deleteAll",
  lblDeleteConfirm: "more.deleteConfirmLabel", deleteAllBtn: "more.deleteBtn",
  "h-fixed": "more.fixed", fixedNote: "more.fixedNote", lblFxName: "more.fixedName", lblFxAmount: "more.fixedAmount",
  lblFxVat: "more.fixedVat", fxAdd: "more.fixedAdd",
  "h-history": "more.history", thMonth: "period.month", thIncome: "lane.income", thTips: "lane.tips",
  thNet: "lane.net", thShifts: "misc.shiftN",
  "h-pie": "more.pie", "h-settings": "more.settings", lblTheme: "more.theme", lblLang: "more.language",
  lblWeather: "more.weather", optWxOff: "more.weatherOff", optWxCity: "more.weatherCity", optWxGeo: "more.weatherLocation",
  lblWeatherCity: "more.weatherCity", reonboardBtn: "more.reonboard",
  "h-about": "more.about", aboutDisclaimer: "more.disclaimer", aboutPrivacy: "more.privacy",
  lblDate: "sheet.date", lblIncome: "sheet.income", lblTips: "sheet.tips", lblHours: "sheet.hours", lblExp: "sheet.exp",
  lblDayOff: "sheet.dayOff", sheetCancel: "sheet.cancel", sheetDelete: "sheet.delete",
  csvConfirm: "csv.confirm", csvCancel: "csv.cancel",
  tEarnedCap: "home.earnedCaption", tYoursCap: "home.yoursCaption", tSetAsideCap: "home.setasideCaption",
  heroAddBtn: "home.emptyAdd", heroSampleBtn: "sample.try",
  calEmptyText: "cal.emptyNote", calEmptyAddBtn: "cal.addShift", oblEmptyAddBtn: "obl.emptyAction",
  sampleRemoveBtn: "sample.remove", shareAppBtn: "more.shareApp", tourBtn: "more.tour",
  tourPromptYes: "onb.tourYes", tourPromptSampleBtn: "sample.try", tourPromptNo: "onb.tourNo",
  tourSkip: "tour.skip", tourBack: "tour.back",
  onbSkip: "onb.skip", onbBack: "onb.back"
};

function applyStaticLabels() {
  Object.keys(LABELS).forEach(function (id) {
    var el = $(id);
    if (el) el.textContent = I.t(LABELS[id]);
  });
  $("periodSeg").querySelector('[data-period="h1"]').textContent = I.t("period.h1");
  $("periodSeg").querySelector('[data-period="h2"]').textContent = I.t("period.h2");
  $("periodSeg").querySelector('[data-period="month"]').textContent = I.t("period.month");
  $("periodSeg").querySelector('[data-period="year"]').textContent = I.t("period.year");
  $("bottomnav").setAttribute("aria-label", I.t("nav.aria"));
  $("periodSeg").setAttribute("aria-label", I.t("period.aria"));
  $("periodPrev").setAttribute("aria-label", I.t("period.prev"));
  $("periodNext").setAttribute("aria-label", I.t("period.next"));
  $("calPrev").setAttribute("aria-label", I.t("cal.prev"));
  $("calNext").setAttribute("aria-label", I.t("cal.next"));
  $("navAddBtn").setAttribute("aria-label", I.t("nav.add"));
  $("explainerClose").setAttribute("aria-label", I.t("misc.close"));
  $("langSegTop").setAttribute("aria-label", I.t("more.language"));
  $("langSeg").setAttribute("aria-label", I.t("more.language"));
  document.querySelectorAll(".navbtn[data-nav]").forEach(function (b) {
    var key = b.dataset.nav === "home" ? "nav.home" : b.dataset.nav === "calendar" ? "nav.calendar" : b.dataset.nav === "obligations" ? "nav.obligations" : "nav.more";
    b.setAttribute("aria-label", I.t(key));
  });
  document.documentElement.setAttribute("lang", I.getLang());
  document.title = I.t("app.name");
}

// ---------------------------------------------------------------------------------------
// small utilities
// ---------------------------------------------------------------------------------------
function buzz(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignore */ } }

function burst() {
  if (reduced) return;
  var c = $("confetti"), ctx = c && c.getContext && c.getContext("2d");
  if (!ctx) return;
  c.width = window.innerWidth; c.height = window.innerHeight;
  var ox = c.width / 2, oy = c.height - 120;
  var colors = ["#5be3b0", "#f4be55", "#8db8ff", "#f2b705"];
  var ps = [];
  for (var i = 0; i < 60; i++) {
    ps.push({
      x: ox + (Math.random() - .5) * 80, y: oy,
      vx: (Math.random() - .5) * 10, vy: -(Math.random() * 9 + 4),
      s: Math.random() * 5 + 4, a: Math.random() * 6, va: (Math.random() - .5) * .4,
      col: colors[Math.floor(Math.random() * colors.length)]
    });
  }
  var frame = 0;
  function draw() {
    ctx.clearRect(0, 0, c.width, c.height);
    var alive = false;
    ps.forEach(function (q) {
      q.vy += .35; q.x += q.vx; q.y += q.vy; q.a += q.va;
      if (q.y < c.height + 20) alive = true;
      ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.a);
      ctx.fillStyle = q.col; ctx.fillRect(-q.s / 2, -q.s / 4, q.s, q.s / 2);
      ctx.restore();
    });
    frame++;
    if (alive && frame < 160) requestAnimationFrame(draw); else ctx.clearRect(0, 0, c.width, c.height);
  }
  requestAnimationFrame(draw);
}

function addMonthsYM(ym, k) {
  var p = ym.split("-").map(Number);
  var t = p[0] * 12 + (p[1] - 1) + k;
  var y = Math.floor(t / 12), m = (t % 12) + 1;
  return y + "-" + C.pad(m);
}
function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }

// ---------------------------------------------------------------------------------------
// theme + language
// ---------------------------------------------------------------------------------------
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  var colors = { forest: "#142b24", graphite: "#1a1e25", black: "#000000", light: "#eef0f3" };
  var meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", colors[theme] || colors.forest);
  document.querySelectorAll("#themePick button").forEach(function (b) {
    b.setAttribute("aria-pressed", b.dataset.theme === theme ? "true" : "false");
  });
}
function setTheme(theme) {
  db.settings.theme = theme; persist(); applyTheme(theme);
}
function setLang(lang) {
  db.settings.lang = lang; persist(); I.setLang(lang);
  document.querySelectorAll(".langseg .segbtn").forEach(function (b) {
    b.setAttribute("aria-pressed", b.dataset.lang === lang ? "true" : "false");
  });
  applyStaticLabels();
  render();
  if (!$("tourBackdrop").hidden) tourRenderStep();
  if (!$("onbBackdrop").hidden) renderOnbStep();
}

// ---------------------------------------------------------------------------------------
// navigation between the four views
// ---------------------------------------------------------------------------------------
var currentNav = "home";
function switchView(name) {
  currentNav = name;
  document.querySelectorAll(".view").forEach(function (v) { v.hidden = v.dataset.view !== name; });
  document.querySelectorAll(".navbtn[data-nav]").forEach(function (b) {
    var on = b.dataset.nav === name;
    if (on) b.setAttribute("aria-current", "page"); else b.removeAttribute("aria-current");
  });
  window.scrollTo(0, 0);
}
document.querySelectorAll(".navbtn[data-nav]").forEach(function (b) {
  b.addEventListener("click", function () { switchView(b.dataset.nav); });
});

// ---------------------------------------------------------------------------------------
// period state (Home) shared with the More-tab pie/history period
// ---------------------------------------------------------------------------------------
var period = +today().slice(8, 10) <= 14 ? "h1" : "h2"; // h1 | h2 | month | year
var cursor = today().slice(0, 7); // YYYY-MM

function periodKey() {
  if (period === "year") return cursor.slice(0, 4);
  if (period === "month") return cursor + "-0";
  return cursor + "-" + (period === "h1" ? "1" : "2");
}
function syncSegButtons() {
  document.querySelectorAll("#periodSeg .segbtn").forEach(function (b) {
    b.setAttribute("aria-pressed", b.dataset.period === period ? "true" : "false");
  });
}
function stepPeriod(dir) {
  if (period === "year") { cursor = (+cursor.slice(0, 4) + dir) + "-01"; }
  else if (period === "month") { cursor = addMonthsYM(cursor, dir); }
  else if (period === "h1") {
    if (dir < 0) { cursor = addMonthsYM(cursor, -1); period = "h2"; } else { period = "h2"; }
  } else {
    if (dir < 0) { period = "h1"; } else { cursor = addMonthsYM(cursor, 1); period = "h1"; }
  }
  syncSegButtons(); render();
}
$("periodPrev").addEventListener("click", function () { stepPeriod(-1); });
$("periodNext").addEventListener("click", function () { stepPeriod(1); });
document.querySelectorAll("#periodSeg .segbtn").forEach(function (b) {
  b.addEventListener("click", function () { period = b.dataset.period; syncSegButtons(); render(); });
});

function periodLabelText() {
  var p = cursor.split("-"), y = +p[0], m = +p[1];
  if (period === "year") return I.t("period.year") + " " + cursor.slice(0, 4);
  if (period === "month") return I.monthFull(m - 1) + " " + y;
  var last = daysInMonth(y, m);
  return (period === "h1" ? "1-14" : "15-" + last) + " " + I.monthShort(m - 1) + " " + y;
}

// ---------------------------------------------------------------------------------------
// shift sheet (add / edit / delete / day-off)
// ---------------------------------------------------------------------------------------
var editingId = null;
function openSheet(dateISO, prefillEntry) {
  editingId = prefillEntry ? prefillEntry.id : null;
  $("sheetTitle").textContent = I.t(editingId ? "sheet.titleEdit" : "sheet.title");
  $("fDate").value = dateISO || today();
  $("fIncome").value = prefillEntry && prefillEntry.income > 0 ? prefillEntry.income : "";
  $("fTips").value = prefillEntry && prefillEntry.tips > 0 ? prefillEntry.tips : "";
  $("fHours").value = prefillEntry && prefillEntry.hours > 0 ? prefillEntry.hours : "";
  $("fExp").value = prefillEntry && prefillEntry.exp > 0 ? prefillEntry.exp : "";
  $("fOff").checked = !!(db.off || {})[dateISO];
  $("sheetDelete").hidden = !editingId;
  $("sheetStatus").textContent = "";
  $("sheetSave").textContent = I.t(editingId ? "sheet.saveEdit" : "sheet.save");
  $("sheetBackdrop").hidden = false;
  $("shiftSheet").hidden = false;
}
function closeSheet() {
  $("sheetBackdrop").hidden = true;
  $("shiftSheet").hidden = true;
  editingId = null;
}
$("sheetBackdrop").addEventListener("click", closeSheet);
$("sheetCancel").addEventListener("click", closeSheet);
$("navAddBtn").addEventListener("click", function () { openSheet(today(), null); });

["1", "2", "5", "10"].forEach(function (v) {
  var btn = document.querySelector('.chip[data-add="' + v + '"]');
  if (btn) btn.addEventListener("click", function () {
    var cur = C.n0($("fTips").value) || 0;
    $("fTips").value = (cur + (+v));
  });
});
$("tipsClear").addEventListener("click", function () { $("fTips").value = ""; });

$("sheetSave").addEventListener("click", function () {
  var date = $("fDate").value;
  if (!date) { $("sheetStatus").textContent = I.t("sheet.date") + " ?"; return; }
  db.off = db.off || {};
  if ($("fOff").checked) {
    db.off[date] = true;
    if (editingId) { db.entries = db.entries.filter(function (e) { return e.id !== editingId; }); }
  } else {
    delete db.off[date];
    var income = C.n0($("fIncome").value), tips = C.n0($("fTips").value);
    var hours = C.n0($("fHours").value), exp = C.n0($("fExp").value);
    if (editingId) {
      var e = db.entries.find(function (x) { return x.id === editingId; });
      if (e) { e.date = date; e.income = income; e.tips = tips; e.hours = hours; e.exp = exp; e.updatedAt = nowISO(); }
    } else {
      db.entries.push({ id: uuid(), date: date, income: income, tips: tips, hours: hours, exp: exp, updatedAt: nowISO() });
    }
  }
  persist();
  $("sheetStatus").textContent = I.t("sheet.saved");
  buzz(20);
  if (!reduced) burst();
  editingId = null;
  $("sheetDelete").hidden = true;
  $("sheetSave").textContent = I.t("sheet.save");
  $("sheetTitle").textContent = I.t("sheet.title");
  // advance the date by one day and clear amounts, ready for the next quick entry
  var nd = new Date(date); nd.setDate(nd.getDate() + 1);
  $("fDate").value = C.todayISO(nd);
  $("fIncome").value = ""; $("fTips").value = ""; $("fHours").value = ""; $("fExp").value = ""; $("fOff").checked = false;
  // show the period the saved shift belongs to, so the result is visible right away
  cursor = date.slice(0, 7);
  if (period === "h1" || period === "h2") period = +date.slice(8, 10) <= 14 ? "h1" : "h2";
  syncSegButtons();
  render();
});

$("sheetDelete").addEventListener("click", function () {
  if (!editingId) return;
  db.entries = db.entries.filter(function (e) { return e.id !== editingId; });
  persist();
  closeSheet();
  render();
});

// ---------------------------------------------------------------------------------------
// Home
// ---------------------------------------------------------------------------------------
$("heroAddBtn").addEventListener("click", function () { openSheet(today(), null); });

// The explainer is its own dismissible card (not the hero kicker): it appears once, after the
// first real shift is saved, and stays dismissed (db.settings.explainerDismissed) across reloads.
function renderFirstShiftExplainer() {
  var box = $("firstShiftExplainer");
  var all = C.realEntries(db);
  if (all.length < 1 || db.settings.explainerDismissed) { box.hidden = true; return; }
  var e0 = all.slice().sort(function (a, b) { return a.date < b.date ? -1 : 1; })[0];
  var hk = C.halfKeyOf(e0.date);
  var t0 = C.periodTotalsHalf(db, hk);
  var efka0 = C.efkaShareForKey(db, hk, today());
  var est0 = C.annualTaxEstimate(db, today());
  var profit0 = Math.max(0, (t0.income + t0.tips - t0.exp - t0.fixed));
  var amt = efka0 + profit0 * est0.effRate;
  $("explainerText").textContent = I.t("home.explainer", { amt: I.fmtEUR(amt) });
  box.hidden = false;
}
$("explainerClose").addEventListener("click", function () {
  db.settings.explainerDismissed = true; persist();
  $("firstShiftExplainer").hidden = true;
});

function renderLegendRow(li, name, val, color) {
  li.innerHTML = "";
  var nameSpan = document.createElement("span"); nameSpan.className = "name";
  var dot = document.createElement("span"); dot.className = "dot"; dot.style.background = color;
  var nm = document.createElement("span"); nm.textContent = name;
  nameSpan.appendChild(dot); nameSpan.appendChild(nm);
  var val2 = document.createElement("span"); val2.className = "val"; val2.textContent = val;
  li.appendChild(nameSpan); li.appendChild(val2);
}

function renderHome() {
  var key = periodKey();
  var t = period === "year" ? C.yearTotals(db, key) : C.periodTotals(db, key);
  var gross = t.income + t.tips;
  var has = t.shifts > 0 || gross > 0;
  var vat = C.vatConfig(db);
  var efkaShare = period === "year" ? C.efkaShareForYear(db, key, today()) : C.efkaShareForKey(db, key, today());
  var profit = gross - t.exp - t.fixed;

  $("periodLabel").textContent = periodLabelText();

  if (!has) {
    $("heroKicker").textContent = I.t("home.empty");
    $("netBig").textContent = "-"; $("netBig").classList.remove("neg");
    $("heroCard").classList.remove("neg");
    $("netSub").textContent = "";
    ["tEarned", "tYours", "tSetAside"].forEach(function (id) { $(id).textContent = "-"; });
    $("lane").innerHTML = ""; $("rider").hidden = true;
    $("legendList").innerHTML = "";
    ["totHours", "perHour", "perShift"].forEach(function (id) { $(id).textContent = "-"; });
    $("vatLine").hidden = true; $("prepayNote").textContent = ""; $("presumedWarn").hidden = true;
    $("extraWrap").hidden = true;
    $("heroEmptyActions").hidden = false;
  } else {
    $("heroEmptyActions").hidden = true;
    var est = C.annualTaxEstimate(db, today());
    var taxReserve = Math.max(0, profit) * est.effRate;
    var net = profit - efkaShare - taxReserve;
    var vatPay = t.vatOut - t.vatInShift - t.vatInFixed;

    $("heroKicker").textContent = I.t("home.title");
    $("netBig").textContent = I.fmtEUR(net);
    $("netBig").classList.toggle("neg", net < 0);
    $("heroCard").classList.toggle("neg", net < 0);
    $("netSub").textContent = t.shifts + " " + I.t(t.shifts === 1 ? "misc.shift1" : "misc.shiftN");

    $("tEarnedLbl").textContent = I.t("home.earned");
    $("tYoursLbl").textContent = I.t("home.yours");
    $("tSetAsideLbl").textContent = I.t("home.setaside");
    $("tEarned").textContent = I.fmtEUR(gross);
    $("tYours").textContent = I.fmtEUR(net);
    var sa = C.setAside(db, today());
    $("tSetAside").textContent = I.fmtEUR(sa.total);

    if (gross > 0) {
      var pct = function (v) { return Math.max(0, Math.min(100, (v / gross) * 100)); };
      var sExp = pct(t.exp + t.fixed), sEfka = pct(efkaShare), sTax = pct(taxReserve);
      var sNet = Math.max(0, 100 - sExp - sEfka - sTax);
      $("lane").innerHTML =
        '<span class="s-net" style="width:' + sNet + '%"></span>' +
        '<span class="s-tax" style="width:' + sTax + '%"></span>' +
        '<span class="s-efka" style="width:' + sEfka + '%"></span>' +
        '<span class="s-exp" style="width:' + sExp + '%"></span>';
      $("rider").hidden = false; $("rider").style.left = sNet + "%";
    } else { $("lane").innerHTML = ""; $("rider").hidden = true; }

    var legend = $("legendList"); legend.innerHTML = "";
    var rows = [
      [I.t("lane.exp"), I.fmtEUR(Math.max(0, t.exp)), "var(--expense)"],
      [I.t("lane.fixed"), I.fmtEUR(t.fixed), "color-mix(in srgb, var(--expense) 60%, transparent)"],
      [I.t("lane.efka"), I.fmtEUR(efkaShare), "var(--efka)"],
      [I.t("lane.tax"), I.fmtEUR(taxReserve), "var(--tax)"]
    ];
    if (vat.on) rows.push([I.t("lane.vat"), I.fmtEUR(vatPay), "var(--vat)"]);
    rows.push([I.t("lane.net"), I.fmtEUR(net), "var(--net)"]);
    rows.forEach(function (r) { var li = document.createElement("li"); renderLegendRow(li, r[0], r[1], r[2]); legend.appendChild(li); });

    $("totHours").textContent = C.fmtDec ? "" : "";
    $("totHours").textContent = I.fmtDec(t.hours, 2);
    $("perHour").textContent = t.hours > 0 ? I.fmtEUR(net / t.hours) : "-";
    $("perShift").textContent = t.shifts > 0 ? I.fmtEUR(net / t.shifts) : "-";

    var vl = $("vatLine");
    if (vat.on && t.vatOut > 0) {
      vl.hidden = false;
      vl.textContent = I.t("lane.incomeExVat") + ": " + I.fmtEUR(t.income) + " + " + I.t("lane.vat") + " " + I.fmtEUR(t.vatOut);
    } else vl.hidden = true;

    var msg = "";
    if (est.tax > 0) {
      msg = I.t("home.taxRateNote", { r: I.fmtDec(est.effRate * 100, 1), p: I.fmtEUR(C.projectedAnnual(db, today())) });
    }
    $("prepayNote").textContent = msg;
    $("presumedWarn").hidden = !est.presumedWarning;
    if (est.presumedWarning) $("presumedWarn").textContent = I.t("home.presumedWarning");

    $("extraWrap").hidden = (period !== "h1" && period !== "h2");
    if (period === "h1" || period === "h2") {
      $("extraLabel").textContent = I.t("more.fixedAmount");
      $("extraInput").value = (db.extra || {})[key] || "";
    }
  }

  renderFirstShiftExplainer();
  renderGoalMini();
  renderWeek();
}

function obligationLabel(o) {
  if (o.type === "efka") { var p = o.key.split("-"); return I.t("obl.efka", { m: p[1] + "/" + p[2] }); }
  if (o.type === "vat") { var m = /^vat-(\d+)-Q(\d)$/.exec(o.key); return I.t("obl.vat", { q: "Q" + m[2] + " " + m[1] }); }
  if (o.type === "tax") { var idx = +o.key.split("-")[2] + 1; return I.t("obl.tax", { i: idx, n: RULES.taxInstallments }) + " (" + I.t("obl.estimate") + ")"; }
  return o.label;
}

function renderGoalMini() {
  var st = C.annualGoalStats(db, today());
  var goal = C.n(db.goals[st.year]);
  var card = $("goalMiniCard");
  if (goal <= 0) { card.hidden = true; return; }
  card.hidden = false;
  var pct = Math.max(0, Math.min(100, (st.net / goal) * 100));
  $("goalMiniLabel").textContent = I.t("home.goalMini", { y: st.year });
  $("goalMiniPct").textContent = Math.round(pct) + "%";
  $("goalMiniFill").style.width = pct + "%";
}

function renderWeek() {
  var wrap = $("wkBars"); wrap.innerHTML = "";
  var vat = C.vatConfig(db);
  var days = [];
  var d = new Date(); d.setHours(0, 0, 0, 0);
  for (var i = 6; i >= 0; i--) {
    var dd = new Date(d); dd.setDate(d.getDate() - i);
    days.push(C.todayISO(dd));
  }
  var max = 0;
  var perDay = days.map(function (iso) {
    var income = 0, tips = 0, off = !!(db.off || {})[iso];
    C.activeEntries(db).forEach(function (e) {
      if (e.date === iso) { var a = C.entryAdj(e, vat); income += a.income; tips += a.tips; }
    });
    max = Math.max(max, income + tips);
    return { iso: iso, income: income, tips: tips, off: off };
  });
  var todayI = today();
  perDay.forEach(function (day, idx) {
    var wd = new Date(day.iso).getDay(); // 0=Sun
    var idxMon = (wd + 6) % 7;
    var col = document.createElement("button");
    col.type = "button";
    col.className = "wk-col" + (day.iso === todayI ? " today" : "") + (day.off ? " off" : "");
    var incH = max > 0 ? Math.max(day.income > 0 ? 6 : 0, (day.income / max) * 84) : 0;
    var tipH = max > 0 ? Math.max(day.tips > 0 ? 4 : 0, (day.tips / max) * 84) : 0;
    col.innerHTML =
      '<span class="wk-val">' + (day.income + day.tips > 0 ? I.fmtInt(day.income + day.tips) : "") + '</span>' +
      '<div class="wk-track"><div class="wk-bar" style="height:' + Math.max(3, incH + tipH) + 'px">' +
      '<div class="t" style="height:' + tipH + 'px"></div><div class="p" style="height:' + incH + 'px"></div></div></div>' +
      '<span class="wk-day">' + I.weekdayShort(idxMon) + '</span>';
    col.addEventListener("click", function () { openSheet(day.iso, findEntryByDate(day.iso)); });
    wrap.appendChild(col);
  });
  var total = perDay.reduce(function (s, d) { return s + d.income + d.tips; }, 0);
  $("wkNote").textContent = total > 0 ? "" : I.t("home.last7empty");
}

function findEntryByDate(iso) {
  var found = null;
  C.activeEntries(db).forEach(function (e) { if (e.date === iso) found = e; });
  return found;
}

// ---------------------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------------------
var calCursor = today().slice(0, 7);

function renderCalendarDow() {
  var el = $("calDow"); el.innerHTML = "";
  for (var i = 0; i < 7; i++) { var s = document.createElement("span"); s.textContent = I.weekdayShort(i); el.appendChild(s); }
}

function renderCalendar() {
  $("calEmpty").hidden = C.activeEntries(db).length > 0;
  renderCalendarDow();
  var p = calCursor.split("-"), y = +p[0], m = +p[1];
  $("calTitle").textContent = I.monthFull(m - 1) + " " + y;
  var grid = $("calGrid"); grid.innerHTML = "";
  var first = new Date(y, m - 1, 1);
  var startIdx = (first.getDay() + 6) % 7; // Monday=0
  var lastDay = daysInMonth(y, m);
  var todayI = today();

  var vatDueDay = null;
  if (C.vatConfig(db).on) {
    // mark the day of month a VAT quarter is due, if it falls in this month
    C.obligationsList(db, todayI).forEach(function (o) {
      if (o.type === "vat" && o.due.slice(0, 7) === calCursor) vatDueDay = +o.due.slice(8, 10);
    });
  }
  var efkaDueDay = null;
  C.obligationsList(db, todayI).forEach(function (o) {
    if (o.type === "efka" && o.due.slice(0, 7) === calCursor) efkaDueDay = +o.due.slice(8, 10);
  });

  for (var i = 0; i < startIdx; i++) { var blank = document.createElement("div"); blank.className = "cal-day blank"; grid.appendChild(blank); }
  for (var day = 1; day <= lastDay; day++) {
    var iso = y + "-" + C.pad(m) + "-" + C.pad(day);
    var entry = findEntryByDate(iso);
    var isOff = !!(db.off || {})[iso];
    var btn = document.createElement("button");
    btn.type = "button";
    var cls = "cal-day";
    if (iso === todayI) cls += " today";
    if (isOff) cls += " off";
    else if (entry) cls += " done";
    else if (iso < todayI) cls += " missing";
    btn.className = cls;
    var small = entry ? I.fmtInt(entry.income + entry.tips) : (isOff ? "-" : "");
    btn.innerHTML = day + (small ? "<small>" + small + "</small>" : "");
    if ((vatDueDay === day) || (efkaDueDay === day)) {
      var dot = document.createElement("span"); dot.className = "vdot"; btn.appendChild(dot);
    }
    btn.addEventListener("click", function (isoC, entryC) {
      return function () { openSheet(isoC, entryC); };
    }(iso, entry));
    grid.appendChild(btn);
  }
}
$("calPrev").addEventListener("click", function () { calCursor = addMonthsYM(calCursor, -1); renderCalendar(); });
$("calNext").addEventListener("click", function () { calCursor = addMonthsYM(calCursor, 1); renderCalendar(); });
$("calEmptyAddBtn").addEventListener("click", function () { openSheet(today(), null); });

// ---------------------------------------------------------------------------------------
// Obligations & Goals
// ---------------------------------------------------------------------------------------
function renderObligations() {
  var sa = C.setAside(db, today());
  $("setAsideNote").textContent = I.t("obl.setAsideNote");
  $("setAsideBig").textContent = I.fmtEUR(sa.total);

  var list = C.obligationsList(db, today());
  var ul = $("oblList"); ul.innerHTML = "";
  $("oblEmptyAddBtn").hidden = list.length > 0;
  if (!list.length) {
    var li0 = document.createElement("li"); li0.textContent = I.t("obl.empty"); ul.appendChild(li0);
  }
  list.forEach(function (o) {
    var li = document.createElement("li");
    var late = !o.paid && o.due < today();
    li.innerHTML =
      '<span><span class="oname"></span><br><span class="odue' + (late ? " late" : "") + '"></span></span>' +
      '<span class="oamt"></span>' +
      '<span class="opaid"><label><input type="checkbox"' + (o.paid ? " checked" : "") + '> <span></span></label></span>';
    li.querySelector(".oname").textContent = obligationLabel(o);
    li.querySelector(".odue").textContent = (late ? I.t("obl.overdue") + " · " : "") + I.fmtDateShort(o.due);
    li.querySelector(".oamt").textContent = I.fmtEUR(o.amount);
    li.querySelector(".opaid span").textContent = I.t(o.paid ? "obl.markUnpaid" : "obl.markPaid");
    li.querySelector(".opaid input").addEventListener("change", function () {
      db.obligationsPaid = db.obligationsPaid || {};
      if (db.obligationsPaid[o.key]) delete db.obligationsPaid[o.key]; else db.obligationsPaid[o.key] = true;
      persist(); render();
    });
    ul.appendChild(li);
  });

  renderGoalPanel();
  renderSavingsGoals();
}

$("oblEmptyAddBtn").addEventListener("click", function () { openSheet(today(), null); });
$("debtAdd").addEventListener("click", function () {
  var name = $("debtName").value.trim();
  var amount = C.n($("debtAmount").value);
  var due = $("debtDue").value;
  var repeat = $("debtRepeat").value;
  if (!name || amount <= 0 || !due) return;
  db.debts.push({ id: uuid(), name: name.slice(0, 60), amount: amount, due: due, repeat: repeat, updatedAt: nowISO() });
  persist();
  $("debtName").value = ""; $("debtAmount").value = ""; $("debtDue").value = ""; $("debtRepeat").value = "none";
  render();
});

var goalShown = false, lastGoalPct = null;
function renderGoalPanel() {
  var st = C.annualGoalStats(db, today());
  var goal = C.n(db.goals[st.year]);
  var locked = goal > 0 && db.goalLocks[st.year] === true;
  $("goalTitleText").textContent = I.t("goal.title", { y: st.year });
  var input = $("goalInput");
  if (document.activeElement !== input) input.value = goal > 0 ? goal : "";
  input.disabled = locked; $("goalSave").disabled = locked;
  var lockBtn = $("goalLock");
  lockBtn.hidden = goal <= 0;
  lockBtn.setAttribute("aria-pressed", locked ? "true" : "false");
  lockBtn.textContent = locked ? "🔒" : "🔓";
  lockBtn.setAttribute("aria-label", I.t(locked ? "goal.unlock" : "goal.lock"));

  var fill = $("goalFill"), rider = $("goalRider"), plan = $("goalPlan");
  if (goal <= 0) {
    fill.style.width = "0%"; rider.style.left = "0%";
    $("goalLine").textContent = I.t("goal.empty");
    $("goalCheer").textContent = I.t("goal.onlyNet");
    plan.hidden = true; lastGoalPct = null;
    return;
  }
  var pct = Math.max(0, Math.min(100, (st.net / goal) * 100));
  fill.style.width = pct + "%"; rider.style.left = pct + "%";
  var left = Math.max(0, goal - Math.max(0, st.net));
  $("goalLine").textContent = I.t("goal.progress", { a: I.fmtEUR(Math.max(0, st.net)), b: I.fmtEUR(goal), p: Math.round(pct) }) +
    (left > 0 ? I.t("goal.left", { l: I.fmtEUR(left) }) : "") + (locked ? I.t("goal.locked") : "");
  var cheerKey = pct >= 100 ? "goal.cheer.done" : pct >= 75 ? "goal.cheer.75" : pct >= 50 ? "goal.cheer.50" : pct >= 25 ? "goal.cheer.25" : pct > 0 ? "goal.cheer.start" : "goal.cheer.none";
  $("goalCheer").textContent = I.t(cheerKey);
  if (lastGoalPct !== null && lastGoalPct < 100 && pct >= 100) { buzz([20, 40, 20]); if (!reduced) burst(); }
  lastGoalPct = pct;

  plan.hidden = false; plan.innerHTML = "";
  if (st.margin <= 0) {
    var p0 = document.createElement("p"); p0.textContent = I.t("goal.plan.needData"); plan.appendChild(p0);
    return;
  }
  var H = C.hoursForGoal(db, goal, st.margin, st.efkaMonthly);
  var head = document.createElement("p");
  head.textContent = I.t("goal.plan.head", { m: I.fmtEUR(st.margin) });
  plan.appendChild(head);
  var ul = document.createElement("ul");
  var remH = Math.max(0, H - st.hoursYTD);
  [[I.fmtInt(H), I.t("goal.plan.hoursTotal")], [I.fmtInt(remH), I.t("goal.plan.hoursLeft")]].forEach(function (it) {
    var li = document.createElement("li");
    var a = document.createElement("span"); a.className = "num"; a.textContent = it[0];
    var b = document.createElement("small"); b.textContent = it[1];
    li.appendChild(a); li.appendChild(b); ul.appendChild(li);
  });
  plan.appendChild(ul);
}
$("goalSave").addEventListener("click", function () {
  var y = today().slice(0, 4);
  if (db.goalLocks[y] === true) return;
  var v = C.n($("goalInput").value);
  if (v > 0) db.goals[y] = v; else delete db.goals[y];
  persist(); render();
});
$("goalLock").addEventListener("click", function () {
  var y = today().slice(0, 4);
  if (C.n(db.goals[y]) <= 0) return;
  if (db.goalLocks[y] === true) delete db.goalLocks[y]; else db.goalLocks[y] = true;
  persist(); buzz(15); render();
});

function renderSavingsGoals() {
  var ul = $("savingsList"); ul.innerHTML = "";
  C.activeSavingsGoals(db).forEach(function (g) {
    var plan = C.savingsGoalPlan(g, today());
    var pct = g.target > 0 ? Math.max(0, Math.min(100, (g.saved / g.target) * 100)) : 0;
    var li = document.createElement("li");
    li.innerHTML =
      '<div class="sname"><span></span><span></span></div>' +
      '<div class="sbar"><span style="width:' + pct + '%"></span></div>' +
      '<div class="smeta"><span></span><span></span></div>';
    li.querySelector(".sname span").textContent = g.name;
    li.querySelector(".sname span:last-child").textContent = I.fmtEUR(g.saved) + " / " + I.fmtEUR(g.target);
    li.querySelector(".smeta span").textContent = I.t("savings.remaining", { r: I.fmtEUR(plan.remaining) });
    li.querySelector(".smeta span:last-child").textContent = plan.perWeek != null ? I.t("savings.perWeek", { w: I.fmtEUR(plan.perWeek) }) : "";
    ul.appendChild(li);
  });
}
$("savAdd").addEventListener("click", function () {
  var name = $("savName").value.trim();
  var target = C.n($("savTarget").value);
  var saved = C.n0($("savSaved").value);
  var date = $("savDate").value || null;
  if (!name || target <= 0) return;
  db.savingsGoals.push({ id: uuid(), name: name.slice(0, 60), target: target, saved: saved, targetDate: date, updatedAt: nowISO() });
  persist();
  $("savName").value = ""; $("savTarget").value = ""; $("savSaved").value = ""; $("savDate").value = "";
  render();
});

// ---------------------------------------------------------------------------------------
// More: fixed expenses, history, pie, data, settings, about
// ---------------------------------------------------------------------------------------
function renderFixed() {
  var ul = $("fixedList"); ul.innerHTML = "";
  var total = 0;
  C.activeFixed(db).forEach(function (f) {
    total += C.n(f.amount);
    var li = document.createElement("li");
    li.innerHTML = '<span class="nm"></span><span class="am"></span><button type="button" class="x">✕</button>';
    li.querySelector(".nm").textContent = f.name + (f.vatDeductible ? " (" + I.t("more.fixedVatMark") + ")" : "");
    li.querySelector(".am").textContent = I.fmtEUR(f.amount);
    li.querySelector(".x").addEventListener("click", function () {
      f.deleted = true; f.updatedAt = nowISO(); persist(); render();
    });
    ul.appendChild(li);
  });
  $("fixedTotal").textContent = I.fmtEUR(total);
}
$("fxAdd").addEventListener("click", function () {
  var name = $("fxName").value.trim();
  var amount = C.n($("fxAmount").value);
  if (!name || amount <= 0) return;
  db.fixed.push({ id: uuid(), name: name.slice(0, 60), amount: amount, vatDeductible: $("fxVat").checked, updatedAt: nowISO() });
  persist();
  $("fxName").value = ""; $("fxAmount").value = ""; $("fxVat").checked = false;
  render();
});

function renderHistory() {
  var months = {};
  C.activeEntries(db).forEach(function (e) { months[e.date.slice(0, 7)] = true; });
  var keys = Object.keys(months).sort().reverse();
  $("histEmpty").hidden = keys.length > 0;
  $("histEmpty").textContent = I.t("more.historyEmpty");
  $("histWrap").hidden = keys.length === 0;
  var tbody = $("histBody"); tbody.innerHTML = "";
  var est = C.annualTaxEstimate(db, today());
  keys.forEach(function (ym) {
    var t = C.periodTotals(db, ym + "-0");
    var efkaMon = C.efkaMonthly(db.settings);
    var profit = t.income + t.tips - t.exp - t.fixed;
    var net = profit - efkaMon - Math.max(0, profit) * est.effRate;
    var p = ym.split("-");
    var tr = document.createElement("tr");
    tr.innerHTML = "<td></td><td class='r'></td><td class='r'></td><td class='r'></td><td class='r'></td>";
    var tds = tr.querySelectorAll("td");
    tds[0].textContent = I.monthShort(+p[1] - 1) + " " + p[0];
    tds[1].textContent = I.fmtEUR(t.income);
    tds[2].textContent = I.fmtEUR(t.tips);
    tds[3].textContent = I.fmtEUR(net);
    tds[4].textContent = t.shifts;
    tbody.appendChild(tr);
  });
}

var PIE_GREENS = ["#5be3b0", "#a5f0d3"];
var PIE_REDS = ["#ffa89f", "#ff8474", "#f2584a", "#d43f32", "#a9332a"];
function renderPie() {
  var key = periodKey();
  var t = period === "year" ? C.yearTotals(db, key) : C.periodTotals(db, key);
  var wrap = $("pieWrap"), legend = $("pieLegend");
  var gross = t.income + t.tips;
  if (!(t.shifts > 0 || gross > 0)) {
    wrap.innerHTML = ""; legend.innerHTML = ""; $("pieNote").textContent = I.t("more.pieEmpty");
    return;
  }
  var vat = C.vatConfig(db);
  var efkaShare = period === "year" ? C.efkaShareForYear(db, key, today()) : C.efkaShareForKey(db, key, today());
  var profit = gross - t.exp - t.fixed;
  var est = C.annualTaxEstimate(db, today());
  var taxReserve = Math.max(0, profit) * est.effRate;
  var net = profit - efkaShare - taxReserve;
  var items = [
    { name: vat.on ? I.t("lane.incomeExVat") : I.t("lane.income"), val: t.income, color: PIE_GREENS[0] },
    { name: I.t("lane.tips"), val: t.tips, color: PIE_GREENS[1] },
    { name: I.t("lane.exp"), val: Math.max(0, t.exp), color: PIE_REDS[0] },
    { name: I.t("lane.fixed"), val: t.fixed, color: PIE_REDS[2] },
    { name: I.t("lane.efka"), val: efkaShare, color: PIE_REDS[3] },
    { name: I.t("lane.tax"), val: taxReserve, color: PIE_REDS[4] }
  ].filter(function (i) { return i.val > 0.005; });
  var total = items.reduce(function (s, i) { return s + i.val; }, 0);
  if (total <= 0) { wrap.innerHTML = ""; legend.innerHTML = ""; return; }
  var r = 42, Cc = 2 * Math.PI * r, cum = 0, circles = "";
  items.forEach(function (i) {
    var len = (i.val / total) * Cc;
    var gap = items.length > 1 ? Math.min(2, len * 0.3) : 0;
    circles += '<circle cx="60" cy="60" r="' + r + '" fill="none" stroke="' + i.color + '" stroke-width="20" stroke-dasharray="' +
      Math.max(0, len - gap).toFixed(2) + ' ' + (Cc - Math.max(0, len - gap)).toFixed(2) + '" stroke-dashoffset="' + (-cum).toFixed(2) + '"></circle>';
    cum += len;
  });
  var netColor = net < 0 ? "var(--tax)" : "var(--net)";
  wrap.innerHTML = '<svg viewBox="0 0 120 120" role="img"><g transform="rotate(-90 60 60)">' + circles + '</g>' +
    '<text x="60" y="55" text-anchor="middle" font-size="8" fill="var(--muted)">' + I.t("lane.net") + '</text>' +
    '<text x="60" y="70" text-anchor="middle" font-size="12" fill="' + netColor + '">' + I.fmtEUR(net) + '</text></svg>';
  legend.innerHTML = "";
  items.forEach(function (i) {
    var li = document.createElement("li");
    renderLegendRow(li, i.name, I.fmtEUR(i.val) + " (" + Math.round((i.val / total) * 100) + "%)", i.color);
    legend.appendChild(li);
  });
  $("pieNote").textContent = "";
}

// ---- data: export / import / delete ----
function stamp() { var d = new Date(); return d.getFullYear() + C.pad(d.getMonth() + 1) + C.pad(d.getDate()); }
function saveFile(name, content, mime) {
  var blob = new Blob([content], { type: mime || "application/json" });
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a"); a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
}
$("expJson").addEventListener("click", function () {
  var payload = store.exportJSON(db);
  saveFile("clean-pocket-" + stamp() + ".json", JSON.stringify(payload, null, 2));
  db.lastBackup = today(); persist(); renderBanners();
  $("dataStatus").textContent = I.t("sheet.saved");
});
$("expCsv").addEventListener("click", function () {
  var fmt = function (v) { return String(v).replace(".", ","); };
  var rows = C.realEntries(db).slice().sort(function (a, b) { return a.date < b.date ? -1 : (a.date > b.date ? 1 : 0); });
  var out = [[I.t("csv.hdrDate"), I.t("csv.hdrIncome"), I.t("csv.hdrTips"), I.t("csv.hdrHours"), I.t("csv.hdrExp")].join(";")];
  rows.forEach(function (e) { out.push([e.date, fmt(e.income), fmt(e.tips), fmt(e.hours), fmt(e.exp)].join(";")); });
  var slug = I.getLang() === "en" ? "shifts-" : "vardies-";
  saveFile(slug + stamp() + ".csv", "﻿" + out.join("\r\n"), "text/csv");
});
if (navigator.share) {
  $("shareBtn").hidden = false;
  $("shareBtn").addEventListener("click", function () {
    var payload = store.exportJSON(db);
    var file = new File([JSON.stringify(payload, null, 2)], "clean-pocket-" + stamp() + ".json", { type: "application/json" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) navigator.share({ files: [file], title: "Clean Pocket" }).catch(function () {});
  });
}

var pendingCsvRows = null;
$("impFile").addEventListener("change", function () {
  var input = this;
  var f = input.files && input.files[0];
  if (!f) return;
  var r = new FileReader();
  r.onload = function () {
    var text = r.result;
    if (/\.json$/i.test(f.name)) {
      try {
        var obj = JSON.parse(text);
        var added = store.importJSON(db, obj);
        persist(); renderFixed(); render();
        $("dataStatus").textContent = I.t("csv.imported", { n: added.entries });
      } catch (e) { $("dataStatus").textContent = I.t("csv.badFile"); }
    } else {
      var res = parseCSV(text, C.activeEntries(db));
      pendingCsvRows = res.rows;
      openCsvPreview(res);
    }
    input.value = "";
  };
  r.readAsText(f);
});

function openCsvPreview(res) {
  $("csvTitle").textContent = I.t("csv.previewTitle");
  $("csvFound").textContent = I.t("csv.found", { n: res.total });
  $("csvSkipped").textContent = I.t("csv.skipped", { n: res.skipped });
  var tbody = $("csvPreviewBody"); tbody.innerHTML = "";
  res.preview.forEach(function (row) {
    var tr = document.createElement("tr");
    tr.innerHTML = "<td>" + row.date + "</td><td class='r'>" + I.fmtEUR(row.income) + "</td><td class='r'>" + I.fmtEUR(row.tips) + "</td>";
    tbody.appendChild(tr);
  });
  $("csvBackdrop").hidden = false; $("csvSheet").hidden = false;
}
function closeCsvPreview() { $("csvBackdrop").hidden = true; $("csvSheet").hidden = true; pendingCsvRows = null; }
$("csvBackdrop").addEventListener("click", closeCsvPreview);
$("csvCancel").addEventListener("click", closeCsvPreview);
$("csvConfirm").addEventListener("click", function () {
  if (pendingCsvRows) {
    pendingCsvRows.forEach(function (row) {
      db.entries.push({ id: uuid(), date: row.date, income: row.income, tips: row.tips, hours: row.hours, exp: row.exp, updatedAt: nowISO() });
    });
    persist();
    $("dataStatus").textContent = I.t("csv.imported", { n: pendingCsvRows.length });
  }
  closeCsvPreview();
  render();
});

// ---- toast (small transient confirmations) ----
var toastTimer = null;
function showToast(text) {
  var el = $("toast");
  el.textContent = text;
  el.hidden = false;
  el.classList.add("show");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(function () { el.classList.remove("show"); setTimeout(function () { el.hidden = true; }, 250); }, 2200);
}

// ---- share the app itself (not a data backup) ----
$("shareAppBtn").addEventListener("click", function () {
  var payload = { title: I.t("app.name"), text: I.t("share.text"), url: location.href };
  if (navigator.share) {
    navigator.share(payload).catch(function () { /* user cancelled, ignore */ });
    return;
  }
  var fallback = function () { showToast(I.t("share.copied")); };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(payload.url).then(fallback).catch(fallback);
  } else fallback();
});

// ---- sample data ("Δοκίμασε με δείγμα") ----
// Loads ~3 weeks of realistic demo shifts flagged sample:true so a brand-new user can see the
// whole app working. Sample entries are excluded from exports and from the counts that summarize
// what the user has really entered (see js/calc.js realEntries and js/store.js exportJSON).
function hasSampleData() { return C.activeEntries(db).some(function (e) { return e.sample; }); }
function genSampleData() {
  var pattern = [
    [58, 7, 6, 8], [0, 0, 0, 0], [64, 9, 6.5, 9], [51, 5, 5, 7], [70, 12, 7, 10],
    [45, 4, 4.5, 6], [0, 0, 0, 0], [60, 8, 6, 8.5], [55, 6, 5.5, 7], [0, 0, 0, 0],
    [72, 11, 7, 10], [49, 5, 5, 7], [66, 10, 6.5, 9], [58, 7, 6, 8], [0, 0, 0, 0],
    [62, 9, 6, 8.5], [53, 6, 5, 7], [75, 13, 7.5, 11], [47, 4, 4.5, 6], [0, 0, 0, 0],
    [65, 9, 6.5, 9]
  ];
  var d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - pattern.length);
  pattern.forEach(function (row) {
    d.setDate(d.getDate() + 1);
    var iso = C.todayISO(d);
    if (row[0] <= 0) { db.off = db.off || {}; db.off[iso] = true; return; }
    db.entries.push({
      id: uuid(), date: iso, income: row[0], tips: row[1], hours: row[2], exp: row[3],
      updatedAt: nowISO(), sample: true
    });
  });
  persist();
}
function removeSampleData() {
  db.entries = db.entries.filter(function (e) { return !e.sample; });
  persist();
  showToast(I.t("sample.removed"));
  render();
}
function loadSampleData() {
  genSampleData();
  render();
}
function renderSampleBanner() {
  var on = hasSampleData();
  $("sampleBar").hidden = !on;
  $("sampleBarText").textContent = I.t("sample.banner");
}
$("heroSampleBtn").addEventListener("click", loadSampleData);
$("sampleRemoveBtn").addEventListener("click", removeSampleData);

$("deleteConfirm").addEventListener("input", function () {
  $("deleteAllBtn").disabled = this.value.trim().toUpperCase() !== I.t("more.deleteConfirmWord");
});
$("deleteAllBtn").addEventListener("click", function () {
  var settings = db.settings;
  db = store.load.call(store); // reset
  db.entries = []; db.fixed = []; db.extra = {}; db.off = {}; db.goals = {}; db.goalLocks = {};
  db.debts = []; db.savingsGoals = []; db.obligationsPaid = {}; db.lastBackup = "";
  db.settings = settings;
  persist();
  $("deleteConfirm").value = ""; $("deleteAllBtn").disabled = true;
  render();
});

// ---- settings ----
document.querySelectorAll("#themePick button").forEach(function (b) {
  b.addEventListener("click", function () { setTheme(b.dataset.theme); });
});
document.querySelectorAll(".langseg .segbtn").forEach(function (b) {
  b.addEventListener("click", function () { setLang(b.dataset.lang); });
});

var CITIES = [
  { key: "athens", nameEl: "Αθήνα", nameEn: "Athens", lat: 37.98, lon: 23.73 },
  { key: "thessaloniki", nameEl: "Θεσσαλονίκη", nameEn: "Thessaloniki", lat: 40.64, lon: 22.94 },
  { key: "patras", nameEl: "Πάτρα", nameEn: "Patras", lat: 38.25, lon: 21.73 },
  { key: "heraklion", nameEl: "Ηράκλειο", nameEn: "Heraklion", lat: 35.34, lon: 25.13 },
  { key: "larissa", nameEl: "Λάρισα", nameEn: "Larissa", lat: 39.64, lon: 22.42 },
  { key: "volos", nameEl: "Βόλος", nameEn: "Volos", lat: 39.36, lon: 22.94 },
  { key: "ioannina", nameEl: "Ιωάννινα", nameEn: "Ioannina", lat: 39.66, lon: 20.85 }
];
function fillCitySelect() {
  var sel = $("weatherCity"); sel.innerHTML = "";
  CITIES.forEach(function (c) {
    var opt = document.createElement("option"); opt.value = c.key;
    opt.textContent = I.getLang() === "en" ? c.nameEn : c.nameEl;
    sel.appendChild(opt);
  });
}
function renderWeatherSettings() {
  fillCitySelect();
  var w = db.settings.weather || { mode: "off" };
  $("weatherMode").value = w.mode || "off";
  $("weatherCityWrap").hidden = w.mode !== "city";
  if (w.city) $("weatherCity").value = w.city;
}
$("weatherMode").addEventListener("change", function () {
  db.settings.weather = db.settings.weather || {};
  db.settings.weather.mode = this.value;
  if (this.value === "geo" && navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function (pos) {
      db.settings.weather.lat = Math.round(pos.coords.latitude * 100) / 100;
      db.settings.weather.lon = Math.round(pos.coords.longitude * 100) / 100;
      persist(); wxLive();
    }, function () { /* ignore */ });
  }
  persist(); renderWeatherSettings(); wxLive();
});
$("weatherCity").addEventListener("change", function () {
  db.settings.weather = db.settings.weather || {};
  db.settings.weather.city = this.value;
  persist(); wxLive();
});

function wmoIcon(code) {
  if (code === 0) return "☀️";
  if (code <= 2) return "🌤️";
  if (code === 3) return "☁️";
  if (code === 45 || code === 48) return "🌫️";
  if (code >= 51 && code <= 67) return "🌧️";
  if (code >= 71 && code <= 77) return "❄️";
  if (code >= 80 && code <= 82) return "🌦️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}
function wxLive() {
  var w = db.settings.weather || { mode: "off" };
  var box = $("wxDisplay");
  if (!w.mode || w.mode === "off") { box.hidden = true; return; }
  var lat, lon;
  if (w.mode === "geo" && w.lat != null) { lat = w.lat; lon = w.lon; }
  else {
    var c = CITIES.find(function (x) { return x.key === w.city; }) || CITIES[1];
    lat = c.lat; lon = c.lon;
  }
  fetch("https://api.open-meteo.com/v1/forecast?latitude=" + lat + "&longitude=" + lon + "&current_weather=true")
    .then(function (r) { return r.json(); })
    .then(function (j) {
      if (!j || !j.current_weather) return;
      box.hidden = false;
      $("wxIcon").textContent = wmoIcon(j.current_weather.weathercode);
      $("wxTemp").textContent = Math.round(j.current_weather.temperature) + "°";
      $("wxLabel").textContent = "";
    })
    .catch(function () { box.hidden = true; });
}

$("reonboardBtn").addEventListener("click", function () { openOnboarding(true); });

// ---------------------------------------------------------------------------------------
// onboarding
// ---------------------------------------------------------------------------------------
// Step 0 is the language choice, steps 1-5 are the original profile questions (shifted by
// one), step 6 asks the employment type (freelancer only, or salaried + freelancer), and
// step 7 is a summary card that repeats every choice with a per-row "Αλλαγή" link.
var onbStep = 0;
var ONB_STEPS = 8;
function openOnboarding(reopen) {
  onbStep = 0;
  $("onbBackdrop").hidden = false;
  renderOnbStep();
}
function closeOnboarding() {
  db.settings.onboarded = true; persist();
  $("onbBackdrop").hidden = true;
  applyTheme(db.settings.theme); render();
  openTourPrompt();
}
function renderOnbSteps() {
  var wrap = $("onbSteps"); wrap.innerHTML = "";
  for (var i = 0; i < ONB_STEPS; i++) {
    var s = document.createElement("span");
    if (i < onbStep) s.className = "done"; else if (i === onbStep) s.className = "active";
    wrap.appendChild(s);
  }
}
function opt(id, key, groupField, value) {
  var b = document.createElement("button");
  b.type = "button"; b.className = "onb-opt";
  b.textContent = I.t(key);
  b.setAttribute("aria-pressed", db.settings[groupField] === value ? "true" : "false");
  b.addEventListener("click", function () {
    db.settings[groupField] = value;
    renderOnbStep();
  });
  return b;
}
function langOpt(key, value) {
  var b = document.createElement("button");
  b.type = "button"; b.className = "onb-opt lang-opt";
  b.textContent = I.t(key);
  b.setAttribute("aria-pressed", db.settings.lang === value ? "true" : "false");
  b.addEventListener("click", function () {
    db.settings.lang = value; I.setLang(value); persist();
    document.querySelectorAll(".langseg .segbtn").forEach(function (bb) {
      bb.setAttribute("aria-pressed", bb.dataset.lang === value ? "true" : "false");
    });
    applyStaticLabels();
    renderOnbStep();
  });
  return b;
}
function onbSummaryRow(body, labelKey, value, step) {
  var row = document.createElement("div"); row.className = "onb-summary-row";
  var l = document.createElement("div");
  var lbl = document.createElement("div"); lbl.className = "lbl"; lbl.textContent = I.t(labelKey);
  var val = document.createElement("div"); val.className = "val"; val.textContent = value;
  l.appendChild(lbl); l.appendChild(val);
  var chg = document.createElement("button"); chg.type = "button"; chg.className = "chg"; chg.textContent = I.t("onb.change");
  chg.addEventListener("click", function () { onbStep = step; renderOnbStep(); });
  row.appendChild(l); row.appendChild(chg);
  body.appendChild(row);
}
function renderOnbStep() {
  renderOnbSteps();
  var body = $("onbBody"); body.innerHTML = "";
  $("onbBack").hidden = onbStep === 0;
  $("onbNext").textContent = I.t(onbStep === ONB_STEPS - 1 ? "onb.finish" : "onb.next");
  if (onbStep === 0) {
    $("onbTitle").textContent = I.t("onb.step0.title");
    body.appendChild(langOpt("onb.langEl", "el"));
    body.appendChild(langOpt("onb.langEn", "en"));
  } else if (onbStep === 1) {
    $("onbTitle").textContent = I.t("onb.step1.title");
    body.appendChild(opt("a", "onb.step1.normal", "vatRegime", "normal"));
    body.appendChild(opt("b", "onb.step1.exempt", "vatRegime", "exempt"));
    body.appendChild(opt("c", "onb.step1.unknown", "vatRegime", "unknown"));
    var note = document.createElement("p"); note.className = "onb-note"; note.textContent = I.t("onb.step1.unknownNote");
    body.appendChild(note);
    var lbl = document.createElement("label"); lbl.textContent = I.t("onb.step1.withVat"); body.appendChild(lbl);
    body.appendChild(opt("d", "onb.step1.withVatNo", "platformIncludesVat", false));
    body.appendChild(opt("e", "onb.step1.withVatYes", "platformIncludesVat", true));
    var vatNote = document.createElement("p"); vatNote.className = "onb-note"; vatNote.textContent = I.t("onb.step1.withVatNote");
    body.appendChild(vatNote);
  } else if (onbStep === 2) {
    $("onbTitle").textContent = I.t("onb.step2.title");
    var f1 = document.createElement("div"); f1.className = "field";
    f1.innerHTML = "<label></label><input type='text' inputmode='numeric' id='onbAge'>";
    f1.querySelector("label").textContent = I.t("onb.step2.age");
    f1.querySelector("input").value = db.settings.age || "";
    f1.querySelector("input").addEventListener("input", function () { db.settings.age = +this.value || null; });
    body.appendChild(f1);
    var f2 = document.createElement("div"); f2.className = "field";
    f2.innerHTML = "<label></label><input type='text' inputmode='numeric' id='onbKids'>";
    f2.querySelector("label").textContent = I.t("onb.step2.children");
    f2.querySelector("input").value = db.settings.children || 0;
    f2.querySelector("input").addEventListener("input", function () { db.settings.children = Math.max(0, +this.value || 0); });
    body.appendChild(f2);
  } else if (onbStep === 3) {
    $("onbTitle").textContent = I.t("onb.step3.title");
    body.appendChild(opt("a", "onb.step3.a", "yearsActive", "1-3"));
    body.appendChild(opt("b", "onb.step3.b", "yearsActive", "4+"));
    if (db.settings.yearsActive === "4+") {
      var f = document.createElement("div"); f.className = "field";
      f.innerHTML = "<label></label><input type='text' inputmode='decimal' id='onbPresumed'>";
      f.querySelector("label").textContent = I.t("onb.step3.presumed");
      f.querySelector("input").value = db.settings.presumedIncome || "";
      f.querySelector("input").addEventListener("input", function () { db.settings.presumedIncome = C.n0(this.value); });
      body.appendChild(f);
      var note = document.createElement("p"); note.className = "onb-note"; note.textContent = I.t("onb.step3.presumedNote");
      body.appendChild(note);
    }
  } else if (onbStep === 4) {
    $("onbTitle").textContent = I.t("onb.step4.title");
    body.appendChild(opt("a", "onb.step4.special", "efkaCategory", "special"));
    body.appendChild(opt("b", "onb.step4.first", "efkaCategory", "first"));
    body.appendChild(opt("c", "onb.step4.other", "efkaCategory", "other"));
    if (db.settings.efkaCategory === "other") {
      var f = document.createElement("div"); f.className = "field";
      f.innerHTML = "<label></label><input type='text' inputmode='decimal' id='onbEfkaCustom'>";
      f.querySelector("label").textContent = I.t("obl.debtAmount");
      f.querySelector("input").value = db.settings.efkaCustomAmount || "";
      f.querySelector("input").addEventListener("input", function () { db.settings.efkaCustomAmount = C.n0(this.value); });
      body.appendChild(f);
    }
  } else if (onbStep === 5) {
    $("onbTitle").textContent = I.t("onb.step5.title");
    var f = document.createElement("div"); f.className = "field";
    f.innerHTML = "<label></label><input type='text' inputmode='numeric' id='onbDays'>";
    f.querySelector("label").textContent = I.t("onb.step5.title");
    f.querySelector("input").value = db.settings.daysPerWeek || 5;
    f.querySelector("input").addEventListener("input", function () { db.settings.daysPerWeek = Math.max(1, Math.min(7, +this.value || 5)); });
    body.appendChild(f);
  } else if (onbStep === 6) {
    $("onbTitle").textContent = I.t("onb.step6.title");
    body.appendChild(opt("a", "onb.step6.freelancer", "employmentType", "freelancer"));
    body.appendChild(opt("b", "onb.step6.salariedFreelancer", "employmentType", "salariedFreelancer"));
  } else if (onbStep === 7) {
    $("onbTitle").textContent = I.t("onb.summary.title");
    onbSummaryRow(body, "more.language", db.settings.lang === "en" ? I.t("onb.langEn") : I.t("onb.langEl"), 0);
    onbSummaryRow(body, "onb.step1.title", I.t("onb.step1." + (db.settings.vatRegime || "unknown")), 1);
    onbSummaryRow(body, "onb.step2.title", db.settings.age ? I.t("onb.summary.age", { a: db.settings.age, c: db.settings.children || 0 }) : I.t("onb.summary.ageUnset", { c: db.settings.children || 0 }), 2);
    onbSummaryRow(body, "onb.step3.title", I.t(db.settings.yearsActive === "4+" ? "onb.step3.b" : "onb.step3.a"), 3);
    onbSummaryRow(body, "onb.step4.title", I.t("onb.step4." + (db.settings.efkaCategory || "special")), 4);
    onbSummaryRow(body, "onb.step5.title", I.t("onb.summary.days", { d: db.settings.daysPerWeek || 5 }), 5);
    onbSummaryRow(body, "onb.step6.title", I.t("onb.step6." + (db.settings.employmentType || "freelancer")), 6);
  }
}
$("onbNext").addEventListener("click", function () {
  if (onbStep < ONB_STEPS - 1) { onbStep++; renderOnbStep(); } else { persist(); closeOnboarding(); }
});
$("onbBack").addEventListener("click", function () { if (onbStep > 0) { onbStep--; renderOnbStep(); } });
$("onbSkip").addEventListener("click", function () {
  // "Skip" applies whatever defaults are already set and jumps straight to the summary, on
  // any step, rather than abandoning onboarding outright.
  onbStep = ONB_STEPS - 1;
  renderOnbStep();
});

// ---------------------------------------------------------------------------------------
// tour prompt (shown once onboarding's summary step finishes) + guided coach-mark tour
// ---------------------------------------------------------------------------------------
function openTourPrompt() {
  $("tourPromptTitle").textContent = I.t("onb.tourAsk");
  $("tourPromptBackdrop").hidden = false;
}
function closeTourPrompt() { $("tourPromptBackdrop").hidden = true; }
$("tourPromptYes").addEventListener("click", function () { closeTourPrompt(); startTour(); });
$("tourPromptNo").addEventListener("click", function () { closeTourPrompt(); });
$("tourPromptSampleBtn").addEventListener("click", function () { loadSampleData(); closeTourPrompt(); startTour(); });
$("tourBtn").addEventListener("click", function () { startTour(); });

var TOUR_STEPS = [
  { view: "home", selector: "#periodSeg", titleKey: "tour.step1.title", descKey: "tour.step1.desc" },
  { view: "home", selector: ".hero", titleKey: "tour.step2.title", descKey: "tour.step2.desc" },
  { view: "home", selector: "#navAddBtn", titleKey: "tour.step3.title", descKey: "tour.step3.desc" },
  { view: "calendar", selector: "#calGrid", titleKey: "tour.step4.title", descKey: "tour.step4.desc" },
  { view: "obligations", selector: "#oblList", titleKey: "tour.step5.title", descKey: "tour.step5.desc" },
  { view: "more", selector: "#h-mydata", titleKey: "tour.step6.title", descKey: "tour.step6.desc" }
];
var tourIdx = 0;
function startTour() {
  tourIdx = 0;
  $("tourBackdrop").hidden = false;
  document.addEventListener("keydown", tourKeydown);
  tourGoTo(0);
}
function tourReposition() { if (!$("tourBackdrop").hidden) tourRenderStep(); }
window.addEventListener("resize", tourReposition);
document.addEventListener("scroll", tourReposition, true);
function closeTour() {
  $("tourBackdrop").hidden = true;
  document.removeEventListener("keydown", tourKeydown);
}
function tourKeydown(e) {
  if (e.key === "Escape") { closeTour(); }
  else if (e.key === "ArrowRight") { tourAdvance(1); }
  else if (e.key === "ArrowLeft") { tourAdvance(-1); }
}
function tourAdvance(dir) {
  var next = tourIdx + dir;
  if (next < 0) return;
  if (next >= TOUR_STEPS.length) { closeTour(); return; }
  tourGoTo(next);
}
function tourGoTo(i) {
  tourIdx = i;
  var step = TOUR_STEPS[i];
  if (step.view !== currentNav) switchView(step.view);
  var container = document.querySelector(step.selector) && document.querySelector(step.selector).closest("details");
  if (container && !container.open) container.open = true;
  // give the browser one frame to switch view / open <details> before measuring layout
  requestAnimationFrame(function () {
    var target = document.querySelector(step.selector);
    if (target && target.scrollIntoView) target.scrollIntoView({ block: "center", behavior: reduced ? "auto" : "smooth" });
    requestAnimationFrame(tourRenderStep);
  });
}
function tourRenderStep() {
  var step = TOUR_STEPS[tourIdx];
  var target = document.querySelector(step.selector);
  var rect = target ? target.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
  var pad = 8;
  // clamp tall targets (e.g. a long list) to the viewport so the card always has room
  var top = Math.max(0, rect.top - pad), bottom = Math.min(window.innerHeight, rect.top + rect.height + pad);
  rect = { left: rect.left, top: top, width: rect.width, height: Math.max(0, bottom - top) };
  var spot = $("tourSpot");
  spot.style.left = Math.max(0, rect.left - pad) + "px";
  spot.style.top = rect.top + "px";
  spot.style.width = (rect.width + pad * 2) + "px";
  spot.style.height = rect.height + "px";

  $("tourCounter").textContent = I.t("tour.step", { i: tourIdx + 1, n: TOUR_STEPS.length });
  $("tourTitle").textContent = I.t(step.titleKey);
  $("tourDesc").textContent = I.t(step.descKey);
  $("tourSkip").textContent = I.t("tour.skip");
  $("tourBack").textContent = I.t("tour.back");
  $("tourBack").hidden = tourIdx === 0;
  $("tourNext").textContent = I.t(tourIdx === TOUR_STEPS.length - 1 ? "tour.finish" : "tour.next");

  var card = $("tourCard");
  var spaceBelow = window.innerHeight - (rect.top + rect.height + pad);
  if (spaceBelow > 180 || rect.top < 160) {
    card.style.top = Math.min(window.innerHeight - 20, rect.top + rect.height + pad + 14) + "px";
    card.style.bottom = "auto";
  } else {
    card.style.bottom = Math.max(8, window.innerHeight - rect.top + pad + 14) + "px";
    card.style.top = "auto";
  }
  card.focus();
}
$("tourNext").addEventListener("click", function () {
  if (tourIdx === TOUR_STEPS.length - 1) closeTour(); else tourAdvance(1);
});
$("tourBack").addEventListener("click", function () { tourAdvance(-1); });
$("tourSkip").addEventListener("click", closeTour);

// ---------------------------------------------------------------------------------------
// install / update / backup banners
// ---------------------------------------------------------------------------------------
var deferredPrompt = null;
window.addEventListener("beforeinstallprompt", function (e) {
  e.preventDefault(); deferredPrompt = e;
  var snoozeUntil = +(localStorage.getItem("cp_install_snooze") || 0);
  if (Date.now() > snoozeUntil) { $("installText").textContent = I.t("install.text"); $("installBar").hidden = false; }
});
$("installBtn").addEventListener("click", function () {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; }
  $("installBar").hidden = true;
});
$("installLater").addEventListener("click", function () {
  localStorage.setItem("cp_install_snooze", String(Date.now() + 30 * 86400000));
  $("installBar").hidden = true;
});

// iOS Safari never fires beforeinstallprompt: show the manual "Share > Add to Home Screen"
// instructions instead, once, unless already installed (standalone) or snoozed.
(function iosInstallHint() {
  var isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  var standalone = window.navigator.standalone === true || window.matchMedia("(display-mode: standalone)").matches;
  if (!isIOS || standalone) return;
  var snoozeUntil = +(localStorage.getItem("cp_install_snooze") || 0);
  if (Date.now() < snoozeUntil) return;
  $("installText").textContent = I.t("install.iosHint");
  $("installBtn").hidden = true;
  $("installBar").hidden = false;
})();

function renderBanners() {
  var lastBackup = db.lastBackup;
  var hasData = C.realEntries(db).length > 0;
  if (!hasData) { $("backupBar").hidden = true; $("lastBackupNote").textContent = I.t("more.dataEmpty"); return; }
  // never backed up: remind from the first shift; after a backup, remind again every 7 days
  var ents = C.realEntries(db);
  var firstDate = ents.reduce(function (a, e) { return e.date < a ? e.date : a; }, today());
  var stale = lastBackup ? (Date.now() - new Date(lastBackup).getTime()) > 7 * 86400000 : true;
  $("lastBackupNote").textContent = I.t("more.dataSummary", { n: ents.length, first: I.fmtDateShort(firstDate), last: lastBackup ? I.fmtDateShort(lastBackup) : I.t("more.never") });
  var snoozeUntil = +(localStorage.getItem("cp_backup_snooze") || 0);
  $("backupBar").hidden = !stale || Date.now() < snoozeUntil;
  $("backupText").textContent = I.t("backup.reminder");
  $("backupNowBtn").textContent = I.t("backup.now");
  $("backupLaterBtn").textContent = I.t("backup.later");
}
$("backupNowBtn").addEventListener("click", function () { $("expJson").click(); });
$("backupLaterBtn").addEventListener("click", function () {
  localStorage.setItem("cp_backup_snooze", String(Date.now() + 7 * 86400000));
  $("backupBar").hidden = true;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker.register("sw.js").then(function (reg) {
      reg.addEventListener("updatefound", function () {
        var nw = reg.installing;
        if (!nw) return;
        nw.addEventListener("statechange", function () {
          if (nw.state === "installed" && navigator.serviceWorker.controller) {
            $("updateBtn").textContent = I.t("sw.update");
            $("updateBar").hidden = false;
            $("updateBtn").onclick = function () {
              // reload only once the new worker controls the page, otherwise the old shell is served again
              navigator.serviceWorker.addEventListener("controllerchange", function () { window.location.reload(); }, { once: true });
              nw.postMessage("skipWaiting");
            };
          }
        });
      });
    }).catch(function () { /* offline-first still works without SW */ });
  });
}

// ---------------------------------------------------------------------------------------
// master render + boot
// ---------------------------------------------------------------------------------------
function render() {
  renderHome();
  renderCalendar();
  renderObligations();
  renderFixed();
  renderHistory();
  renderPie();
  renderBanners();
  renderSampleBanner();
  var streakEl = $("streak");
  var days = {};
  C.activeEntries(db).forEach(function (e) { days[e.date] = true; });
  var d = new Date();
  if (!days[C.todayISO(d)]) d.setDate(d.getDate() - 1);
  var count = 0;
  while (days[C.todayISO(d)]) { count++; d.setDate(d.getDate() - 1); }
  if (count >= 2) { streakEl.hidden = false; streakEl.textContent = "🔥 " + count; } else streakEl.hidden = true;
}

function boot() {
  if (!db.settings.onboarded) {
    var navLang = (navigator.language || "en").toLowerCase();
    db.settings.lang = navLang.indexOf("el") === 0 ? "el" : "en";
  }
  I.setLang(db.settings.lang || "el");
  document.querySelectorAll(".langseg .segbtn").forEach(function (b) { b.setAttribute("aria-pressed", b.dataset.lang === I.getLang() ? "true" : "false"); });
  applyTheme(db.settings.theme || "forest");
  applyStaticLabels();
  $("aboutSource").textContent = RULES.source + " (" + RULES.year + ")";
  syncSegButtons();
  $("fDate").value = today();
  $("debtDue").value = today();
  renderWeatherSettings();
  render();
  if (!db.settings.onboarded) openOnboarding();
  else wxLive();
  // the boot-reveal stagger is a once-only page-load effect (see css/app.css): drop the class
  // once it has had time to play, so later nav switches never restart it.
  setTimeout(function () { document.body.classList.remove("boot-reveal"); }, 900);
}
boot();
