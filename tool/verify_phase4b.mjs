// Phase 4b QA — native component + token path verification.
//
// Passes:
//   1. Token files in dist/, ios/, android/ are byte-identical
//   2. iOS Swift package compiles (swift build)
//   3. Android Compose Button structural + API checks
//   4. Cross-platform Button API surface parity (types/sizes/appearance)
//
// Run: node tool/verify_phase4b.mjs

import { execSync } from 'node:child_process';
import fs from 'node:fs';
import crypto from 'node:crypto';

const read = (p) => fs.readFileSync(p, 'utf8');
const sha = (p) => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');

let failures = 0;
const log = [];

function check(pass, label, detail = '') {
  if (pass) log.push(`  ✅ ${label}`);
  else {
    failures++;
    log.push(`  ❌ ${label}${detail ? ` — ${detail}` : ''}`);
  }
}
function section(title) {
  log.push(`\n${title}`);
}

// ── PASS 1: token path sync (dist ↔ platform copies) ───────────────────────
section('PASS 1 — Token path sync (dist ↔ ios ↔ android)');
const swiftDist = 'dist/ILDSTokens.swift';
const swiftPkg = 'ios/Sources/ILDSTokens/ILDSTokens.swift';
const ktDist = 'dist/IldsTokens.kt';
const ktMod = 'android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/tokens/IldsTokens.kt';

for (const p of [swiftDist, swiftPkg, ktDist, ktMod]) {
  check(fs.existsSync(p), `${p} exists`);
}
check(sha(swiftDist) === sha(swiftPkg), 'Swift tokens: dist === ios/Sources/ILDSTokens');
check(sha(ktDist) === sha(ktMod), 'Kotlin tokens: dist === android module');

// ── PASS 2: run existing cross-platform token parity ─────────────────────────
section('PASS 2 — Cross-platform token parity (verify_token_exports)');
try {
  execSync('node tool/verify_token_exports.mjs', { stdio: 'pipe' });
  check(true, 'verify_token_exports.mjs passed');
} catch (e) {
  check(false, 'verify_token_exports.mjs passed', e.stderr?.toString() || e.message);
}

// ── PASS 3: iOS compile ──────────────────────────────────────────────────────
section('PASS 3 — iOS Swift package compile');
try {
  execSync('swift build', { cwd: 'ios', stdio: 'pipe' });
  check(true, 'swift build (ios/) succeeded');
} catch (e) {
  check(false, 'swift build (ios/) succeeded', e.stderr?.toString().slice(0, 400) || e.message);
}

const swiftBtn = read('ios/Sources/ILDSDesignSystem/IldsButton.swift');
check(/public enum IldsButtonType/.test(swiftBtn), 'Swift: IldsButtonType enum');
check(/public enum IldsButtonSize/.test(swiftBtn), 'Swift: IldsButtonSize enum');
check(/public enum IldsButtonAppearance/.test(swiftBtn), 'Swift: IldsButtonAppearance enum');
check(/public struct IldsButton/.test(swiftBtn), 'Swift: IldsButton view');
check(/primaryOrange500/.test(swiftBtn), 'Swift Button uses ILDSTokens.primaryOrange500');
check(/errorRed600/.test(swiftBtn), 'Swift Button uses ILDSTokens.errorRed600');
check(/radiusLarge/.test(swiftBtn), 'Swift Button uses ILDSTokens.radiusLarge (8px)');

// ── PASS 4: Android Compose Button structural ────────────────────────────────
section('PASS 4 — Android Compose Button structural');
const ktBtn = read('android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/components/IldsButton.kt');
check(/enum class IldsButtonType/.test(ktBtn), 'Kotlin: IldsButtonType enum');
check(/enum class IldsButtonSize/.test(ktBtn), 'Kotlin: IldsButtonSize enum');
check(/enum class IldsButtonAppearance/.test(ktBtn), 'Kotlin: IldsButtonAppearance enum');
check(/fun IldsButton\(/.test(ktBtn), 'Kotlin: IldsButton composable');
check(/fun IldsIconButton\(/.test(ktBtn), 'Kotlin: IldsIconButton composable');
check(/IldsTokens\.primaryOrange500/.test(ktBtn), 'Kotlin Button uses IldsTokens.primaryOrange500');
check(/IldsTokens\.errorRed600/.test(ktBtn), 'Kotlin Button uses IldsTokens.errorRed600');
check(/IldsTokens\.radiusLarge/.test(ktBtn), 'Kotlin Button uses IldsTokens.radiusLarge');
check(/collectIsPressedAsState/.test(ktBtn), 'Kotlin: pressed state via InteractionSource');
check((ktBtn.match(/\{/g) || []).length === (ktBtn.match(/\}/g) || []).length, 'Kotlin: braces balanced');

// ── PASS 5: cross-platform API parity ────────────────────────────────────────
section('PASS 5 — Cross-platform Button API parity');
const flutterBtn = read('lib/ilds_button.dart');
const types = ['primary', 'secondary', 'tertiary'];
const sizes = ['large', 'medium', 'small'];
const appearances = ['normal', 'destructive'];
for (const t of types) {
  check(swiftBtn.includes(`.${t}`) || swiftBtn.includes(`case ${t}`), `Swift has type: ${t}`);
  check(ktBtn.includes(t.charAt(0).toUpperCase() + t.slice(1)) || ktBtn.toLowerCase().includes(t), `Kotlin has type: ${t}`);
  check(flutterBtn.includes(t), `Flutter has type: ${t}`);
}
for (const s of sizes) {
  check(swiftBtn.includes(`.${s}`) || swiftBtn.includes(`case ${s}`), `Swift has size: ${s}`);
  check(ktBtn.includes(s.charAt(0).toUpperCase() + s.slice(1)), `Kotlin has size: ${s}`);
}
for (const a of appearances) {
  check(swiftBtn.includes(a) || swiftBtn.includes(a.charAt(0).toUpperCase() + a.slice(1)), `Swift has appearance: ${a}`);
  check(ktBtn.includes(a.charAt(0).toUpperCase() + a.slice(1)), `Kotlin has appearance: ${a}`);
}
check(swiftBtn.includes('isDisabled') && ktBtn.includes('isDisabled'), 'Disabled prop on Swift + Kotlin');
check(swiftBtn.includes('isLoading') && ktBtn.includes('isLoading'), 'Loading prop on Swift + Kotlin');
check(swiftBtn.includes('iconOnly') || swiftBtn.includes('IldsIconButton'), 'Icon-only variant exists');
check(ktBtn.includes('IldsIconButton'), 'Kotlin icon-only composable');

// ── PASS 6: state color resolution parity (spot checks) ──────────────────────
section('PASS 6 — State color resolution (Flutter ↔ native spot checks)');
const stateTokens = [
  'primaryOrange500',
  'primaryOrange600',
  'primaryOrange100',
  'errorRed600',
  'errorRed700',
  'errorRed100',
  'neutralCoolgray400',
  'neutralCoolgray50',
  'globalWhite000',
];
for (const tok of stateTokens) {
  const flutterAlias = {
    primaryOrange500: 'orange500',
    primaryOrange600: 'orange600',
    primaryOrange100: 'orange100',
    errorRed600: 'red600',
    errorRed700: 'red700',
    errorRed100: 'red100',
    neutralCoolgray400: 'neutralCoolgray400',
    neutralCoolgray50: 'neutralCoolgray50',
    globalWhite000: 'white',
  }[tok];
  check(swiftBtn.includes(tok), `Swift Button references ${tok}`);
  check(ktBtn.includes(tok), `Kotlin Button references ${tok}`);
  check(
    flutterBtn.includes(flutterAlias) || flutterBtn.includes(tok),
    `Flutter Button references ${flutterAlias || tok}`,
  );
}

// ── PASS 7: Chip component (filter chip — Figma 14018:6786) ────────────────
section('PASS 7 — Chip component (Swift + Kotlin + Flutter)');
const swiftChip = read('ios/Sources/ILDSDesignSystem/IldsChip.swift');
const ktChip = read('android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/components/IldsChip.kt');
const flutterChip = read('lib/ilds_chip.dart');
check(/public enum IldsChipSize/.test(swiftChip), 'Swift: IldsChipSize enum');
check(/public struct IldsChip/.test(swiftChip), 'Swift: IldsChip view');
check(/enum class IldsChipSize/.test(ktChip), 'Kotlin: IldsChipSize enum');
check(/fun IldsChip\(/.test(ktChip), 'Kotlin: IldsChip composable');
check(swiftChip.includes('primaryOrange50') && swiftChip.includes('primaryOrange500'), 'Swift Chip: selected colors');
check(ktChip.includes('primaryOrange50') && ktChip.includes('primaryOrange500'), 'Kotlin Chip: selected colors');
check(swiftChip.includes('neutralCoolgray200') && swiftChip.includes('neutralCoolgray300'), 'Swift Chip: disabled colors');
check(ktChip.includes('neutralCoolgray200') && ktChip.includes('neutralCoolgray300'), 'Kotlin Chip: disabled colors');
check(swiftChip.includes('radiusMedium'), 'Swift Chip: radiusMedium (4px)');
check(ktChip.includes('radiusMedium'), 'Kotlin Chip: radiusMedium');
check(flutterChip.includes('primaryOrange50') || flutterChip.includes('orange500'), 'Flutter Chip: selected state tokens');

console.log(log.join('\n'));
console.log(`\n${'─'.repeat(60)}`);
console.log(failures === 0 ? '✅ ALL PHASE 4B CHECKS PASSED' : `❌ ${failures} CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
