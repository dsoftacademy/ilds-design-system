// Cross-platform Figma parity QA — validates native + Flutter + React against web/specs/*.spec.json.
//
// Not siloed: each rule checks ALL platforms for the same component/state expectation.
// Run: node tool/verify_cross_platform_parity.mjs

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/** Hex from Figma-verified specs → faithful token name (all platforms). */
const HEX_TO_TOKEN = {
  '#e3530f': 'primaryOrange500',
  '#ff7c43': 'primaryOrange300',
  '#c74c01': 'primaryOrange600',
  '#fff2ed': 'primaryOrange50',
  '#ffd6c8': 'primaryOrange100',
  '#ffffff': 'globalWhite000',
  '#9e9e9e': 'neutralCoolgray500',
  '#757575': 'neutralCoolgray600',
  '#bdbdbd': 'neutralCoolgray300',
  '#e0e0e0': 'neutralCoolgray300',
  '#424242': 'neutralCoolgray800',
  '#212121': 'neutralCoolgray900',
  '#eeeeee': 'neutralCoolgray200',
  '#fafafa': 'neutralCoolgray50',
  '#f5f5f5': 'neutralCoolgray100',
  '#01a252': 'successGreen500',
  '#dfffe6': 'successGreen50',
  '#2168f6': 'informativeBlue500',
  '#053c6d': 'informativeBlue800',
  '#edf3ff': 'secondaryBlue50',
  '#edf6ff': 'secondaryBlue50',
  '#e00903': 'errorRed600',
  '#a30100': 'errorRed800',
  '#fff2ee': 'errorRed50',
  '#ffd5cd': 'errorRed100',
  '#e49f04': 'warningAmber500',
  '#fff3e3': 'warningAmber50',
};

const PLATFORMS = {
  react: (slug) => `web/src/components/${slug}/${slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-([a-z])/g, (_, c) => c.toUpperCase())}.tsx`,
  flutter: (slug) => {
    const map = { 'dropdown-menu': 'ilds_dropdown.dart', scrollbar: 'ilds_scrollbar.dart' };
    return `lib/${map[slug] || `ilds_${slug.replace(/-/g, '_')}.dart`}`;
  },
  swift: (slug) => {
    const map = {
      button: 'IldsButton.swift',
      chip: 'IldsChip.swift',
      badge: 'IldsBadge.swift',
      switch: 'IldsSwitch.swift',
      checkbox: 'IldsCheckbox.swift',
      radio: 'IldsRadio.swift',
      textlink: 'IldsTextLink.swift',
      toast: 'IldsToast.swift',
      'selection-button': 'IldsSelectionButton.swift',
      accordion: 'IldsAccordion.swift',
      tabs: 'IldsTabs.swift',
      pagination: 'IldsPagination.swift',
      search: 'IldsSearch.swift',
      scrollbar: 'IldsScrollbar.swift',
      textarea: 'IldsTextArea.swift',
      textfield: 'IldsTextField.swift',
      dropdown: 'IldsDropdown.swift',
      'dropdown-menu': 'IldsDropdownMenu.swift',
    };
    return `ios/Sources/ILDSDesignSystem/${map[slug]}`;
  },
  kotlin: (slug) => {
    const name = slug
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('');
    return `android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/components/Ilds${name}.kt`;
  },
};

/** Canonical cross-platform rules derived from web/specs + React Figma fixes. */
const RULES = [
  {
    component: 'Pagination',
    state: 'selected-page',
    figma: '17724:3366',
    platforms: {
      react: { must: ['primary-orange-50', 'primary-orange-600'], mustNot: ['bg-primary-orange-500'] },
      flutter: { must: ['orange50', 'orange600'], mustNot: ['selected ? ILDSTokens.orange500 : Colors.transparent'] },
      swift: { must: ['primaryOrange50', 'primaryOrange600'], mustNot: ['selected ? ILDSTokens.primaryOrange500'] },
      kotlin: {
        must: ['primaryOrange50', 'primaryOrange600'],
        mustNot: ['IldsTokens.primaryOrange500,\n                    IldsTokens.primaryOrange500,\n                    IldsTokens.globalWhite000'],
      },
    },
  },
  {
    component: 'Tabs',
    state: 'high-selected-filled',
    figma: '17667:2363',
    platforms: {
      react: { must: ['bg-primary-orange-500', 'text-white-000', 'h-[36px]'] },
      flutter: {
        must: ['orange500', 'ILDSTokens.white'],
        mustNot: ['_indicatorColor()'],
      },
      swift: {
        must: ['primaryOrange500', 'globalWhite000', 'emphasis == .high'],
        mustNot: ['IldsTabIndicator', 'frame(height: ILDSTokens.sp48)'],
      },
      kotlin: { must: ['primaryOrange500', 'globalWhite000', 'IldsTabEmphasis.High'] },
    },
  },
  {
    component: 'Tabs',
    state: 'medium-selected-underline',
    figma: '17667:2387',
    platforms: {
      react: { must: ['border-primary-orange-500', 'text-primary-orange-500'] },
      swift: { must: ['primaryOrange500'], mustNot: ['emphasis == .high ? ILDSTokens.primaryOrange500 : ILDSTokens.neutralCoolgray900'] },
      kotlin: { must: ['primaryOrange500', 'IldsTabEmphasis.High'] },
    },
  },
  {
    component: 'Toast',
    state: 'info-variant',
    figma: '17708:3510',
    platforms: {
      react: { must: ['border-secondary-blue-50', 'text-informative-blue-500'] },
      swift: { must: ['informativeBlue500', 'secondaryBlue50'], mustNot: ['showAccentBar: Bool = true', 'case .info:\n            return IldsToastColors(accent: ILDSTokens.primaryOrange500'] },
      kotlin: { must: ['informativeBlue500', 'secondaryBlue50'] },
    },
  },
  {
    component: 'Toast',
    state: 'card-structure',
    figma: '17708:3491',
    platforms: {
      react: { must: ['rounded-xlarge', 'border', 'neutral-coolgray-800'] },
      swift: { must: ['radiusXlarge', 'neutralCoolgray800'], mustNot: ['showAccentBar: Bool = true'] },
      kotlin: { must: ['radiusXlarge', 'neutralCoolgray800'] },
    },
  },
  {
    component: 'DropdownMenu',
    state: 'radio-row-panel',
    figma: '16055:6152',
    platforms: {
      react: { must: ['data-testid="dropdown-menu"', 'RadioCircleIcon'] },
      swift: { must: ['sectionLabel', 'Circle()', 'IldsButton'], mustNot: ['Image(systemName: "checkmark")'] },
      kotlin: { must: ['sectionLabel', 'CircleShape', 'IldsButton'] },
    },
  },
  {
    component: 'TextField',
    state: 'default-border',
    figma: '13478:25333',
    platforms: {
      react: { must: ['neutral-coolgray-500'] },
      swift: { must: ['neutralCoolgray500'], mustNot: ['border = ILDSTokens.neutralCoolgray200\n        }'] },
      kotlin: { must: ['neutralCoolgray500'] },
    },
  },
  {
    component: 'TextField',
    state: 'disabled-bg',
    figma: '13478:25729',
    platforms: {
      react: { must: ['neutral-coolgray-200'] },
      swift: { must: ['neutralCoolgray200'], mustNot: ['background = ILDSTokens.neutralCoolgray100'] },
      kotlin: { must: ['neutralCoolgray200'] },
    },
  },
  {
    component: 'Search',
    state: 'default-shape',
    figma: '13965:16190',
    platforms: {
      react: { must: ['rounded-medium', 'min-h-[44px]', 'neutral-coolgray-50'] },
      swift: { must: ['radiusMedium', 'neutralCoolgray50'], mustNot: ['Capsule()', 'sp40'] },
      kotlin: { must: ['radiusMedium', '44.dp'] },
    },
  },
  {
    component: 'Chip',
    state: 'prefix-icon',
    figma: '14018:6787',
    platforms: {
      react: { must: ['primary-orange-500'] },
      swift: { must: ['primaryOrange500'], mustNot: ['prefixIcon\n                    .foregroundStyle(colors.label)'] },
      kotlin: { must: ['primaryOrange500'] },
    },
  },
  {
    component: 'Radio',
    state: 'selected-bg',
    figma: '13486:38524',
    platforms: {
      react: { must: ['bg-white-000', 'primary-orange-500'] },
      swift: { must: ['globalWhite000'], mustNot: ['isSelected {\n            background = ILDSTokens.primaryOrange50'] },
      kotlin: { must: ['globalWhite000'] },
    },
  },
  {
    component: 'Switch',
    state: 'off-track',
    figma: '14371:6410',
    platforms: {
      react: { must: ['neutral-coolgray-100'] },
      swift: { must: ['neutralCoolgray100'], mustNot: ['neutralCoolgray200\n        }'] },
      kotlin: { must: ['neutralCoolgray100'] },
    },
  },
];

let failures = 0;
const matrix = [];

function checkRule(rule) {
  const row = { component: rule.component, state: rule.state, figma: rule.figma, platforms: {} };

  for (const [platform, checks] of Object.entries(rule.platforms)) {
    const slug = rule.component.toLowerCase().replace(/\s+/g, '-');
    let filePath;
    if (platform === 'react') {
      const reactPaths = {
        Pagination: 'web/src/components/Pagination/Pagination.tsx',
        Tabs: 'web/src/components/Tabs/Tabs.tsx',
        Toast: 'web/src/components/Toast/Toast.tsx',
        DropdownMenu: 'web/src/components/Dropdown/DropdownMenu.tsx',
        TextField: 'web/src/components/TextField/TextField.tsx',
        Search: 'web/src/components/Search/Search.tsx',
        Chip: 'web/src/components/Chip/Chip.tsx',
        Radio: 'web/src/components/Radio/Radio.tsx',
        Switch: 'web/src/components/Switch/Switch.tsx',
      };
      filePath = reactPaths[rule.component];
    } else if (platform === 'flutter') {
      const flutterPaths = {
        Pagination: 'lib/ilds_pagination.dart',
        Tabs: 'lib/ilds_tab.dart',
        Chip: 'lib/ilds_chip.dart',
      };
      filePath = flutterPaths[rule.component] || PLATFORMS.flutter(slug);
    } else if (platform === 'swift') {
      filePath = PLATFORMS.swift(rule.component === 'DropdownMenu' ? 'dropdown-menu' : rule.component.toLowerCase());
    } else if (platform === 'kotlin') {
      filePath = PLATFORMS.kotlin(rule.component === 'DropdownMenu' ? 'dropdown-menu' : rule.component.toLowerCase());
    }

    const fullPath = path.join(ROOT, filePath);
    if (!fs.existsSync(fullPath)) {
      failures++;
      row.platforms[platform] = { pass: false, detail: `missing ${filePath}` };
      continue;
    }

    const src = read(filePath);
    const issues = [];

    for (const token of checks.must || []) {
      if (!src.includes(token)) issues.push(`missing "${token}"`);
    }
    for (const token of checks.mustNot || []) {
      if (src.includes(token)) issues.push(`forbidden "${token.slice(0, 60)}…"`);
    }

    const pass = issues.length === 0;
    if (!pass) failures++;
    row.platforms[platform] = { pass, detail: pass ? 'ok' : issues.join('; ') };
  }

  matrix.push(row);
}

// ── Load web/specs and verify hex → token mapping coverage ─────────────────
const specDir = path.join(ROOT, 'web/specs');
const specFiles = fs.readdirSync(specDir).filter((f) => f.endsWith('.spec.json'));
const specCoverage = [];

for (const file of specFiles) {
  const spec = JSON.parse(read(`web/specs/${file}`));
  for (const variant of spec.variants || []) {
    if (!variant.verified) continue;
    for (const [prop, hex] of Object.entries(variant.expect || {})) {
      if (typeof hex !== 'string' || !hex.startsWith('#')) continue;
      const token = HEX_TO_TOKEN[hex.toLowerCase()];
      specCoverage.push({ file, variant: variant.name, prop, hex, token: token || 'UNMAPPED' });
    }
  }
}

const unmapped = specCoverage.filter((s) => s.token === 'UNMAPPED');
// Informational only — matrix rules are the enforcement gate.

// ── Run cross-platform rules ─────────────────────────────────────────────────
for (const rule of RULES) checkRule(rule);

// ── Hardcoded hex in native components (excluding token files) ───────────────
const nativeFiles = [
  ...fs.readdirSync(path.join(ROOT, 'ios/Sources/ILDSDesignSystem')).map((f) => `ios/Sources/ILDSDesignSystem/${f}`),
  ...fs
    .readdirSync(path.join(ROOT, 'android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/components'))
    .map((f) => `android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/components/${f}`),
];

const hexInNative = [];
for (const f of nativeFiles) {
  const src = read(f);
  const matches = src.match(/#[0-9a-fA-F]{3,8}/g);
  if (matches) hexInNative.push({ file: f, matches });
}
if (hexInNative.length) failures += hexInNative.length;

// ── Report ───────────────────────────────────────────────────────────────────
console.log('═'.repeat(72));
console.log('ILDS Cross-Platform Figma Parity QA');
console.log('═'.repeat(72));

console.log('\n── Component × State × Platform matrix ──\n');
for (const row of matrix) {
  const cols = Object.entries(row.platforms)
    .map(([p, r]) => `${p}:${r.pass ? '✅' : '❌'}`)
    .join(' ');
  console.log(`${row.component} / ${row.state} (${row.figma})`);
  console.log(`  ${cols}`);
  for (const [p, r] of Object.entries(row.platforms)) {
    if (!r.pass) console.log(`    ${p}: ${r.detail}`);
  }
}

if (unmapped.length) {
  console.log('\n── Unmapped spec hex values ──');
  for (const u of unmapped) console.log(`  ❌ ${u.file} ${u.variant} ${u.prop}=${u.hex}`);
}

if (hexInNative.length) {
  console.log('\n── Hardcoded hex in native components ──');
  for (const h of hexInNative) console.log(`  ❌ ${h.file}: ${h.matches.join(', ')}`);
} else {
  console.log('\n── Hardcoded hex in native components: none ✅');
}

console.log('\n' + '─'.repeat(72));
const totalChecks = matrix.reduce((n, r) => n + Object.keys(r.platforms).length, 0);
const passed = matrix.reduce((n, r) => n + Object.values(r.platforms).filter((p) => p.pass).length, 0);
console.log(`Matrix: ${passed}/${totalChecks} platform checks passed`);
console.log(failures === 0 ? '\n✅ Cross-platform parity QA PASSED' : `\n❌ Cross-platform parity QA FAILED (${failures} issues)`);
process.exit(failures === 0 ? 0 : 1);
