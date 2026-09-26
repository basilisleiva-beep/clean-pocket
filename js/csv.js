// Clean Pocket: pure CSV parser for the shift importer. No DOM.
// Accepts ; , or tab delimited files, decimal comma or dot, thousands separators,
// four date formats, and Greek/English/case/accent-insensitive headers.

function stripBOM(s) { return s.charCodeAt(0) === 0xFEFF ? s.slice(1) : s; }

function splitLines(text) {
  return stripBOM(String(text || "")).split(/\r\n|\n|\r/).filter(function (l) { return l.trim() !== ""; });
}

export function detectDelimiter(text) {
  var firstLine = splitLines(text)[0] || "";
  var candidates = [";", ",", "\t"];
  var best = ";", bestCount = -1;
  candidates.forEach(function (d) {
    var count = firstLine.split(d).length - 1;
    if (count > bestCount) { bestCount = count; best = d; }
  });
  return best;
}

function parseLine(line, delim) {
  var out = [], cur = "", inQ = false;
  for (var i = 0; i < line.length; i++) {
    var c = line[i];
    if (c === '"') {
      if (inQ && line[i + 1] === '"') { cur += '"'; i++; }
      else inQ = !inQ;
    } else if (c === delim && !inQ) { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map(function (s) { return s.trim(); });
}

function stripAccents(s) {
  return s.normalize ? s.normalize("NFD").replace(/[̀-ͯ]/g, "") : s;
}
function normHeader(h) { return stripAccents(String(h || "").toLowerCase().trim()); }

var HEADER_ALIASES = {
  date: ["ημερομηνια", "date"],
  income: ["εσοδα", "πλατφορμα", "income", "amount", "earnings"],
  tips: ["tips", "φιλοδωρηματα"],
  hours: ["ωρες", "hours"],
  exp: ["εξοδα", "expenses", "fuel", "καυσιμα"]
};

function matchHeader(h) {
  var nh = normHeader(h);
  var keys = ["date", "income", "tips", "hours", "exp"];
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (HEADER_ALIASES[key].some(function (alias) { return nh.indexOf(alias) !== -1; })) return key;
  }
  return null;
}

export function parseNumber(s) {
  if (s == null) return NaN;
  var t = String(s).trim();
  if (!t) return NaN;
  var hasComma = t.indexOf(",") !== -1, hasDot = t.indexOf(".") !== -1;
  if (hasComma && hasDot) {
    if (t.lastIndexOf(",") > t.lastIndexOf(".")) t = t.replace(/\./g, "").replace(",", ".");
    else t = t.replace(/,/g, "");
  } else if (hasComma) {
    t = t.replace(",", ".");
  }
  return parseFloat(t);
}

function pad2(v) { v = String(v); return v.length < 2 ? "0" + v : v; }

export function parseDate(s) {
  s = String(s || "").trim();
  var m;
  if ((m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s))) return s;
  if ((m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(s))) return m[3] + "-" + pad2(m[2]) + "-" + pad2(m[1]);
  if ((m = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(s))) return m[3] + "-" + pad2(m[2]) + "-" + pad2(m[1]);
  if ((m = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/.exec(s))) return m[3] + "-" + pad2(m[2]) + "-" + pad2(m[1]);
  return null;
}

// existingEntries: [{date, income, tips}] used to skip duplicates.
export function parseCSV(text, existingEntries) {
  var delim = detectDelimiter(text);
  var lines = splitLines(text);
  if (!lines.length) return { rows: [], skipped: 0, total: 0, delimiter: delim, preview: [] };

  var headerCols = parseLine(lines[0], delim).map(matchHeader);
  var hasHeader = headerCols.indexOf("date") !== -1 && headerCols.indexOf("income") !== -1;
  var dataLines = hasHeader ? lines.slice(1) : lines;
  var colMap = hasHeader ? headerCols : ["date", "income", "tips", "hours", "exp"];

  var existingKeys = {};
  (existingEntries || []).forEach(function (e) { existingKeys[e.date + "|" + e.income + "|" + e.tips] = true; });

  var rows = [], skipped = 0;
  dataLines.forEach(function (line) {
    var cells = parseLine(line, delim);
    var rec = {};
    colMap.forEach(function (key, i) { if (key) rec[key] = cells[i]; });
    var date = parseDate(rec.date);
    var income = parseNumber(rec.income);
    var tips = isFinite(parseNumber(rec.tips)) ? parseNumber(rec.tips) : 0;
    var hours = isFinite(parseNumber(rec.hours)) ? parseNumber(rec.hours) : 0;
    var exp = isFinite(parseNumber(rec.exp)) ? parseNumber(rec.exp) : 0;
    if (!date || !isFinite(income)) { skipped++; return; }
    var dupKey = date + "|" + income + "|" + tips;
    if (existingKeys[dupKey]) { skipped++; return; }
    existingKeys[dupKey] = true;
    rows.push({ date: date, income: income, tips: tips, hours: hours, exp: exp });
  });

  return { rows: rows, skipped: skipped, total: dataLines.length, delimiter: delim, preview: rows.slice(0, 5) };
}
