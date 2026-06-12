// Style Dictionary build for ILDS design tokens.
// Source of truth: tokens/tokens.json (W3C DTCG, Figma-driven).
// Outputs: dist/tokens.css (CSS custom properties) + dist/tailwind-tokens.js (Tailwind theme extension).
// Run: npm run build:tokens   (node style-dictionary.config.mjs)
import StyleDictionary from 'style-dictionary';

const SIZE_TYPES = ['spacing', 'borderRadius'];

const kebab = (segment) =>
  String(segment)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

const tokenType = (token) => token.$type ?? token.type;
const tokenValue = (token) => token.$value ?? token.value;

// Names: drop the top-level "global" set and kebab-case each segment.
// e.g. global.color.primary-orange.500 -> --color-primary-orange-500
StyleDictionary.registerTransform({
  name: 'ilds/name/kebab',
  type: 'name',
  transform: (token) => token.path.filter((p) => p !== 'global').map(kebab).join('-'),
});

// spacing / borderRadius arrive as unitless strings ("4"); emit px.
StyleDictionary.registerTransform({
  name: 'ilds/size/px',
  type: 'value',
  transitive: true,
  filter: (token) => SIZE_TYPES.includes(tokenType(token)),
  transform: (token) => {
    const value = `${tokenValue(token)}`.trim();
    return value.endsWith('px') ? value : `${value}px`;
  },
});

// Tailwind theme extension: nested raw values grouped by family/type.
StyleDictionary.registerFormat({
  name: 'ilds/tailwind',
  format: ({ dictionary }) => {
    const colors = {};
    const spacing = {};
    const borderRadius = {};

    for (const token of dictionary.allTokens) {
      const type = tokenType(token);
      const value = tokenValue(token);
      const path = token.path.filter((p) => p !== 'global');

      if (type === 'color') {
        const [, family, shade] = path; // ['color', family, shade?]
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
      }
    }

    const theme = { colors, spacing, borderRadius };
    return (
      '// GENERATED FILE — DO NOT EDIT BY HAND.\n' +
      '// Source: tokens/tokens.json  Generator: style-dictionary.config.mjs\n' +
      '// Regenerate: npm run build:tokens\n' +
      `module.exports = ${JSON.stringify(theme, null, 2)};\n`
    );
  },
});

const transforms = ['attribute/cti', 'ilds/name/kebab', 'color/css', 'ilds/size/px'];

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
    tailwind: {
      transforms,
      buildPath: 'dist/',
      files: [{ destination: 'tailwind-tokens.js', format: 'ilds/tailwind' }],
    },
  },
});

await sd.cleanAllPlatforms();
await sd.buildAllPlatforms();
console.log('✅ ILDS tokens built → dist/tokens.css + dist/tailwind-tokens.js');
