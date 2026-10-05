// Clean Pocket: pure calculation engine. No DOM, no storage - takes (db, todayISO)
// and returns numbers. Safe to run in the browser, in tests, or on a server.
import {
  incomeTax, annualEstimate, vatSplit, efkaDue, vatMonthDue,
  taxInstallmentDates, efkaForEmployment, RULES
} from "./tax.js";

export function pad(v) { return String(v).padStart(2, "0"); }

export function todayISO(d) {
  d = d || new Date();
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}

export function numParse(v) {
  return parseFloat(String(v == null ? "" : v).trim().replace(",", "."));
}
export function n(v) { var x = numParse(v); return isFinite(x) && x > 0 ? x : 0; }
export function n0(v) { var x = numParse(v); return isFinite(x) ? x : 0; }

export function halfKeyOf(dateISO) {
  var p = dateISO.split("-");
  return p[0] + "-" + p[1] + "-" + (+p[2] <= 14 ? "1" : "2");
}

export function activeEntries(db) { return (db.entries || []).filter(function (e) { return e && !e.deleted; }); }
// Real (non-sample) entries: excludes the demo shifts the tour's "try with sample data" loads.
// Used for exports and any count meant to reflect what the user actually entered.
export function realEntries(db) { return activeEntries(db).filter(function (e) { return !e.sample; }); }
export function activeFixed(db) { return (db.fixed || []).filter(function (f) { return f && !f.deleted; }); }
export function activeDebts(db) { return (db.debts || []).filter(function (d) { return d && !d.deleted; }); }
export function activeSavingsGoals(db) { return (db.savingsGoals || []).filter(function (g) { return g && !g.deleted; }); }

// ---- profile / settings helpers ----

export function efkaMonthly(settings) {
  var s = settings || {};
  var amount;
  if (s.efkaCategory === "first") amount = RULES.efka.first;
  else if (s.efkaCategory === "special") amount = RULES.efka.special;
  else amount = n(s.efkaCustomAmount);
  return efkaForEmployment(amount, s.employmentType);
}

// Maps the onboarding "1-3" / "4+" answer to a numeric years-active value tax.js understands.
export function taxProfile(settings) {
  var s = settings || {};
  var yearsActiveNum = s.yearsActive === "4+" ? RULES.newProYears + 1 : Math.max(1, Math.min(3, +s.yearsActiveExact || 2));
  return {
    age: +s.age || 0,
    children: Math.max(0, Math.floor(+s.children || 0)),
    yearsActive: yearsActiveNum,
    presumedIncome: s.yearsActive === "4+" ? n(s.presumedIncome) : 0
  };
}

export function vatConfig(db) {
  var s = (db && db.settings) || {};
  var vs = s.vat || {};
  // "unknown" (and skipped onboarding) count as normal regime: under-reserving is the worse failure
  var on = s.vatRegime !== "exempt";
  return {
    on: on,
    rate: on ? (isFinite(+vs.rate) ? +vs.rate : RULES.vatRate) : 0,
    inclusive: !!s.platformIncludesVat,
    expShare: isFinite(+vs.expShare) ? Math.max(0, Math.min(100, +vs.expShare)) : 0
  };
}

export function entryAdj(e, vat) {
  return vatSplit(
    { income: e.income, tips: e.tips, exp: e.exp, hours: e.hours },
    { on: vat.on, rate: vat.rate, inclusive: vat.inclusive, expShare: vat.expShare }
  );
}

export function fixedGrossMonthly(db) {
  var s = 0;
  activeFixed(db).forEach(function (f) { s += n(f.amount); });
  return s;
}
export function fixedVatInMonthly(db) {
  var vat = vatConfig(db);
  if (!vat.on || vat.rate <= 0) return 0;
  var rate = vat.rate / 100, s = 0;
  activeFixed(db).forEach(function (f) { if (f.vatDeductible) s += n(f.amount) * rate / (1 + rate); });
  return s;
}
export function fixedMonthly(db) { return fixedGrossMonthly(db) - fixedVatInMonthly(db); }

// ---- period totals ----

export function periodTotalsHalf(db, key) {
  var vat = vatConfig(db);
  var t = { income: 0, tips: 0, exp: 0, extra: 0, hours: 0, shifts: 0, vatOut: 0, vatInShift: 0, vatInFixed: 0, fixed: 0 };
  activeEntries(db).forEach(function (e) {
    if (halfKeyOf(e.date) !== key) return;
    var a = entryAdj(e, vat);
    t.income += a.income; t.tips += a.tips; t.exp += a.exp; t.hours += a.hours; t.shifts += 1;
    t.vatOut += a.vatOut; t.vatInShift += a.vatIn;
  });
  t.extra = n((db.extra || {})[key]);
  t.exp += t.extra;
  t.fixed = fixedMonthly(db) / 2;
  t.vatInFixed = fixedVatInMonthly(db) / 2;
  return t;
}

export function periodTotals(db, key) {
  var p = key.split("-");
  if (p[2] !== "0") return periodTotalsHalf(db, key);
  var a = periodTotalsHalf(db, p[0] + "-" + p[1] + "-1");
  var b = periodTotalsHalf(db, p[0] + "-" + p[1] + "-2");
  return {
    income: a.income + b.income, tips: a.tips + b.tips, exp: a.exp + b.exp, extra: a.extra + b.extra,
    hours: a.hours + b.hours, shifts: a.shifts + b.shifts, fixed: a.fixed + b.fixed,
    vatOut: a.vatOut + b.vatOut, vatInShift: a.vatInShift + b.vatInShift, vatInFixed: a.vatInFixed + b.vatInFixed
  };
}

export function yearTotals(db, year) {
  var vat = vatConfig(db);
  var t = { income: 0, tips: 0, exp: 0, extra: 0, hours: 0, shifts: 0, fixed: 0, months: 0, vatOut: 0, vatInShift: 0, vatInFixed: 0 };
  var first = 13, last = 0;
  activeEntries(db).forEach(function (e) {
    if (e.date.slice(0, 4) !== year) return;
    var a = entryAdj(e, vat);
    t.income += a.income; t.tips += a.tips; t.exp += a.exp; t.hours += a.hours; t.shifts += 1;
    t.vatOut += a.vatOut; t.vatInShift += a.vatIn;
    var m = +e.date.slice(5, 7);
    if (m < first) first = m;
    if (m > last) last = m;
  });
  if (t.shifts > 0) {
    var now = new Date();
    if (String(now.getFullYear()) === year) last = Math.max(last, now.getMonth() + 1);
    t.months = last - first + 1;
    t.fixed = fixedMonthly(db) * t.months;
    t.vatInFixed = fixedVatInMonthly(db) * t.months;
  }
  Object.keys(db.extra || {}).forEach(function (k) {
    if (k.slice(0, 4) === year) { var v = n(db.extra[k]); t.exp += v; t.extra += v; }
  });
  return t;
}

// ---- annual profit projection ----

// Tax installments are only shown once there is enough history to project a whole year:
// shifts in at least 6 half-months that are already over (about three months of work),
// or an annual income the user entered by hand.
var TAX_ESTIMATE_MIN_HALVES = 6;

// Half-months that have at least one shift and are already over (the current one is still filling up).
export function completedHalves(db, today) {
  var todayKey = halfKeyOf(today), keys = {};
  activeEntries(db).forEach(function (e) { keys[halfKeyOf(e.date)] = true; });
  return Object.keys(keys).filter(function (k) { return k !== todayKey; }).length;
}

export function taxEstimateReady(db, today) {
  return n(db.settings && db.settings.annualOverride) > 0 || completedHalves(db, today) >= TAX_ESTIMATE_MIN_HALVES;
}

export function projectedAnnual(db, today) {
  var manual = n(db.settings && db.settings.annualOverride);
  if (manual > 0) return manual;
  var todayKey = halfKeyOf(today);
  var keys = {};
  activeEntries(db).forEach(function (e) { keys[halfKeyOf(e.date)] = true; });
  var completed = Object.keys(keys).filter(function (k) { return k !== todayKey; });
  if (completed.length >= 2) {
    var sum = 0;
    completed.forEach(function (k) {
      var t = periodTotalsHalf(db, k);
      sum += Math.max(0, t.income + t.tips - t.exp - t.fixed);
    });
    return (sum / completed.length) * 24;
  }
  var entries = activeEntries(db);
  if (!entries.length) return 0;
  var vat = vatConfig(db);
  var totalProfit = 0;
  entries.forEach(function (e) {
    var a = entryAdj(e, vat);
    totalProfit += (a.income + a.tips - a.exp);
  });
  var avgPerShift = totalProfit / entries.length;
  var daysPerWeek = (db.settings && +db.settings.daysPerWeek) || 5;
  return Math.max(0, avgPerShift) * daysPerWeek * 48;
}

export function annualTaxEstimate(db, today) {
  var annual = projectedAnnual(db, today);
  var efkaMon = efkaMonthly(db.settings);
  return annualEstimate(annual, efkaMon, taxProfile(db.settings));
}

// ---- date helpers for proration ----

function parseYMD(iso) { var p = iso.split("-").map(Number); return new Date(p[0], p[1] - 1, p[2]); }
function daysInMonth(y, m) { return new Date(y, m, 0).getDate(); }
function dayDiff(a, b) { return Math.round((b - a) / 86400000); }

export function periodBounds(key) {
  var p = key.split("-");
  var y = +p[0], m = +p[1], h = p[2];
  if (h === "0") return { start: new Date(y, m - 1, 1), end: new Date(y, m - 1, daysInMonth(y, m)) };
  if (h === "1") return { start: new Date(y, m - 1, 1), end: new Date(y, m - 1, 14) };
  return { start: new Date(y, m - 1, 15), end: new Date(y, m - 1, daysInMonth(y, m)) };
}

// EFKA share for whatever the user is currently viewing (half-month, month or year).
// A period fully in the past gets the full monthly share; a period that has not started yet
// gets 0; the period containing `today` is prorated by days elapsed / days in the period, so
// the very first shift never shows a scary negative number.
export function efkaShareForKey(db, key, today) {
  var monthly = efkaMonthly(db.settings);
  var todayD = parseYMD(today);
  var bounds = periodBounds(key);
  var full = key.split("-")[2] === "0" ? monthly : monthly / 2;
  if (todayD < bounds.start) return 0;
  if (todayD > bounds.end) return full;
  var totalDays = dayDiff(bounds.start, bounds.end) + 1;
  var elapsedDays = Math.min(totalDays, dayDiff(bounds.start, todayD) + 1);
  return full * (elapsedDays / totalDays);
}

export function efkaShareForYear(db, year, today) {
  var t = yearTotals(db, year);
  return efkaMonthly(db.settings) * t.months;
}

// ---- obligations ----

function addMonthISO(iso) {
  var p = iso.split("-").map(Number);
  var y = p[0], m = p[1] + 1;
  if (m > 12) { m = 1; y++; }
  return y + "-" + pad(m) + "-" + iso.slice(8, 10);
}

export function obligationsList(db, today) {
  var out = [];
  var settings = db.settings || {};
  var monthlyEfka = efkaMonthly(settings);
  var entries = activeEntries(db);
  var paidMap = db.obligationsPaid || {};

  // No EFKA cards when nothing is owed (e.g. salaried + freelancer in the special category).
  if (entries.length && monthlyEfka > 0) {
    var firstDate = entries.reduce(function (a, e) { return e.date < a ? e.date : a; }, entries[0].date);
    var y = +firstDate.slice(0, 4), m = +firstDate.slice(5, 7);
    var todayY = +today.slice(0, 4), todayM = +today.slice(5, 7);
    while (y < todayY || (y === todayY && m <= todayM)) {
      var key = "efka-" + y + "-" + pad(m);
      out.push({
        key: key, type: "efka", label: "ΕΦΚΑ " + pad(m) + "/" + y,
        amount: monthlyEfka, due: efkaDue(y, m), paid: !!paidMap[key]
      });
      if (m === 12) { m = 1; y++; } else m++;
    }
  }

  if (vatConfig(db).on) {
    // One VAT obligation per month with shifts, reminded on the 1st of the next month.
    var vatMonths = {};
    entries.forEach(function (e) { vatMonths[e.date.slice(0, 7)] = true; });
    Object.keys(vatMonths).sort().forEach(function (ym) {
      var vy = +ym.slice(0, 4), vm = +ym.slice(5, 7);
      var mt = periodTotals(db, ym + "-0");
      var amount = mt.vatOut - mt.vatInShift - mt.vatInFixed;
      var key = "vat-" + ym;
      out.push({ key: key, type: "vat", label: "ΦΠΑ " + pad(vm) + "/" + vy, amount: amount, due: vatMonthDue(vy, vm), paid: !!paidMap[key] });
    });
  }

  var year = +today.slice(0, 4);
  var est = annualTaxEstimate(db, today);
  var perInstallment = (est.tax + est.prepay) / RULES.taxInstallments;
  if (perInstallment > 0.005 && taxEstimateReady(db, today)) taxInstallmentDates(year).forEach(function (d, i) {
    var key = "tax-" + year + "-" + i;
    out.push({ key: key, type: "tax", label: "Δόση φόρου " + (i + 1) + "/" + RULES.taxInstallments, amount: perInstallment, due: d, estimate: true, paid: !!paidMap[key] });
  });

  var horizon = addMonthISO(addMonthISO(addMonthISO(addMonthISO(addMonthISO(addMonthISO(addMonthISO(addMonthISO(addMonthISO(addMonthISO(addMonthISO(addMonthISO(today))))))))))));
  activeDebts(db).forEach(function (debt) {
    if (!debt.due) return;
    if (debt.repeat === "monthly") {
      var occ = debt.due, guard = 0;
      while (occ <= horizon && guard < 36) {
        var key = "debt-" + debt.id + "-" + occ;
        out.push({ key: key, type: "debt", label: debt.name, amount: n(debt.amount), due: occ, paid: !!paidMap[key] });
        occ = addMonthISO(occ);
        guard++;
      }
    } else {
      var key2 = "debt-" + debt.id;
      out.push({ key: key2, type: "debt", label: debt.name, amount: n(debt.amount), due: debt.due, paid: !!paidMap[key2] });
    }
  });

  out.sort(function (a, b) { return a.due < b.due ? -1 : (a.due > b.due ? 1 : 0); });
  return out;
}

// ---- set aside ("κράτα στην άκρη") ----

export function incomeTaxReserveYTD(db, today) {
  var year = today.slice(0, 4);
  var t = yearTotals(db, year);
  var profit = t.income + t.tips - t.exp - t.fixed;
  var est = annualTaxEstimate(db, today);
  return Math.max(0, profit) * est.effRate;
}

export function setAside(db, today) {
  var obligations = obligationsList(db, today);
  var todayYM = today.slice(0, 7);
  var efka = 0, vat = 0;
  obligations.forEach(function (o) {
    if (o.paid) return;
    if (o.type === "efka") {
      var ym = o.key.slice(5);
      if (ym <= todayYM) efka += o.amount;
    } else if (o.type === "vat") {
      if (o.key.slice(4) <= todayYM) vat += o.amount;
    }
  });
  var tax = incomeTaxReserveYTD(db, today);
  return { efka: efka, vat: vat, tax: tax, total: efka };
}

// ---- annual goal ----

export function annualGoalStats(db, today) {
  var year = today.slice(0, 4);
  var t = yearTotals(db, year);
  var efkaMon = efkaMonthly(db.settings);
  var profit = t.income + t.tips - t.exp - t.fixed;
  var est = annualTaxEstimate(db, today);
  var net = profit - efkaMon * t.months - Math.max(0, profit) * est.effRate;
  var vat = vatConfig(db);
  var mIncome = 0, mHours = 0;
  activeEntries(db).forEach(function (e) {
    if (e.date.slice(0, 4) === year && e.hours > 0) {
      var a = entryAdj(e, vat);
      mIncome += a.income + a.tips - a.exp;
      mHours += e.hours;
    }
  });
  return { year: year, net: net, hoursYTD: t.hours, margin: mHours > 0 ? mIncome / mHours : 0, efkaMonthly: efkaMon };
}

// Binary-searches the pre-tax profit X such that X - incomeTax(X) === goal, then adds back a
// year of EFKA and fixed costs and converts to hours using the shift margin.
export function hoursForGoal(db, goal, margin, efkaMon) {
  if (goal <= 0 || margin <= 0) return null;
  var lo = 0, hi = goal * 2 + 1000, profile = taxProfile(db.settings), i, mid;
  for (i = 0; i < 60; i++) {
    mid = (lo + hi) / 2;
    if (mid - incomeTax(mid, profile) < goal) lo = mid; else hi = mid;
  }
  var profit = hi + efkaMon * 12;
  var needMargin = profit + fixedMonthly(db) * 12;
  return needMargin / margin;
}

// ---- savings goals ----

export function savingsGoalPlan(goal, today) {
  var target = n(goal.target), saved = n0(goal.saved);
  var remaining = Math.max(0, target - saved);
  var due = goal.targetDate;
  if (!due) return { remaining: remaining, perWeek: null, weeksLeft: null };
  var weeksLeft = Math.max(1 / 7, dayDiff(parseYMD(today), parseYMD(due)) / 7);
  return { remaining: remaining, perWeek: remaining / weeksLeft, weeksLeft: weeksLeft };
}
