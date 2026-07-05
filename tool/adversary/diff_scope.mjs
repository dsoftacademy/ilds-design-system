/**
 * Classify findings as introduced in the PR diff vs pre-existing in touched files.
 */

/**
 * @param {string} evidence
 * @returns {string | null}
 */
export function extractFileFromEvidence(evidence) {
  const m = evidence.match(/^([\w./-]+\.dart)/);
  return m?.[1] ?? null;
}

/**
 * @param {{ evidence?: string; summary?: string }} finding
 * @returns {string}
 */
export function extractAnchor(finding) {
  const text = `${finding.evidence ?? ''} ${finding.summary ?? ''}`;
  const method = text.match(/(_(?:label)?[Ff]ont[Ss]ize|_innerSize|_outerSize)\(\)/);
  if (method) return method[1];

  const backtick = text.match(/`([^`]+)`/);
  if (backtick) return backtick[1].replace(/\(\)$/, '');

  const inClause = text.match(/\bin (_\w+)/);
  if (inClause) return inClause[1];

  return '';
}

/**
 * @param {string} patch
 * @param {string} anchor
 */
function anchorTouchedInPatch(patch, anchor) {
  if (!anchor || !patch) return false;
  return patch.split('\n').some((line) => {
    if (!line.startsWith('+') && !line.startsWith('-')) return false;
    return line.includes(anchor);
  });
}

/**
 * @param {{ evidence?: string; summary?: string; file?: string }} finding
 * @param {Array<{ filename: string; patch?: string; status?: string }>} prFiles
 */
export function isIntroducedInDiff(finding, prFiles) {
  const filePath = finding.file ?? extractFileFromEvidence(finding.evidence ?? '');
  if (!filePath) return true;

  const prFile = prFiles.find((f) => f.filename === filePath);
  if (!prFile) return false;
  if (prFile.status === 'added') return true;

  const anchor = finding.anchor ?? extractAnchor(finding);
  if (anchor) {
    return anchorTouchedInPatch(prFile.patch ?? '', anchor);
  }

  return Boolean(prFile.patch?.split('\n').some((l) => l.startsWith('+')));
}

/**
 * @param {Array<object>} findings
 * @param {Array<{ filename: string; patch?: string; status?: string }>} prFiles
 */
export function enrichFindingsWithScope(findings, prFiles) {
  return findings.map((f) => {
    const file = f.file ?? extractFileFromEvidence(f.evidence ?? '');
    const anchor = f.anchor ?? extractAnchor(f);
    const introduced = isIntroducedInDiff({ ...f, file, anchor }, prFiles);
    return { ...f, file, anchor, introduced };
  });
}
