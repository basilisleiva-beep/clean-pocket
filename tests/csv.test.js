import test from "node:test";
import assert from "node:assert/strict";
import { parseCSV, detectDelimiter, parseNumber, parseDate } from "../js/csv.js";

test("detects the delimiter (semicolon, comma or tab)", () => {
  assert.equal(detectDelimiter("a;b;c\n1;2;3"), ";");
  assert.equal(detectDelimiter("a,b,c\n1,2,3"), ",");
  assert.equal(detectDelimiter("a\tb\tc\n1\t2\t3"), "\t");
});

test("parses numbers with decimal comma and thousands separators", () => {
  assert.equal(parseNumber("12,4"), 12.4);
  assert.equal(parseNumber("1.234,50"), 1234.5);
  assert.equal(parseNumber("1,234.50"), 1234.5);
  assert.equal(parseNumber("62"), 62);
});

test("parses the four accepted date formats", () => {
  assert.equal(parseDate("2026-09-05"), "2026-09-05");
  assert.equal(parseDate("05/09/2026"), "2026-09-05");
  assert.equal(parseDate("05-09-2026"), "2026-09-05");
  assert.equal(parseDate("05.09.2026"), "2026-09-05");
  assert.equal(parseDate("not a date"), null);
});

test("maps Greek and English headers, case- and accent-insensitively", () => {
  var csv = "Ημερομηνία;Έσοδα πλατφόρμας;Tips;Ώρες;Έξοδα βάρδιας\n05/09/2026;62,50;8;6;9,4";
  var res = parseCSV(csv, []);
  assert.equal(res.rows.length, 1);
  assert.equal(res.rows[0].date, "2026-09-05");
  assert.equal(res.rows[0].income, 62.5);
  assert.equal(res.rows[0].tips, 8);
  assert.equal(res.rows[0].hours, 6);
  assert.equal(res.rows[0].exp, 9.4);
});

test("accepts the app's own CSV export round-trip", () => {
  var csv = "Ημερομηνία;Έσοδα πλατφόρμας;Tips;Ώρες;Έξοδα βάρδιας\n2026-09-01;50,00;5,00;5,00;4,00";
  var res = parseCSV(csv, []);
  assert.equal(res.rows.length, 1);
  assert.equal(res.rows[0].income, 50);
});

test("skips bad rows and duplicates against existing entries", () => {
  var csv = [
    "date;income;tips;hours;exp",
    "05/09/2026;60;5;6;8",
    "bad-date;60;5;6;8",
    "06/09/2026;not-a-number;5;6;8",
    "05/09/2026;60;5;6;8" // duplicate of the first row
  ].join("\n");
  var res = parseCSV(csv, []);
  assert.equal(res.rows.length, 1);
  assert.equal(res.skipped, 3);
  assert.equal(res.total, 4);
});

test("duplicate detection also matches entries already in the app", () => {
  var csv = "date;income;tips;hours;exp\n05/09/2026;60;5;6;8";
  var existing = [{ date: "2026-09-05", income: 60, tips: 5 }];
  var res = parseCSV(csv, existing);
  assert.equal(res.rows.length, 0);
  assert.equal(res.skipped, 1);
});

test("auto-detects a header-less file with the default column order", () => {
  var csv = "05/09/2026;60;5;6;8";
  var res = parseCSV(csv, []);
  assert.equal(res.rows.length, 1);
  assert.equal(res.rows[0].income, 60);
});
