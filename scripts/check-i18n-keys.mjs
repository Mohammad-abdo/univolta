#!/usr/bin/env node
/**
 * Ensures EN and AR translation objects in lib/i18n.ts declare the same keys.
 * Exit 1 on mismatch (for CI).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const i18nPath = path.join(__dirname, "..", "lib", "i18n.ts");

const s = fs.readFileSync(i18nPath, "utf8");
const enM = s.match(/en:\s*\{([\s\S]*?)\n\s*\},\s*\n\s*ar:/);
const arM = s.match(/ar:\s*\{([\s\S]*?)\n\s*\},\s*\};/);
if (!enM || !arM) {
  console.error("check-i18n-keys: could not parse en/ar blocks in i18n.ts");
  process.exit(1);
}

const keyRe = /^\s*([a-zA-Z0-9_]+):/gm;
function collectKeys(block) {
  const set = new Set();
  let m;
  keyRe.lastIndex = 0;
  while ((m = keyRe.exec(block))) set.add(m[1]);
  return set;
}

const en = collectKeys(enM[1]);
const ar = collectKeys(arM[1]);
const onlyEn = [...en].filter((k) => !ar.has(k)).sort();
const onlyAr = [...ar].filter((k) => !en.has(k)).sort();

if (onlyEn.length || onlyAr.length) {
  console.error("check-i18n-keys: EN/AR key mismatch");
  if (onlyEn.length) console.error("  Only in EN:", onlyEn.join(", "));
  if (onlyAr.length) console.error("  Only in AR:", onlyAr.join(", "));
  process.exit(1);
}

console.log(`check-i18n-keys: OK (${en.size} keys each)`);
