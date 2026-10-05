import test from "node:test";
import assert from "node:assert/strict";
import { incomeTax, annualEstimate, vatSplit, efkaDue, vatQuarterDue, vatMonthDue, taxInstallmentDates } from "../js/tax.js";

const near = (a, b) => assert.ok(Math.abs(a - b) < 0.01, a + " != " + b);

test("2026 base scale", () => {
  near(incomeTax(10000), 900);
  near(incomeTax(20000), 2900);
  near(incomeTax(30000), 5500);
  near(incomeTax(60000), 16700);
  near(incomeTax(70000), 21100);
  near(incomeTax(0), 0);
});

test("youth rates", () => {
  near(incomeTax(20000, { age: 24 }), 0);
  near(incomeTax(25000, { age: 25 }), 1300);
  near(incomeTax(20000, { age: 28 }), 1800);
  near(incomeTax(20000, { age: 31 }), 2900);
});

test("children rates", () => {
  near(incomeTax(20000, { children: 1 }), 2700);
  near(incomeTax(30000, { children: 1 }), 5100);
  near(incomeTax(20000, { children: 3 }), 1800);
  near(incomeTax(30000, { children: 4 }), 1800);
  near(incomeTax(30000, { children: 5 }), 1600);
});

test("presumed income applies only after 3 years", () => {
  const e = annualEstimate(11000, 250.77, { yearsActive: 5, presumedIncome: 12000 });
  assert.equal(e.presumedApplies, true);
  near(e.taxable, 12000);
  const n = annualEstimate(11000, 160.46, { yearsActive: 2, presumedIncome: 12000 });
  assert.equal(n.presumedApplies, false);
  near(n.taxable, 11000 - 160.46 * 12);
  assert.equal(n.presumedWarning, false);
  assert.equal(annualEstimate(11000, 250.77, { yearsActive: 5 }).presumedWarning, true);
});

test("prepayment 27.5% for new pros, 55% otherwise", () => {
  const a = annualEstimate(30000, 0, { yearsActive: 1 });
  near(a.prepay, a.tax * 0.275);
  const b = annualEstimate(30000, 0, { yearsActive: 6 });
  near(b.prepay, b.tax * 0.55);
});

test("vat split", () => {
  const e = { income: 100, tips: 5, exp: 12.4, hours: 4 };
  const ex = vatSplit(e, { on: true, rate: 24, inclusive: false, expShare: 100 });
  near(ex.income, 100); near(ex.vatOut, 24); near(ex.vatIn, 2.4); near(ex.exp, 10);
  const inc = vatSplit({ income: 124, tips: 0, exp: 0, hours: 0 }, { on: true, rate: 24, inclusive: true });
  near(inc.income, 100); near(inc.vatOut, 24);
  const off = vatSplit(e, { on: false, rate: 24 });
  near(off.vatOut, 0); near(off.exp, 12.4);
});

test("due dates", () => {
  assert.equal(efkaDue(2026, 1), "2026-02-28");
  assert.equal(efkaDue(2026, 12), "2027-01-31");
  assert.equal(vatQuarterDue(2026, 1), "2026-04-30");
  assert.equal(vatQuarterDue(2026, 4), "2027-01-31");
  assert.equal(vatMonthDue(2026, 9), "2026-10-01");
  assert.equal(vatMonthDue(2026, 12), "2027-01-01");
  const t = taxInstallmentDates(2026);
  assert.equal(t.length, 8);
  assert.equal(t[0], "2027-07-31");
  assert.equal(t[7], "2028-02-29");
});
