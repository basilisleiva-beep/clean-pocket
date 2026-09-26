// Clean Pocket: guards the EL/EN translation. (a) every dictionary key must have a non-empty
// el and en value. (b) index.html and js/app.js must not contain hard-coded Greek text outside
// I.t(...) calls, HTML attributes (aria-label, data-*, etc. - everything markup carries) and the
// settings city list (CITIES in js/app.js), which is an explicitly allowed exemption.
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { STRINGS } from "../js/i18n.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const GREEK_RE = /[Ͱ-Ͽἀ-῿]/;

test("i18n: every key has both el and en, non-empty", () => {
  var bad = [];
  Object.keys(STRINGS).forEach(function (k) {
    var e = STRINGS[k];
    if (!e || typeof e.el !== "string" || !e.el.trim() || typeof e.en !== "string" || !e.en.trim()) bad.push(k);
  });
  assert.deepEqual(bad, [], "keys missing a non-empty el and/or en value: " + bad.join(", "));
});

function stripHTML(text) {
  // Attribute values (aria-label="...", content="...", data-*="...") live inside tags, so
  // dropping every "<...>" span removes them along with the tags themselves; only real text
  // nodes remain to scan. HTML comments are dropped too.
  return text.replace(/<!--[\s\S]*?-->/g, "").replace(/<[^>]*>/g, " ");
}

test("i18n: no hard-coded Greek text in index.html outside markup", () => {
  var html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
  var visible = stripHTML(html);
  var offenders = [];
  visible.split("\n").forEach(function (line, i) {
    if (GREEK_RE.test(line)) offenders.push((i + 1) + ": " + line.trim());
  });
  assert.deepEqual(offenders, [], "found hard-coded Greek text in index.html:\n" + offenders.join("\n"));
});

function stripJS(text) {
  // Exempt the settings city list (CITIES = [...]) explicitly named in the task.
  var cStart = text.indexOf("var CITIES = [");
  if (cStart !== -1) {
    var cEnd = text.indexOf("\n];", cStart);
    if (cEnd !== -1) text = text.slice(0, cStart) + text.slice(cEnd + 3);
  }
  // Drop every I.t("key", ...) call's arguments (non-greedy to the first closing paren - the
  // vars object this app passes is always a flat {a: b, ...} literal, never nested parens).
  text = text.replace(/I\.t\([^)]*\)/g, "I.t()");
  // Drop comments: domain vocabulary explained in a comment is not user-visible text.
  text = text.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
  return text;
}

test("i18n: no hard-coded Greek text in js/app.js outside I.t(), attributes and the CITIES list", () => {
  var js = fs.readFileSync(path.join(ROOT, "js", "app.js"), "utf8");
  var scanned = stripJS(js);
  var offenders = [];
  scanned.split("\n").forEach(function (line, i) {
    if (GREEK_RE.test(line)) offenders.push((i + 1) + ": " + line.trim());
  });
  assert.deepEqual(offenders, [], "found hard-coded Greek text in js/app.js:\n" + offenders.join("\n"));
});
