#!/usr/bin/env node
/**
 * Syncs Figma Variables → tokens/tokens.json (W3C DTCG format).
 *
 * Usage:
 *   FIGMA_ACCESS_TOKEN=<token> node tool/sync_figma_tokens.mjs
 *
 * The token must have file_variables:read scope (not just file_content:read).
 * Get one at figma.com → Settings → Security → Personal access tokens.
 *
 * Output:
 *   tokens/tokens.json is rewritten if Figma variables differ from current file.
 *   Exits 0 with no write if already up to date.
 *   Exits 1 on any error.
 *
 * This script does NOT run build:tokens. The CI workflow does that separately
 * after merging the PR that this script's output generates.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOKENS_PATH = path.resolve(__dirname, '../tokens/tokens.json');
const FILE_KEY = 'PCUj412f0Z1zZLLxQUX22e';

// ─── Auth ──────────────────────────────────────────────────────────────────

const FIGMA_ACCESS_TOKEN = process.env.FIGMA_ACCESS_TOKEN;
if (!FIGMA_ACCESS_TOKEN) {
  console.error('ERROR: FIGMA_ACCESS_TOKEN is not set.');
  console.error('  export FIGMA_ACCESS_TOKEN=<your personal access token>');
  console.error('  Or add it to .env and run: source .env');
  process.exit(1);
}

// ─── Fetch ─────────────────────────────────────────────────────────────────

console.log(`Fetching variables from Figma file ${FILE_KEY}…`);
const res = await fetch(
  `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
  { headers: { 'X-Figma-Token': FIGMA_ACCESS_TOKEN } }
);

if (!res.ok) {
  const body = await res.text();
  console.error(`Figma API error ${res.status}: ${body}`);
  process.exit(1);
}

const { meta } = await res.json();
const { variables, variableCollections } = meta;

// ─── Alias resolution ──────────────────────────────────────────────────────

const varById = Object.fromEntries(
  Object.values(variables).map((v) => [v.id, v])
);

function resolveValue(value, seen = new Set()) {
  if (value?.type !== 'VARIABLE_ALIAS') return value;

  if (seen.has(value.id)) {
    throw new Error(`Circular alias detected: ${value.id}`);
  }
  seen.add(value.id);

  const ref = varById[value.id];
  if (!ref) {
    throw new Error(`Unresolved alias: ${value.id}`);
  }

  const collection = variableCollections[ref.variableCollectionId];
  if (!collection) {
    throw new Error(`Collection not found for variable ${value.id}`);
  }

  return resolveValue(ref.valuesByMode[collection.defaultModeId], seen);
}

// ─── Color conversion ──────────────────────────────────────────────────────

function figmaColorToHex({ r, g, b }) {
  const toHexByte = (c) =>
    Math.round(c * 255)
      .toString(16)
      .padStart(2, '0')
      .toUpperCase();
  return `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
}

// ─── Type mapping ──────────────────────────────────────────────────────────

function dtcgType(resolvedType, variableName) {
  if (resolvedType === 'COLOR') return 'color';
  if (resolvedType === 'STRING') {
    if (variableName.includes('font-family')) return 'fontFamily';
    return 'string';
  }
  if (resolvedType === 'FLOAT') {
    if (variableName.includes('spacing') || variableName.includes('borderRadius')) {
      return 'spacing';
    }
    if (variableName.includes('font-size')) return 'dimension';
    if (variableName.includes('font-weight')) return 'fontWeight';
    if (variableName.includes('line-height')) return 'dimension';
    return 'number';
  }
  if (resolvedType === 'BOOLEAN') return 'boolean';
  return resolvedType.toLowerCase();
}

// ─── Nested object builder ──────────────────────────────────────────────────

function setNested(obj, pathParts, value) {
  const [head, ...tail] = pathParts;
  if (tail.length === 0) {
    obj[head] = value;
    return;
  }
  if (obj[head] === undefined) obj[head] = {};
  setNested(obj[head], tail, value);
}

// ─── Transform ─────────────────────────────────────────────────────────────

const output = {};

for (const collection of Object.values(variableCollections)) {
  const { name: collectionName, defaultModeId, variableIds } = collection;

  for (const varId of variableIds) {
    const variable = variables[varId];
    if (!variable) continue;

    const rawValue = variable.valuesByMode[defaultModeId];
    let resolvedRaw;

    try {
      resolvedRaw = resolveValue(rawValue);
    } catch (err) {
      console.warn(`  WARN: Skipping ${variable.name} — ${err.message}`);
      continue;
    }

    let $value;
    if (variable.resolvedType === 'COLOR') {
      $value = figmaColorToHex(resolvedRaw);
    } else if (variable.resolvedType === 'FLOAT') {
      const num = resolvedRaw;
      const name = variable.name;
      if (
        name.includes('spacing') ||
        name.includes('borderRadius') ||
        name.includes('font-size') ||
        name.includes('line-height')
      ) {
        $value = String(num);
      } else {
        $value = num;
      }
    } else {
      $value = resolvedRaw;
    }

    const $type = dtcgType(variable.resolvedType, variable.name);
    const pathParts = [collectionName, ...variable.name.split('/')];
    setNested(output, pathParts, { $type, $value });
  }
}

const collectionNames = Object.values(variableCollections).map((c) => c.name);
output.$metadata = { tokenSetOrder: collectionNames };

// ─── Write ─────────────────────────────────────────────────────────────────

const existing = readFileSync(TOKENS_PATH, 'utf8');
const newContent = JSON.stringify(output, null, 2) + '\n';

if (existing === newContent) {
  console.log('✅ tokens/tokens.json is already in sync with Figma. No changes.');
  process.exit(0);
}

writeFileSync(TOKENS_PATH, newContent);
console.log('✅ tokens/tokens.json updated from Figma.');

const oldKeys = Object.keys(JSON.parse(existing).global?.color ?? {}).length;
const newKeys = Object.keys(output.global?.color ?? {}).length;
console.log(`   Color groups: ${oldKeys} → ${newKeys}`);
