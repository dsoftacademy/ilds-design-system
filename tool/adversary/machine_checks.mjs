/**
 * Deterministic adversary checks (machine layer) — F-001, F-002, F-003, F-008.
 */

/**
 * @typedef {{ id: string; severity: string; summary: string; evidence: string; source: 'machine' }} Finding
 */

/**
 * @param {string} content
 * @param {string} filePath
 * @returns {Finding[]}
 */
export function runMachineChecks(content, filePath) {
  if (!filePath.endsWith('.dart') || !filePath.startsWith('lib/')) {
    return [];
  }

  const findings = [];
  findings.push(...checkSpacingDerivedFontSize(content, filePath));
  findings.push(...checkCrossFamilySizingArithmetic(content, filePath));
  findings.push(...checkMissingFontFamily(content, filePath));
  findings.push(...checkRawTypographyNumbers(content, filePath));
  return findings;
}

/**
 * F-001 / F-008 — font size from spacing/border tokens
 * @returns {Finding[]}
 */
function checkSpacingDerivedFontSize(content, filePath) {
  const findings = [];
  const methodRe =
    /double\s+(_(?:label)?[Ff]ont[Ss]ize)\s*\([^)]*\)\s*(?:\{([\s\S]*?)\n\s*\}|=>\s*([^;]+);)/g;

  for (const match of content.matchAll(methodRe)) {
    const body = match[2] ?? match[3] ?? '';
    if (/ILDSTokens\.(spacing|borderWidth)/.test(body) && !/ILDSTokens\.fontSize/.test(body)) {
      findings.push({
        id: 'F-001',
        severity: 'critical',
        summary: `${match[1]} derives font size from spacing/border tokens instead of typography tokens`,
        evidence: `${filePath}: ${match[0].slice(0, 200).replace(/\s+/g, ' ')}…`,
        source: 'machine',
      });
      findings.push({
        id: 'F-008',
        severity: 'high',
        summary: 'Typography value sourced from wrong token family (spacing/border)',
        evidence: `${filePath} in ${match[1]}`,
        source: 'machine',
      });
    }
  }

  return dedupeById(findings);
}

/**
 * F-001 — spacing/border cross-family arithmetic in component sizing helpers
 * @returns {Finding[]}
 */
function checkCrossFamilySizingArithmetic(content, filePath) {
  const findings = [];
  const methodRe =
    /double\s+(_(?:inner|outer)?[Ss]ize\w*)\s*\([^)]*\)\s*(?:\{([\s\S]*?)\n\s*\}|=>\s*([^;]+);)/g;

  for (const match of content.matchAll(methodRe)) {
    const body = match[2] ?? match[3] ?? '';
    const usesSpacing = /ILDSTokens\.spacing/.test(body);
    const usesBorder = /ILDSTokens\.borderWidth/.test(body);
    const usesTypography = /ILDSTokens\.fontSize/.test(body);
    const hasCrossFamilyMath =
      (usesSpacing && usesBorder && /[+\-*/]/.test(body)) ||
      (usesSpacing && usesBorder && body.includes('/'));

    if (hasCrossFamilyMath && !usesTypography) {
      findings.push({
        id: 'F-001',
        severity: 'critical',
        summary: `${match[1]} uses spacing/border token arithmetic instead of a proper size token`,
        evidence: `${filePath}: ${match[0].slice(0, 200).replace(/\s+/g, ' ')}…`,
        source: 'machine',
      });
    }
  }

  return dedupeById(findings);
}

/**
 * F-002 — TextStyle missing fontFamily
 * @returns {Finding[]}
 */
function checkMissingFontFamily(content, filePath) {
  const findings = [];
  const blocks = extractTextStyleBlocks(content);

  for (const block of blocks) {
    if (!block.includes('fontFamily: ILDSTokens.fontFamilyPrimary')) {
      findings.push({
        id: 'F-002',
        severity: 'critical',
        summary: 'TextStyle missing fontFamily: ILDSTokens.fontFamilyPrimary',
        evidence: `${filePath}: ${block.slice(0, 180).replace(/\s+/g, ' ')}…`,
        source: 'machine',
      });
    }
  }

  return findings;
}

/**
 * F-003 — raw numeric fontSize/height
 * @returns {Finding[]}
 */
function checkRawTypographyNumbers(content, filePath) {
  const findings = [];
  const blocks = extractTextStyleBlocks(content);

  for (const block of blocks) {
    if (/fontSize:\s*\d/.test(block)) {
      findings.push({
        id: 'F-003',
        severity: 'high',
        summary: 'Raw numeric fontSize instead of ILDSTokens.*',
        evidence: `${filePath}: ${block.slice(0, 180).replace(/\s+/g, ' ')}…`,
        source: 'machine',
      });
    }
    if (/height:\s*\d/.test(block) && !/ILDSTokens\.lineHeight/.test(block)) {
      findings.push({
        id: 'F-003',
        severity: 'high',
        summary: 'Raw numeric height instead of ILDSTokens lineHeight token',
        evidence: `${filePath}: ${block.slice(0, 180).replace(/\s+/g, ' ')}…`,
        source: 'machine',
      });
    }
  }

  return findings;
}

/**
 * @param {string} source
 */
function extractTextStyleBlocks(source) {
  const blocks = [];
  const pattern = /TextStyle\s*\(/g;
  for (const match of source.matchAll(pattern)) {
    const start = match.index;
    let depth = 0;
    let index = match.index + match[0].length - 1;
    while (index < source.length) {
      const char = source[index];
      if (char === '(') depth += 1;
      else if (char === ')') {
        depth -= 1;
        if (depth === 0) {
          blocks.push(source.slice(start, index + 1));
          break;
        }
      }
      index += 1;
    }
  }
  return blocks;
}

/**
 * @param {Finding[]} findings
 */
function dedupeById(findings) {
  const seen = new Set();
  return findings.filter((f) => {
    const key = `${f.id}:${f.evidence.slice(0, 80)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * @param {Array<{ filename: string; patch?: string; status?: string }>} files
 * @param {(path: string) => string | null} readFile
 */
export function runMachineChecksOnPrFiles(files, readFile) {
  const all = [];
  for (const file of files) {
    if (!file.filename?.endsWith('.dart')) continue;
    const content = readFile(file.filename);
    if (!content) continue;
    all.push(...runMachineChecks(content, file.filename));
  }
  return dedupeById(all);
}
