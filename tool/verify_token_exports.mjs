// Phase 4a QA — cross-platform token export verification.
//
// Re-derives every token from tokens/tokens.json (source of truth) and validates
// that the generated exports agree on NAME, VALUE, and UNIT across platforms:
//   - dist/ILDSTokens.swift   (iOS / SwiftUI)
//   - dist/IldsTokens.kt      (Android / Jetpack Compose)
//   - lib/design_system/ilds_tokens.dart  (Flutter, faithful section)
//   - dist/tokens.css         (web — spot parity on colors)
//
// Run: node tool/verify_token_exports.mjs
// Exit code 0 = all passes green; 1 = any failure.

import fs from 'node:fs';

const read = (p) => fs.readFileSync(p, 'utf8');

// ── name helpers (must mirror style-dictionary.config.mjs) ───────────────────
const cap = (key) => {
  const k = `${key}`.trim();
  if (k === '' || /^\d/.test(k)) return k;
  return k[0].toUpperCase() + k.slice(1);
};
const camel = (group) => {
  const parts = `${group}`.trim().split('-');
  return parts[0] + parts.slice(1).map((p) => (p ? cap(p) : '')).join('');
};
const stepSuffix = (key) => {
  const k = `${key}`.trim();
  if (/^\d+$/.test(k)) return k;
  return k.split('-').map((p) => (p ? cap(p) : '')).join('');
};

// ── flatten tokens.json into a canonical expectation list ────────────────────
const tokens = JSON.parse(read('tokens/tokens.json')).global;
const expect = { color: [], spacing: [], radius: [], fontFamily: [], fontSize: [], fontWeight: [], lineHeight: [] };

for (const [group, steps] of Object.entries(tokens.color)) {
  for (const [step, tok] of Object.entries(steps)) {
    const name = group === 'global' ? `global${stepSuffix(step)}` : `${camel(group)}${stepSuffix(step)}`;
    expect.color.push({ name, hex: tok.$value.replace('#', '').toUpperCase() });
  }
}
for (const [key, tok] of Object.entries(tokens.spacing)) {
  expect.spacing.push({ name: camel(key), value: Number(tok.$value) });
}
for (const [key, tok] of Object.entries(tokens.borderRadius)) {
  expect.radius.push({ name: `radius${cap(key)}`, value: Number(tok.$value) });
}
for (const [key, tok] of Object.entries(tokens.typography['font-family'])) {
  expect.fontFamily.push({ name: `fontFamily${cap(key)}`, value: tok.$value });
}
for (const [key, tok] of Object.entries(tokens.typography['font-size'])) {
  expect.fontSize.push({ name: `fontSize${cap(key)}`, value: Number(tok.$value) });
}
for (const [key, tok] of Object.entries(tokens.typography['font-weight'])) {
  expect.fontWeight.push({ name: `fontWeight${cap(key)}`, value: Number(tok.$value) });
}
for (const [key, tok] of Object.entries(tokens.typography['line-height'])) {
  expect.lineHeight.push({ name: `lineHeight${key}`, value: Number(tok.$value) });
}

const totalExpected = Object.values(expect).reduce((s, a) => s + a.length, 0);

// ── parse generated files into name→value maps ───────────────────────────────
function parseSwift(src) {
  const m = { color: {}, num: {}, weight: {}, str: {} };
  for (const [, n, hex] of src.matchAll(/public static let (\w+) = Color\(hex: 0x([0-9A-Fa-f]{6})\)/g)) m.color[n] = hex.toUpperCase();
  for (const [, n, v] of src.matchAll(/public static let (\w+): CGFloat = ([\d.]+)/g)) m.num[n] = Number(v);
  for (const [, n, w] of src.matchAll(/public static let (\w+): Font\.Weight = (\.\w+)/g)) m.weight[n] = w;
  for (const [, n, v] of src.matchAll(/public static let (\w+) = "([^"]+)"/g)) m.str[n] = v;
  return m;
}
function parseKotlin(src) {
  const m = { color: {}, num: {}, weight: {}, str: {} };
  for (const [, n, argb] of src.matchAll(/val (\w+) = Color\(0x([0-9A-Fa-f]{8})\)/g)) m.color[n] = argb.toUpperCase();
  for (const [, n, v] of src.matchAll(/val (\w+) = ([\d.]+)\.dp/g)) m.num[n] = Number(v);
  for (const [, n, v] of src.matchAll(/val (\w+) = ([\d.]+)\.sp/g)) m.num[n] = Number(v);
  for (const [, n, v] of src.matchAll(/const val (\w+) = ([\d.]+)f\b/g)) m.num[n] = Number(v);
  for (const [, n, w] of src.matchAll(/val (\w+) = (FontWeight\.\w+)/g)) m.weight[n] = w;
  for (const [, n, v] of src.matchAll(/const val (\w+) = "([^"]+)"/g)) m.str[n] = v;
  return m;
}
function parseDartColors(src) {
  const m = {};
  for (const [, n, hex] of src.matchAll(/static const Color (\w+) = Color\(0xFF([0-9A-Fa-f]{6})\);/g)) m[n] = hex.toUpperCase();
  return m;
}

const swift = parseSwift(read('dist/ILDSTokens.swift'));
const kotlin = parseKotlin(read('dist/IldsTokens.kt'));
const dartColors = parseDartColors(read('lib/design_system/ilds_tokens.dart'));
const css = read('dist/tokens.css');

const SWIFT_WEIGHT = { 400: '.regular', 500: '.medium', 700: '.bold' };
const KT_WEIGHT = { 400: 'FontWeight.Normal', 500: 'FontWeight.Medium', 700: 'FontWeight.Bold' };

// ── assertion harness ────────────────────────────────────────────────────────
let failures = 0;
const results = [];
function check(pass, label, detail = '') {
  if (pass) {
    results.push(`  ✅ ${label}`);
  } else {
    failures++;
    results.push(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}
function section(title) {
  results.push(`\n${title}`);
}

// ── PASS 1: source-of-truth parity (every token present everywhere) ──────────
section('PASS 1 — Source-of-truth coverage (tokens.json → exports)');
check(
  Object.keys(swift.color).length === expect.color.length,
  `Swift color count = ${expect.color.length}`,
  `got ${Object.keys(swift.color).length}`,
);
check(
  Object.keys(kotlin.color).length === expect.color.length,
  `Kotlin color count = ${expect.color.length}`,
  `got ${Object.keys(kotlin.color).length}`,
);
const swiftNum = Object.keys(swift.num).length;
const expectNum = expect.spacing.length + expect.radius.length + expect.fontSize.length + expect.lineHeight.length;
check(swiftNum === expectNum, `Swift numeric (sp+radius+size+lineHeight) count = ${expectNum}`, `got ${swiftNum}`);
const ktNum = Object.keys(kotlin.num).length;
check(ktNum === expectNum, `Kotlin numeric count = ${expectNum}`, `got ${ktNum}`);
check(Object.keys(swift.weight).length === expect.fontWeight.length, `Swift fontWeight count = ${expect.fontWeight.length}`);
check(Object.keys(kotlin.weight).length === expect.fontWeight.length, `Kotlin fontWeight count = ${expect.fontWeight.length}`);

const missingSwift = [];
const missingKotlin = [];
for (const c of expect.color) {
  if (!(c.name in swift.color)) missingSwift.push(c.name);
  if (!(c.name in kotlin.color)) missingKotlin.push(c.name);
}
for (const g of ['spacing', 'radius', 'fontSize', 'lineHeight']) {
  for (const t of expect[g]) {
    if (!(t.name in swift.num)) missingSwift.push(t.name);
    if (!(t.name in kotlin.num)) missingKotlin.push(t.name);
  }
}
check(missingSwift.length === 0, 'No expected tokens missing from Swift', missingSwift.join(', '));
check(missingKotlin.length === 0, 'No expected tokens missing from Kotlin', missingKotlin.join(', '));

// ── PASS 2: value correctness (hex, numeric, unit, weight) ───────────────────
section('PASS 2 — Value + unit correctness');
let hexSwiftBad = [], hexKtBad = [];
for (const c of expect.color) {
  if (swift.color[c.name] !== c.hex) hexSwiftBad.push(`${c.name}: ${swift.color[c.name]}≠${c.hex}`);
  if (kotlin.color[c.name] !== `FF${c.hex}`) hexKtBad.push(`${c.name}: ${kotlin.color[c.name]}≠FF${c.hex}`);
}
check(hexSwiftBad.length === 0, 'Swift color hex == source hex', hexSwiftBad.slice(0, 5).join('; '));
check(hexKtBad.length === 0, 'Kotlin color = 0xFF + source hex (opaque ARGB)', hexKtBad.slice(0, 5).join('; '));

let numBad = [];
for (const g of ['spacing', 'radius', 'fontSize', 'lineHeight']) {
  for (const t of expect[g]) {
    if (swift.num[t.name] !== t.value) numBad.push(`swift ${t.name}: ${swift.num[t.name]}≠${t.value}`);
    if (kotlin.num[t.name] !== t.value) numBad.push(`kt ${t.name}: ${kotlin.num[t.name]}≠${t.value}`);
  }
}
check(numBad.length === 0, 'All numeric values match source (spacing/radius/font-size/line-height)', numBad.slice(0, 5).join('; '));

let weightBad = [];
for (const w of expect.fontWeight) {
  if (swift.weight[w.name] !== SWIFT_WEIGHT[w.value]) weightBad.push(`swift ${w.name}: ${swift.weight[w.name]}≠${SWIFT_WEIGHT[w.value]}`);
  if (kotlin.weight[w.name] !== KT_WEIGHT[w.value]) weightBad.push(`kt ${w.name}: ${kotlin.weight[w.name]}≠${KT_WEIGHT[w.value]}`);
}
check(weightBad.length === 0, 'Font weight mapping correct (400/500/700 → regular/medium/bold)', weightBad.join('; '));

check(swift.str.fontFamilyPrimary === 'Mulish', 'Swift fontFamilyPrimary == "Mulish"');
check(kotlin.str.fontFamilyPrimary === 'Mulish', 'Kotlin fontFamilyPrimary == "Mulish"');

// ── PASS 3: identifier parity across platforms ───────────────────────────────
section('PASS 3 — Identifier parity (Swift ↔ Kotlin ↔ Flutter)');
const swiftNames = new Set([...Object.keys(swift.color), ...Object.keys(swift.num), ...Object.keys(swift.weight), ...Object.keys(swift.str)]);
const ktNames = new Set([...Object.keys(kotlin.color), ...Object.keys(kotlin.num), ...Object.keys(kotlin.weight), ...Object.keys(kotlin.str)]);
const onlySwift = [...swiftNames].filter((n) => !ktNames.has(n));
const onlyKt = [...ktNames].filter((n) => !swiftNames.has(n));
check(onlySwift.length === 0 && onlyKt.length === 0, 'Swift and Kotlin expose identical identifier sets', `swift-only: ${onlySwift.join(',')} | kt-only: ${onlyKt.join(',')}`);

// Flutter faithful color parity: every native color name exists in Dart with same hex.
let dartMismatch = [];
for (const c of expect.color) {
  if (dartColors[c.name] === undefined) dartMismatch.push(`missing ${c.name}`);
  else if (dartColors[c.name] !== c.hex) dartMismatch.push(`${c.name}: dart ${dartColors[c.name]}≠${c.hex}`);
}
check(dartMismatch.length === 0, 'Flutter ILDSTokens has matching faithful color name+hex', dartMismatch.slice(0, 5).join('; '));

// ── PASS 4: no duplicate symbols, no unexpected drift ────────────────────────
section('PASS 4 — Uniqueness + drift guard');
function dupes(src, re) {
  const seen = new Set(), dup = new Set();
  for (const [, n] of src.matchAll(re)) {
    if (seen.has(n)) dup.add(n);
    seen.add(n);
  }
  return [...dup];
}
const swiftDup = dupes(read('dist/ILDSTokens.swift'), /public static let (\w+)/g);
const ktDup = dupes(read('dist/IldsTokens.kt'), /(?:const )?val (\w+)/g);
check(swiftDup.length === 0, 'No duplicate Swift symbols', swiftDup.join(', '));
check(ktDup.length === 0, 'No duplicate Kotlin symbols', ktDup.join(', '));

const swiftTotal = swiftNames.size;
check(swiftTotal === totalExpected, `Swift exposes exactly ${totalExpected} tokens (no extras)`, `got ${swiftTotal}`);
check(ktNames.size === totalExpected, `Kotlin exposes exactly ${totalExpected} tokens (no extras)`, `got ${ktNames.size}`);

// ── PASS 5: structural validity (Kotlin has no compiler here) ────────────────
section('PASS 5 — Structural validity');
const swiftSrc = read('dist/ILDSTokens.swift');
const ktSrc = read('dist/IldsTokens.kt');
const balanced = (s) => (s.match(/{/g) || []).length === (s.match(/}/g) || []).length;
check(balanced(swiftSrc), 'Swift braces balanced');
check(balanced(ktSrc), 'Kotlin braces balanced');
check(/import SwiftUI/.test(swiftSrc) && /public enum ILDSTokens \{/.test(swiftSrc), 'Swift: import SwiftUI + enum ILDSTokens present');
check(
  /package com\.icicilombard\.ilds\.tokens/.test(ktSrc) &&
    /import androidx\.compose\.ui\.graphics\.Color/.test(ktSrc) &&
    /import androidx\.compose\.ui\.unit\.dp/.test(ktSrc) &&
    /import androidx\.compose\.ui\.unit\.sp/.test(ktSrc) &&
    /import androidx\.compose\.ui\.text\.font\.FontWeight/.test(ktSrc) &&
    /object IldsTokens \{/.test(ktSrc),
  'Kotlin: package + all 4 Compose imports + object IldsTokens present',
);
// Every Compose color literal is exactly 8 hex digits (opaque ARGB).
const badArgb = [...ktSrc.matchAll(/Color\(0x([0-9A-Fa-f]+)\)/g)].filter(([, h]) => h.length !== 8).map(([m]) => m);
check(badArgb.length === 0, 'Kotlin every Color literal is 8-digit ARGB', badArgb.join(', '));

// ── PASS 6: web export untouched (spot parity on a few colors) ───────────────
section('PASS 6 — Web export still in sync (spot check)');
const spot = [
  ['--color-primary-orange-500', 'E3530F'],
  ['--color-neutral-coolgray-500', '9E9E9E'],
  ['--color-error-red-600', 'E00903'],
];
let cssBad = [];
for (const [varName, hex] of spot) {
  const re = new RegExp(`${varName}:\\s*#${hex}`, 'i');
  if (!re.test(css)) cssBad.push(varName);
}
check(cssBad.length === 0, 'dist/tokens.css colors still match source', cssBad.join(', '));

// ── summary ──────────────────────────────────────────────────────────────────
console.log(results.join('\n'));
console.log(`\n${'─'.repeat(60)}`);
console.log(`Expected tokens: ${totalExpected}  (colors ${expect.color.length}, spacing ${expect.spacing.length}, radius ${expect.radius.length}, fontFamily ${expect.fontFamily.length}, fontSize ${expect.fontSize.length}, fontWeight ${expect.fontWeight.length}, lineHeight ${expect.lineHeight.length})`);
console.log(failures === 0 ? `✅ ALL CHECKS PASSED` : `❌ ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
