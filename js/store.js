// Clean Pocket: storage adapter. Schema v3 - every entry, fixed cost, debt and goal has a
// stable string id and an updatedAt; deletes leave a tombstone so a future sync can merge.
// LocalStorageAdapter is the only adapter today; a RemoteAdapter can implement the same
// four methods later without the UI changing.

export const STORE_KEY = "cleanpocket_v3";

export function uuid() {
  try { if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID(); } catch (e) { /* fall through */ }
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
}

export function nowISO() { return new Date().toISOString(); }

function numOr0(v) { var x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; }
function numPos(v) { var x = numOr0(v); return x > 0 ? x : 0; }

export function emptyDB() {
  return {
    version: 3,
    entries: [], fixed: [], extra: {}, off: {},
    goals: {}, goalLocks: {}, debts: [], savingsGoals: [],
    obligationsPaid: {}, lastBackup: "",
    settings: {
      onboarded: false,
      vatRegime: "unknown",          // "normal" | "exempt" | "unknown"
      platformIncludesVat: false,
      age: null,
      children: 0,
      yearsActive: "1-3",            // "1-3" | "4+"
      presumedIncome: 0,
      efkaCategory: "special",       // "special" | "first" | "other"
      efkaCustomAmount: 0,
      employmentType: "freelancer",  // "freelancer" | "salariedFreelancer"
      daysPerWeek: 5,
      annualOverride: 0,
      weather: { mode: "off", city: null, lat: null, lon: null },
      theme: "forest",
      lang: "el",
      vat: { rate: 24, expShare: 0 }
    }
  };
}

function normalize(d) {
  var base = emptyDB();
  if (!d || typeof d !== "object") return base;
  ["entries", "fixed", "debts", "savingsGoals"].forEach(function (k) { if (Array.isArray(d[k])) base[k] = d[k]; });
  ["extra", "off", "goals", "goalLocks", "obligationsPaid"].forEach(function (k) { if (d[k] && typeof d[k] === "object") base[k] = d[k]; });
  if (d.settings && typeof d.settings === "object") {
    base.settings = Object.assign({}, base.settings, d.settings);
    if (d.settings.vat) base.settings.vat = Object.assign({}, base.settings.vat, d.settings.vat);
    if (d.settings.weather) base.settings.weather = Object.assign({}, base.settings.weather, d.settings.weather);
  }
  if (typeof d.lastBackup === "string") base.lastBackup = d.lastBackup;
  return base;
}

// Merges an exported backup (this app's v3, or the original app's v2) into `db`, skipping
// duplicates. Returns counts of what was added.
export function importInto(db, obj) {
  var added = { entries: 0, fixed: 0, debts: 0, savingsGoals: 0 };
  if (!obj) return added;
  var data = obj.data && typeof obj.data === "object" ? obj.data : obj;
  if (!data) return added;
  var isV3 = obj.version === 3 || data.version === 3;

  var haveE = {};
  db.entries.forEach(function (e) { haveE[String(e.id)] = true; });
  (Array.isArray(data.entries) ? data.entries : []).forEach(function (e) {
    if (!e || typeof e.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(e.date)) return;
    var id = e.id != null ? String(e.id) : uuid();
    if (haveE[id]) return;
    haveE[id] = true;
    db.entries.push({
      id: id, date: e.date, income: numOr0(e.income), tips: numOr0(e.tips),
      hours: numOr0(e.hours), exp: numOr0(e.exp), updatedAt: e.updatedAt || nowISO()
    });
    added.entries++;
  });

  var haveF = {};
  db.fixed.forEach(function (f) { haveF[String(f.id)] = true; });
  (Array.isArray(data.fixed) ? data.fixed : []).forEach(function (f) {
    if (!f || numPos(f.amount) <= 0) return;
    var id = f.id != null ? String(f.id) : uuid();
    if (haveF[id]) return;
    haveF[id] = true;
    db.fixed.push({
      id: id, name: String(f.name || "Fixed cost").slice(0, 60), amount: numPos(f.amount),
      vatDeductible: !!(f.vatDeductible || f.vat), updatedAt: f.updatedAt || nowISO()
    });
    added.fixed++;
  });

  if (data.extra && typeof data.extra === "object") {
    Object.keys(data.extra).forEach(function (k) {
      if (/^\d{4}-\d{2}-[12]$/.test(k) && !db.extra[k] && numPos(data.extra[k]) > 0) db.extra[k] = numPos(data.extra[k]);
    });
  }
  if (data.off && typeof data.off === "object") {
    Object.keys(data.off).forEach(function (k) { if (/^\d{4}-\d{2}-\d{2}$/.test(k) && data.off[k] === true) db.off[k] = true; });
  }
  if (data.goals && typeof data.goals === "object") {
    Object.keys(data.goals).forEach(function (k) { if (/^\d{4}$/.test(k) && !db.goals[k] && numPos(data.goals[k]) > 0) db.goals[k] = numPos(data.goals[k]); });
  }
  if (data.goalLocks && typeof data.goalLocks === "object") {
    Object.keys(data.goalLocks).forEach(function (k) { if (/^\d{4}$/.test(k) && data.goalLocks[k] === true) db.goalLocks[k] = true; });
  }

  if (isV3) {
    var haveD = {};
    db.debts.forEach(function (x) { haveD[String(x.id)] = true; });
    (Array.isArray(data.debts) ? data.debts : []).forEach(function (dbt) {
      if (!dbt || !dbt.name) return;
      var id = dbt.id != null ? String(dbt.id) : uuid();
      if (haveD[id]) return;
      haveD[id] = true;
      db.debts.push({
        id: id, name: String(dbt.name).slice(0, 60), amount: numPos(dbt.amount), due: dbt.due || null,
        repeat: dbt.repeat === "monthly" ? "monthly" : "none", updatedAt: dbt.updatedAt || nowISO(), deleted: !!dbt.deleted
      });
      added.debts++;
    });
    var haveG = {};
    db.savingsGoals.forEach(function (x) { haveG[String(x.id)] = true; });
    (Array.isArray(data.savingsGoals) ? data.savingsGoals : []).forEach(function (g) {
      if (!g || !g.name) return;
      var id = g.id != null ? String(g.id) : uuid();
      if (haveG[id]) return;
      haveG[id] = true;
      db.savingsGoals.push({
        id: id, name: String(g.name).slice(0, 60), target: numPos(g.target), targetDate: g.targetDate || null,
        saved: numOr0(g.saved), updatedAt: g.updatedAt || nowISO(), deleted: !!g.deleted
      });
      added.savingsGoals++;
    });
    if (data.obligationsPaid && typeof data.obligationsPaid === "object") {
      Object.keys(data.obligationsPaid).forEach(function (k) { if (data.obligationsPaid[k] === true) db.obligationsPaid[k] = true; });
    }
  }

  return added;
}

export class LocalStorageAdapter {
  load() {
    try {
      var s = localStorage.getItem(STORE_KEY);
      if (!s) return emptyDB();
      return normalize(JSON.parse(s));
    } catch (e) { return emptyDB(); }
  }
  save(db) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); return true; } catch (e) { return false; }
  }
  exportJSON(db) {
    // Sample data (the tour's "try with sample data" demo shifts) is local-only scaffolding:
    // it must never leave the device in a backup, so it is stripped before export.
    var clean = Object.assign({}, db, { entries: (db.entries || []).filter(function (e) { return !e.sample; }) });
    return { app: "clean-pocket", version: 3, exportedAt: nowISO(), data: clean };
  }
  importJSON(db, obj) {
    return importInto(db, obj);
  }
}
