// Style Dictionary build for ILDS design tokens.
// Source of truth: tokens/tokens.json (W3C DTCG, Figma-driven).
// Outputs:
//   dist/tokens.css          — generic :root CSS custom properties
//   dist/tokens.theme.css    — Tailwind CSS v4 @theme block (primary web target for 3b)
//   dist/tailwind-tokens.js  — legacy v3 CommonJS shim (kept until 3b scaffold; delete later)
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

const transforms = [
  'attribute/cti',
  'ilds/name/kebab',
  'color/css',
  'ilds/size/px',
  'ilds/font/family',
];

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
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
console.log(
  '✅ ILDS tokens built → dist/tokens.css + dist/tokens.theme.css + dist/tailwind-tokens.js',
);
