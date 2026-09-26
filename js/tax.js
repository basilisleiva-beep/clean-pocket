// Clean Pocket: Greek freelancer tax math for tax year 2026.
// Pure functions only (no DOM, no storage) so the same module can run in the
// browser, in tests, and later on a server when the app becomes a SaaS.
// Sources: Ν. 5246/2025 (άρθρο 15 ΚΦΕ, ισχύς 1/1/2026), ΕΦΚΑ εγκύκλιος 6/2026.
// Verify with an accountant before relying on any figure.

export const RULES = {
  year: 2026,
  source: "Ν. 5246/2025 (άρθρο 15 ΚΦΕ) · ΕΦΚΑ εγκ. 6/2026",
  caps: [10000, 20000, 30000, 40000, 60000, Infinity],
  rates: [0.09, 0.20, 0.26, 0.34, 0.39, 0.44],
  prepayRate: 0.55,
  prepayNewRate: 0.275,      // first 3 years of activity: prepayment reduced by 50%
  newProYears: 3,            // also exempt from minimum presumed income (τεκμαρτό)
  efka: { first: 250.77, special: 160.46, specialYears: 5 }, // monthly, incl. ΔΥΠΑ €10
  vatRate: 24,
  taxInstallments: 8         // July of the next year through February
};

// Per-bracket rates for a taxpayer profile { age, children }.
export function bracketRates(profile) {
  var p = profile || {};
  var kids = Math.max(0, Math.floor(+p.children || 0));
  var age = +p.age || 0;
  var r = RULES.rates.slice();
  if (kids >= 4) r[0] = 0;
  r[1] = [0.20, 0.18, 0.16, 0.09, 0][Math.min(kids, 4)];
  r[2] = Math.max(0, 0.26 - 0.02 * kids);
  if (age > 0 && age <= 25) { r[0] = 0; r[1] = 0; }
  else if (age >= 26 && age <= 30) { r[0] = Math.min(r[0], 0.09); r[1] = Math.min(r[1], 0.09); }
  return r;
}

export function incomeTax(taxable, profile) {
  var rates = bracketRates(profile), tax = 0, prev = 0;
  for (var i = 0; i < RULES.caps.length && taxable > prev; i++) {
    tax += (Math.min(taxable, RULES.caps[i]) - prev) * rates[i];
    prev = RULES.caps[i];
  }
  return tax;
}

export function isNewPro(profile) {
  var y = +(profile && profile.yearsActive);
  return isFinite(y) && y > 0 && y <= RULES.newProYears;
}

// annualProfit: income + tips - expenses - fixed costs, BEFORE EFKA.
// EFKA is deductible. Minimum presumed income (τεκμαρτό) applies after the first
// 3 years when the accountant-provided amount is higher than the real result.
export function annualEstimate(annualProfit, efkaMonthly, profile) {
  var p = profile || {};
  var real = Math.max(0, annualProfit - efkaMonthly * 12);
  var presumed = +p.presumedIncome || 0;
  var presumedApplies = !isNewPro(p) && presumed > real;
  var taxable = presumedApplies ? presumed : real;
  var tax = incomeTax(taxable, p);
  var prepay = tax * (isNewPro(p) ? RULES.prepayNewRate : RULES.prepayRate);
  return {
    taxable: taxable,
    tax: tax,
    prepay: prepay,
    effRate: annualProfit > 0 ? tax / annualProfit : 0,
    presumedApplies: presumedApplies,
    presumedWarning: !isNewPro(p) && !(presumed > 0)
  };
}

// VAT split of one shift. vat = { on, rate (percent), inclusive, expShare (percent) }.
export function vatSplit(entry, vat) {
  var v = vat || {};
  var rate = v.on ? (+v.rate || 0) / 100 : 0;
  var inc = entry.income, out = 0, input = 0;
  if (rate > 0) {
    if (v.inclusive) { inc = entry.income / (1 + rate); out = entry.income - inc; }
    else out = entry.income * rate;
    input = entry.exp * rate / (1 + rate) * Math.min(100, Math.max(0, +v.expShare || 0)) / 100;
  }
  return { income: inc, tips: entry.tips, vatOut: out, vatIn: input, exp: entry.exp - input, hours: entry.hours };
}

function lastDay(y, m) { return new Date(y, m, 0).getDate(); } // m is 1-12
function iso(y, m, d) { return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0"); }
function addMonths(y, m, k) { var t = y * 12 + (m - 1) + k; return [Math.floor(t / 12), (t % 12) + 1]; }

// EFKA for month m is paid by the last day of the next month.
export function efkaDue(y, m) { var n = addMonths(y, m, 1); return iso(n[0], n[1], lastDay(n[0], n[1])); }

// Single-entry books (most riders): VAT is filed per quarter, due by the end of the next month.
export function vatQuarterDue(y, q) { var n = addMonths(y, q * 3, 1); return iso(n[0], n[1], lastDay(n[0], n[1])); }
export function quarterOf(m) { return Math.floor((m - 1) / 3) + 1; }

// Income tax of taxYear (plus next year's prepayment) is paid in 8 installments, July to February.
export function taxInstallmentDates(taxYear) {
  var out = [];
  for (var k = 0; k < RULES.taxInstallments; k++) {
    var n = addMonths(taxYear + 1, 7, k);
    out.push(iso(n[0], n[1], lastDay(n[0], n[1])));
  }
  return out;
}
