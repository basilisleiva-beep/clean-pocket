import test from "node:test";
import assert from "node:assert/strict";
import { emptyDB, importInto } from "../js/store.js";
import {
  projectedAnnual, efkaShareForKey, obligationsList, setAside, periodTotalsHalf,
  annualGoalStats, hoursForGoal, activeEntries, realEntries, efkaMonthly
} from "../js/calc.js";

const near = (a, b, eps) => assert.ok(Math.abs(a - b) < (eps || 0.5), a + " != " + b);

function dbWithEntries(entries, settings) {
  var db = emptyDB();
  db.entries = entries;
  if (settings) Object.assign(db.settings, settings);
  return db;
}

test("projection: fewer than 2 completed half-months falls back to per-shift average", () => {
  // Only one half-month with data (2026-09, first half). Fallback path must kick in.
  var db = dbWithEntries([
    { id: "1", date: "2026-09-02", income: 60, tips: 10, hours: 6, exp: 8 },
    { id: "2", date: "2026-09-03", income: 40, tips: 5, hours: 5, exp: 6 }
  ], { daysPerWeek: 5 });
  // avg profit per shift = ((60+10-8)+(40+5-6))/2 = (62+39)/2 = 50.5
  var annual = projectedAnnual(db, "2026-09-03");
  near(annual, 50.5 * 5 * 48, 1);
});

test("projection: 2+ completed half-months uses their average x24", () => {
  var db = dbWithEntries([
    { id: "1", date: "2026-07-05", income: 500, tips: 50, hours: 40, exp: 40 }, // 2026-07-1
    { id: "2", date: "2026-07-20", income: 400, tips: 40, hours: 35, exp: 30 }, // 2026-07-2
    { id: "3", date: "2026-09-10", income: 100, tips: 10, hours: 8, exp: 10 }   // today's half, excluded
  ]);
  var annual = projectedAnnual(db, "2026-09-10");
  // profits (fixed=0): 510, 410 -> avg 460 * 24 = 11040
  near(annual, 460 * 24, 1);
});

test("projection: manual override always wins", () => {
  var db = dbWithEntries([{ id: "1", date: "2026-09-02", income: 60, tips: 0, hours: 6, exp: 0 }], { annualOverride: 99999 });
  assert.equal(projectedAnnual(db, "2026-09-02"), 99999);
});

test("EFKA proration: current half-month is prorated by days elapsed, past periods get the full share", () => {
  var db = emptyDB();
  db.settings.efkaCategory = "first"; // 250.77 / month
  // Half-month 2026-09-1 runs Sep 1..14 (14 days). Today is Sep 3 -> elapsed 3 days.
  var share = efkaShareForKey(db, "2026-09-1", "2026-09-03");
  near(share, (250.77 / 2) * (3 / 14), 0.05);
  // A past period gets the full half-month share.
  var pastShare = efkaShareForKey(db, "2026-08-1", "2026-09-03");
  near(pastShare, 250.77 / 2, 0.001);
  // A period that has not started yet gets 0.
  var futureShare = efkaShareForKey(db, "2026-10-1", "2026-09-03");
  assert.equal(futureShare, 0);
});

test("EFKA proration: the very first shift does not produce a scary negative number", () => {
  var db = emptyDB();
  db.settings.efkaCategory = "first";
  db.entries = [{ id: "1", date: "2026-09-01", income: 40, tips: 5, hours: 5, exp: 3 }];
  var t = periodTotalsHalf(db, "2026-09-1");
  var efkaShare = efkaShareForKey(db, "2026-09-1", "2026-09-01");
  var profit = t.income + t.tips - t.exp - t.fixed;
  var net = profit - efkaShare; // ignoring tax reserve for this check
  assert.ok(net > 0, "net should stay positive on day 1: " + net + " (efka share " + efkaShare + ")");
});

test("obligations: stable keys and correct due dates for EFKA and VAT", () => {
  var db = emptyDB();
  db.settings.vatRegime = "normal";
  db.entries = [{ id: "1", date: "2026-07-10", income: 100, tips: 0, hours: 8, exp: 0 }];
  var list = obligationsList(db, "2026-09-15");
  var efkaKeys = list.filter(o => o.type === "efka").map(o => o.key);
  assert.deepEqual(efkaKeys, ["efka-2026-07", "efka-2026-08", "efka-2026-09"]);
  var efkaJuly = list.find(o => o.key === "efka-2026-07");
  assert.equal(efkaJuly.due, "2026-08-31");
  var vatQ3 = list.find(o => o.key === "vat-2026-Q3");
  assert.ok(vatQ3, "expected a Q3 VAT obligation");
  assert.equal(vatQ3.due, "2026-10-31");
  var taxKeys = list.filter(o => o.type === "tax").map(o => o.key);
  assert.equal(taxKeys.length, 8);
  assert.equal(taxKeys[0], "tax-2026-0");
});

test("obligations: custom debts appear with a stable key, monthly repeat generates occurrences", () => {
  var db = emptyDB();
  db.debts = [
    { id: "d1", name: "Δόση scooter", amount: 60, due: "2026-09-05", repeat: "none" },
    { id: "d2", name: "Δάνειο", amount: 30, due: "2026-09-10", repeat: "monthly" }
  ];
  var list = obligationsList(db, "2026-09-01");
  assert.ok(list.some(o => o.key === "debt-d1"));
  var monthly = list.filter(o => o.type === "debt" && o.key.indexOf("debt-d2-") === 0);
  assert.ok(monthly.length >= 2, "expected several monthly occurrences, got " + monthly.length);
  assert.equal(monthly[0].due, "2026-09-10");
  assert.equal(monthly[1].due, "2026-10-10");
});

test("set aside: sums unpaid EFKA to date, unpaid VAT to date and the YTD income-tax reserve", () => {
  var db = emptyDB();
  db.settings.vatRegime = "normal";
  db.settings.efkaCategory = "first";
  db.entries = [
    { id: "1", date: "2026-07-10", income: 1000, tips: 50, hours: 40, exp: 20 },
    { id: "2", date: "2026-08-10", income: 1000, tips: 50, hours: 40, exp: 20 }
  ];
  var sa = setAside(db, "2026-09-15");
  // Two full months of EFKA (July, August) should be unpaid and due; September is partial/current
  // and only counted once its month has started, which it has -> 3 months of EFKA due to date.
  assert.ok(sa.efka > 0);
  assert.ok(sa.tax >= 0);
  near(sa.total, sa.efka + sa.vat + sa.tax, 0.01);
});

test("set aside: marking an obligation paid removes it from the total", () => {
  var db = emptyDB();
  db.settings.efkaCategory = "first";
  db.entries = [{ id: "1", date: "2026-07-10", income: 500, tips: 0, hours: 20, exp: 0 }];
  var before = setAside(db, "2026-08-01");
  db.obligationsPaid["efka-2026-07"] = true;
  var after = setAside(db, "2026-08-01");
  assert.ok(after.efka < before.efka);
});

test("annual goal: hoursForGoal returns a finite positive number for a reachable goal", () => {
  var db = emptyDB();
  db.settings.efkaCategory = "first";
  db.entries = [
    { id: "1", date: "2026-07-05", income: 60, tips: 10, hours: 6, exp: 8 },
    { id: "2", date: "2026-07-20", income: 50, tips: 8, hours: 5, exp: 6 }
  ];
  var st = annualGoalStats(db, "2026-09-01");
  var h = hoursForGoal(db, 15000, st.margin, st.efkaMonthly);
  assert.ok(h > 0 && isFinite(h));
});

test("sample data: realEntries excludes sample-flagged shifts, activeEntries still includes them", () => {
  var db = emptyDB();
  db.entries = [
    { id: "1", date: "2026-09-01", income: 50, tips: 5, hours: 5, exp: 2 },
    { id: "2", date: "2026-09-02", income: 40, tips: 4, hours: 4, exp: 1, sample: true },
    { id: "3", date: "2026-09-03", income: 30, tips: 3, hours: 3, exp: 0, sample: true, deleted: true }
  ];
  assert.equal(activeEntries(db).length, 2, "deleted sample entry is excluded like any other deleted entry");
  assert.equal(realEntries(db).length, 1, "sample entries never count as real, whether or not they are deleted");
  assert.equal(realEntries(db)[0].id, "1");
});

test("import: accepts the original app's v2 backup format and skips duplicates", () => {
  var db = emptyDB();
  db.entries.push({ id: "1", date: "2026-01-01", income: 10, tips: 1, hours: 1, exp: 0, updatedAt: "x" });
  var v2 = {
    app: "pososa-krataw", version: 2,
    data: {
      entries: [
        { id: 1, date: "2026-01-01", income: 10, tips: 1, hours: 1, exp: 0 }, // duplicate id, skipped
        { id: 2, date: "2026-01-02", income: 20, tips: 2, hours: 2, exp: 1 }
      ],
      fixed: [{ id: 1, name: "Ασφάλεια", amount: 25, vat: true }],
      extra: { "2026-01-1": 5 },
      off: { "2026-01-03": true },
      goals: { "2026": 20000 },
      goalLocks: {}
    }
  };
  var added = importInto(db, v2);
  assert.equal(added.entries, 1);
  assert.equal(added.fixed, 1);
  assert.equal(db.entries.length, 2);
  assert.equal(db.fixed[0].vatDeductible, true);
  assert.equal(db.extra["2026-01-1"], 5);
  assert.equal(db.off["2026-01-03"], true);
  assert.equal(db.goals["2026"], 20000);
});

test("EFKA: salaried + freelancer in the first 5 years owes no EFKA", () => {
  var s = emptyDB().settings;
  s.employmentType = "salariedFreelancer";
  s.efkaCategory = "special";
  assert.equal(efkaMonthly(s), 0);
});

test("EFKA: salaried + freelancer after 5 years pays the difference from the special amount", () => {
  var s = emptyDB().settings;
  s.employmentType = "salariedFreelancer";
  s.efkaCategory = "first";
  near(efkaMonthly(s), 90.31, 0.01);
});


test("obligations: no EFKA cards when the monthly EFKA is 0, cards with the difference otherwise", () => {
  var entries = [{ id: "1", date: "2026-07-10", income: 100, tips: 0, hours: 8, exp: 0 }];
  var db = dbWithEntries(entries, { employmentType: "salariedFreelancer", efkaCategory: "special" });
  var list = obligationsList(db, "2026-09-15");
  assert.equal(list.filter(o => o.type === "efka").length, 0);
  assert.equal(list.filter(o => o.type === "tax").length, 8);

  db = dbWithEntries(entries, { employmentType: "salariedFreelancer", efkaCategory: "first" });
  var efka = obligationsList(db, "2026-09-15").filter(o => o.type === "efka");
  assert.equal(efka.length, 3);
  near(efka[0].amount, 90.31, 0.01);
});
