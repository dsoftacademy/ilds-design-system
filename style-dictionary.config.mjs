// Style Dictionary build for ILDS design tokens.
// Source of truth: tokens/tokens.json (W3C DTCG, Figma-driven).
// Outputs:
//   dist/tokens.css          — generic :root CSS custom properties
//   dist/tokens.theme.css    — Tailwind CSS v4 @theme block (primary web target for 3b)
//   dist/tailwind-tokens.js  — legacy v3 CommonJS shim (kept until 3b scaffold; delete later)
//   dist/ILDSTokens.swift    — iOS SwiftUI tokens (also copied to ios/Sources/ILDSTokens/)
//   dist/IldsTokens.kt       — Android Compose tokens (also copied to android module)
// Run: npm run build:tokens
import StyleDictionary from 'style-dictionary';

const SIZE_TYPES = ['spacing', 'borderRadius'];

const kebab = (segment) =>
  String(segment)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

const tokenType = (token) => token.$type ?? token.type;
const tokenValue = (token) => token.$value ?? token.value;
const tokenPath = (token) => token.path.filter((p) => p !== 'global');

// Names for dist/tokens.css (drop "global", kebab-case).
StyleDictionary.registerTransform({
  name: 'ilds/name/kebab',
  type: 'name',
  transform: (token) => {
    const path = tokenPath(token);
    if (path[0] === 'typography') {
      const [, group, key] = path;
      if (group === 'font-family') return `font-family-${kebab(key)}`;
      if (group === 'font-size') return `font-size-${kebab(key)}`;
      if (group === 'font-weight') return `font-weight-${kebab(key)}`;
      if (group === 'line-height') return `line-height-${kebab(key)}`;
    }
    return path.map(kebab).join('-');
  },
});

// Unitless spacing / borderRadius / font-size → px.
StyleDictionary.registerTransform({
  name: 'ilds/size/px',
  type: 'value',
  transitive: true,
  filter: (token) => {
    const type = tokenType(token);
    if (SIZE_TYPES.includes(type)) return true;
    if (type === 'dimension') {
      const path = tokenPath(token);
      return path[0] === 'typography' && path[1] === 'font-size';
    }
    return false;
  },
  transform: (token) => {
    const value = `${tokenValue(token)}`.trim();
    return value.endsWith('px') ? value : `${value}px`;
  },
});

// fontFamily → CSS font stack for web exports.
StyleDictionary.registerTransform({
  name: 'ilds/font/family',
  type: 'value',
  filter: (token) => tokenType(token) === 'fontFamily',
  transform: (token) => `'${tokenValue(token)}', sans-serif`,
});

// Tailwind v4 @theme variable name (namespace prefixes matter for utility generation).
function toThemeVar(token) {
  const path = tokenPath(token);
  const type = tokenType(token);

  if (type === 'color') {
    return `--color-${path.slice(1).map(kebab).join('-')}`;
  }
  if (type === 'spacing') {
    return `--spacing-${kebab(path[path.length - 1])}`;
  }
  if (type === 'borderRadius') {
    return `--radius-${kebab(path[path.length - 1])}`;
  }
  if (type === 'fontFamily') {
    return `--font-${kebab(path[path.length - 1])}`;
  }
  if (type === 'fontWeight') {
    return `--font-weight-${kebab(path[path.length - 1])}`;
  }
  if (type === 'dimension' && path[0] === 'typography' && path[1] === 'font-size') {
    return `--text-${kebab(path[path.length - 1])}`;
  }
  if (type === 'number' && path[0] === 'typography' && path[1] === 'line-height') {
    return `--text-${kebab(path[path.length - 1])}--line-height`;
  }
  return `--${path.map(kebab).join('-')}`;
}

// Tailwind CSS v4 — @theme block consumed via @import "./tokens.theme.css" in app CSS.
const resolvedValue = (token) => {
  if (token.value !== undefined && token.value !== null && token.value !== '') {
    return token.value;
  }
  if (token.$value !== undefined && token.$value !== null) {
    return token.$value;
  }
  if (token.original?.$value !== undefined) return token.original.$value;
  if (token.original?.value !== undefined) return token.original.value;
  return tokenValue(token);
};

StyleDictionary.registerFormat({
  name: 'ilds/tailwind-theme',
  format: ({ dictionary }) => {
    const lines = dictionary.allTokens
      .map((token) => `  ${toThemeVar(token)}: ${resolvedValue(token)};`)
      .sort();
    const whiteToken = dictionary.allTokens.find(
      (token) => toThemeVar(token) === '--color-white-000',
    );
    const blackToken = dictionary.allTokens.find(
      (token) => toThemeVar(token) === '--color-black-1000',
    );
    const aliasLines = ['  /* Phase 3b: short names (reset removes Tailwind defaults) */'];
    if (whiteToken) {
      aliasLines.push(`  --color-white: ${resolvedValue(whiteToken)};`);
    }
    if (blackToken) {
      aliasLines.push(`  --color-black: ${resolvedValue(blackToken)};`);
    }
    return (
      '/* GENERATED FILE — DO NOT EDIT BY HAND. */\n' +
      '/* Source: tokens/tokens.json  Generator: style-dictionary.config.mjs */\n' +
      '/* Regenerate: npm run build:tokens */\n' +
      '/* Tailwind CSS v4: @import "tailwindcss"; @import "./tokens.theme.css"; */\n' +
      '@theme {\n' +
      '  /* Phase 3b: reset Tailwind v4 defaults so only ILDS tokens generate utilities */\n' +
      '  --spacing: initial;\n' +
      '  --color-*: initial;\n' +
      '  --radius-*: initial;\n' +
      lines.join('\n') +
      '\n' +
      aliasLines.join('\n') +
      '\n}\n'
    );
  },
});

// Legacy v3 CommonJS theme extension (deprecated — use tokens.theme.css for new work).
StyleDictionary.registerFormat({
  name: 'ilds/tailwind',
  format: ({ dictionary }) => {
    const colors = {};
    const spacing = {};
    const borderRadius = {};
    const typography = {
      fontFamily: {},
      fontSize: {},
      fontWeight: {},
      lineHeight: {},
    };

    for (const token of dictionary.allTokens) {
      const type = tokenType(token);
      const value = resolvedValue(token);
      const path = tokenPath(token);

      if (type === 'color') {
        const [, family, shade] = path;
        if (shade === undefined) {
          colors[family] = value;
        } else {
          colors[family] = colors[family] || {};
          colors[family][shade] = value;
        }
      } else if (type === 'spacing') {
        spacing[path[path.length - 1]] = value;
      } else if (type === 'borderRadius') {
        borderRadius[path[path.length - 1]] = value;
      } else if (path[0] === 'typography') {
        const [, group, key] = path;
        if (group === 'font-family') typography.fontFamily[key] = value;
        if (group === 'font-size') typography.fontSize[key] = value;
        if (group === 'font-weight') typography.fontWeight[key] = value;
        if (group === 'line-height') typography.lineHeight[key] = value;
      }
    }

    const theme = { colors, spacing, borderRadius, typography };
    return (
      '// GENERATED FILE — DO NOT EDIT BY HAND.\n' +
      '// Source: tokens/tokens.json  Generator: style-dictionary.config.mjs\n' +
      '// Regenerate: npm run build:tokens\n' +
      '// DEPRECATED: Tailwind v3 CommonJS shim. Phase 3b uses dist/tokens.theme.css (@theme).\n' +
      `module.exports = ${JSON.stringify(theme, null, 2)};\n`
    );
  },
});

// ── Phase 4a: native platform exports (iOS Swift + Android Compose) ──────────
// Native files mirror the Flutter `ILDSTokens` faithful names (primaryOrange500,
// neutralCoolgray500, globalWhite000, sp8, radiusMedium, fontSize12, …) so a
// single token change in tokens.json reaches Flutter, web, iOS, and Android.

const cap = (key) => {
  const k = `${key}`.trim();
  if (k === '' || /^\d/.test(k)) return k;
  return k[0].toUpperCase() + k.slice(1);
};

const camel = (group) => {
  const parts = `${group}`.trim().split('-');
  return parts[0] + parts.slice(1).map((p) => (p ? cap(p) : '')).join('');
};

// '500' → '500'; 'white-000' → 'White000'
const stepSuffix = (key) => {
  const k = `${key}`.trim();
  if (/^\d+$/.test(k)) return k;
  return k.split('-').map((p) => (p ? cap(p) : '')).join('');
};

// Faithful identifier shared by Swift + Kotlin (matches Dart ILDSTokens names).
function faithfulName(token) {
  const path = tokenPath(token);
  const type = tokenType(token);
  if (type === 'color') {
    // The `global` color group (white-000/black-1000) collapses to ['color', step]
    // because tokenPath() strips every 'global' segment (set wrapper + group share
    // the name). Restore the `global` prefix to match Dart globalWhite000/Black1000.
    if (path.length === 2) return `global${stepSuffix(path[1])}`;
    return `${camel(path[1])}${stepSuffix(path[2])}`;
  }
  if (type === 'spacing') return camel(path[path.length - 1]);
  if (type === 'borderRadius') return `radius${cap(path[path.length - 1])}`;
  if (type === 'fontFamily') return `fontFamily${cap(path[path.length - 1])}`;
  if (type === 'fontWeight') return `fontWeight${cap(path[path.length - 1])}`;
  if (type === 'dimension' && path[1] === 'font-size') {
    return `fontSize${cap(path[path.length - 1])}`;
  }
  if (type === 'number' && path[1] === 'line-height') {
    return `lineHeight${path[path.length - 1]}`;
  }
  return path.map(kebab).join('-');
}

// Native name transform (faithful camelCase) — also makes token.name unique so
// Style Dictionary does not warn about name collisions on the native platforms.
StyleDictionary.registerTransform({
  name: 'ilds/name/faithful',
  type: 'name',
  transform: (token) => faithfulName(token),
});

// Untransformed source value (native platforms keep raw hex + unitless numbers).
const rawValue = (token) => `${token.original?.$value ?? token.$value ?? token.value}`.trim();

const isFontSize = (token) =>
  tokenType(token) === 'dimension' && tokenPath(token)[1] === 'font-size';
const isLineHeight = (token) =>
  tokenType(token) === 'number' && tokenPath(token)[1] === 'line-height';

const SWIFT_WEIGHT = { 400: '.regular', 500: '.medium', 700: '.bold' };
const COMPOSE_WEIGHT = {
  400: 'FontWeight.Normal',
  500: 'FontWeight.Medium',
  700: 'FontWeight.Bold',
};

// iOS — SwiftUI. dist/ILDSTokens.swift → enum ILDSTokens with Color/CGFloat/Font.Weight.
StyleDictionary.registerFormat({
  name: 'ilds/swift',
  format: ({ dictionary }) => {
    const colors = [];
    const spacing = [];
    const radius = [];
    const family = [];
    const sizes = [];
    const weights = [];
    const leading = [];
    for (const token of dictionary.allTokens) {
      const type = tokenType(token);
      const name = faithfulName(token);
      const raw = rawValue(token);
      if (type === 'color') {
        const hex = raw.replace('#', '').toUpperCase();
        colors.push(`    public static let ${name} = Color(hex: 0x${hex})`);
      } else if (type === 'spacing') {
        spacing.push(`    public static let ${name}: CGFloat = ${raw}`);
      } else if (type === 'borderRadius') {
        radius.push(`    public static let ${name}: CGFloat = ${raw}`);
      } else if (type === 'fontFamily') {
        family.push(`    public static let ${name} = "${raw}"`);
      } else if (isFontSize(token)) {
        sizes.push(`    public static let ${name}: CGFloat = ${raw}`);
      } else if (type === 'fontWeight') {
        weights.push(
          `    public static let ${name}: Font.Weight = ${SWIFT_WEIGHT[raw] ?? '.regular'}`,
        );
      } else if (isLineHeight(token)) {
        leading.push(`    public static let ${name}: CGFloat = ${raw}`);
      }
    }
    return (
      '// GENERATED FILE — DO NOT EDIT BY HAND.\n' +
      '// Source: tokens/tokens.json  Generator: style-dictionary.config.mjs\n' +
      '// Regenerate: npm run build:tokens\n' +
      'import SwiftUI\n\n' +
      'public extension Color {\n' +
      '    init(hex: UInt32, alpha: Double = 1.0) {\n' +
      '        let r = Double((hex >> 16) & 0xFF) / 255.0\n' +
      '        let g = Double((hex >> 8) & 0xFF) / 255.0\n' +
      '        let b = Double(hex & 0xFF) / 255.0\n' +
      '        self.init(.sRGB, red: r, green: g, blue: b, opacity: alpha)\n' +
      '    }\n' +
      '}\n\n' +
      'public enum ILDSTokens {\n' +
      '    // MARK: - Colors\n' +
      colors.join('\n') +
      '\n\n    // MARK: - Spacing\n' +
      spacing.join('\n') +
      '\n\n    // MARK: - Border radius\n' +
      radius.join('\n') +
      '\n\n    // MARK: - Typography\n' +
      [...family, ...sizes, ...weights, ...leading].join('\n') +
      '\n}\n'
    );
  },
});

// Android — Jetpack Compose. dist/IldsTokens.kt → object IldsTokens with Color/Dp/Sp/FontWeight.
StyleDictionary.registerFormat({
  name: 'ilds/compose',
  format: ({ dictionary }) => {
    const colors = [];
    const spacing = [];
    const radius = [];
    const family = [];
    const sizes = [];
    const weights = [];
    const leading = [];
    for (const token of dictionary.allTokens) {
      const type = tokenType(token);
      const name = faithfulName(token);
      const raw = rawValue(token);
      if (type === 'color') {
        const hex = raw.replace('#', '').toUpperCase();
        colors.push(`    val ${name} = Color(0xFF${hex})`);
      } else if (type === 'spacing') {
        spacing.push(`    val ${name} = ${raw}.dp`);
      } else if (type === 'borderRadius') {
        radius.push(`    val ${name} = ${raw}.dp`);
      } else if (type === 'fontFamily') {
        family.push(`    const val ${name} = "${raw}"`);
      } else if (isFontSize(token)) {
        sizes.push(`    val ${name} = ${raw}.sp`);
      } else if (type === 'fontWeight') {
        weights.push(`    val ${name} = ${COMPOSE_WEIGHT[raw] ?? `FontWeight(${raw})`}`);
      } else if (isLineHeight(token)) {
        leading.push(`    const val ${name} = ${raw}f`);
      }
    }
    return (
      '// GENERATED FILE — DO NOT EDIT BY HAND.\n' +
      '// Source: tokens/tokens.json  Generator: style-dictionary.config.mjs\n' +
      '// Regenerate: npm run build:tokens\n' +
      'package com.icicilombard.ilds.tokens\n\n' +
      'import androidx.compose.ui.graphics.Color\n' +
      'import androidx.compose.ui.text.font.FontWeight\n' +
      'import androidx.compose.ui.unit.dp\n' +
      'import androidx.compose.ui.unit.sp\n\n' +
      'object IldsTokens {\n' +
      '    // Colors\n' +
      colors.join('\n') +
      '\n\n    // Spacing\n' +
      spacing.join('\n') +
      '\n\n    // Border radius\n' +
      radius.join('\n') +
      '\n\n    // Typography\n' +
      [...family, ...sizes, ...weights, ...leading].join('\n') +
      '\n}\n'
    );
  },
});

const transforms = [
  'attribute/cti',
  'ilds/name/kebab',
  'color/css',
  'ilds/size/px',
  'ilds/font/family',
];

// Native platforms keep raw token values (hex + unitless); faithful unique names.
const nativeTransforms = ['attribute/cti', 'ilds/name/faithful'];

const sd = new StyleDictionary({
  source: ['tokens/tokens.json'],
  usesDtcg: true,
  platforms: {
    css: {
      transforms,
      buildPath: 'dist/',
      options: { outputReferences: false },
      files: [{ destination: 'tokens.css', format: 'css/variables' }],
    },
    tailwindTheme: {
      transforms,
      buildPath: 'dist/',
      files: [{ destination: 'tokens.theme.css', format: 'ilds/tailwind-theme' }],
    },
    tailwind: {
      transforms,
      buildPath: 'dist/',
      files: [{ destination: 'tailwind-tokens.js', format: 'ilds/tailwind' }],
    },
    swift: {
      transforms: nativeTransforms,
      buildPath: 'dist/',
      files: [{ destination: 'ILDSTokens.swift', format: 'ilds/swift' }],
    },
    swiftPackage: {
      transforms: nativeTransforms,
      buildPath: 'ios/Sources/ILDSTokens/',
      files: [{ destination: 'ILDSTokens.swift', format: 'ilds/swift' }],
    },
    compose: {
      transforms: nativeTransforms,
      buildPath: 'dist/',
      files: [{ destination: 'IldsTokens.kt', format: 'ilds/compose' }],
    },
    composeModule: {
      transforms: nativeTransforms,
      buildPath: 'android/ilds-design-system/src/main/kotlin/com/icicilombard/ilds/tokens/',
      files: [{ destination: 'IldsTokens.kt', format: 'ilds/compose' }],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
console.log(
  '✅ ILDS tokens built → dist/ + ios/Sources/ILDSTokens/ + android/ilds-design-system/.../tokens/',
);
