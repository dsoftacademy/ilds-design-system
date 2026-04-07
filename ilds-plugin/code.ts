/// <reference types="@figma/plugin-typings" />

// ── Types ─────────────────────────────────────────────────────────────────────

interface Config {
  githubPAT: string;
  githubOwner: string;
  githubRepo: string;
  githubBranch: string;
  githubFilePath: string;
  slackWebhookUrl: string;
  commitAuthorName: string;
  commitAuthorEmail: string;
}

interface SyncResult {
  success: boolean;
  tokenCount: number;
  commitUrl?: string;
  error?: string;
}

interface FigmaColor { r: number; g: number; b: number; a: number }

// Pure TS base64 — btoa/unescape unavailable in Figma plugin sandbox
function toBase64(str: string): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    if (c < 0x80) {
      bytes.push(c);
    } else if (c < 0x800) {
      bytes.push(0xC0 | (c >> 6), 0x80 | (c & 0x3F));
    } else {
      bytes.push(0xE0 | (c >> 12), 0x80 | ((c >> 6) & 0x3F), 0x80 | (c & 0x3F));
    }
  }
  let out = '';
  for (let i = 0; i < bytes.length; i += 3) {
    const b0 = bytes[i], b1 = bytes[i + 1] ?? 0, b2 = bytes[i + 2] ?? 0;
    out += chars[b0 >> 2];
    out += chars[((b0 & 3) << 4) | (b1 >> 4)];
    out += i + 1 < bytes.length ? chars[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    out += i + 2 < bytes.length ? chars[b2 & 63] : '=';
  }
  return out;
}

// ── Entry ──────────────────────────────────────────────────────────────────────

figma.showUI(__html__, { width: 400, height: 520, title: 'ILDS Token Sync' });

figma.ui.onmessage = async (msg: { type: string; config?: Config }) => {
  if (msg.type === 'load-config') {
    const stored = await loadConfig();
    figma.ui.postMessage({ type: 'config-loaded', config: stored });
  }

  if (msg.type === 'save-config' && msg.config) {
    await saveConfig(msg.config);
    figma.ui.postMessage({ type: 'config-saved' });
  }

  if (msg.type === 'sync') {
    figma.ui.postMessage({ type: 'status', step: 'extracting', message: 'Reading Figma Variables...' });
    try {
      const result = await runSync();
      figma.ui.postMessage({ type: 'done', result });
    } catch (e) {
      const err = e instanceof Error ? e.message : String(e);
      figma.ui.postMessage({ type: 'done', result: { success: false, tokenCount: 0, error: err } });
    }
  }
};

// ── Core sync ─────────────────────────────────────────────────────────────────

async function runSync(): Promise<SyncResult> {
  const config = await loadConfig();
  if (!config.githubPAT) throw new Error('GitHub PAT not configured. Open Settings first.');

  // Step 1: Extract variables
  const [variables, collections] = await Promise.all([
    figma.variables.getLocalVariablesAsync(),
    figma.variables.getLocalVariableCollectionsAsync(),
  ]);

  figma.ui.postMessage({ type: 'status', step: 'transforming', message: `Transforming ${variables.length} variables...` });

  // Step 2: Transform to DTCG
  const dtcg = buildDTCG(variables, collections);
  const tokensJson = JSON.stringify(dtcg, null, 2);
  const tokenCount = variables.length;

  // Step 3: Push to GitHub (with 409 retry for stale SHA)
  figma.ui.postMessage({ type: 'status', step: 'github', message: 'Pushing to GitHub...' });
  await pushWithRetry(
    config.githubOwner, config.githubRepo,
    config.githubFilePath, config.githubBranch,
    config.githubPAT, tokensJson,
    `ci: sync Figma Variables to tokens.json [ILDS Plugin]`,
    config.commitAuthorName, config.commitAuthorEmail
  );

  const commitUrl = `https://github.com/${config.githubOwner}/${config.githubRepo}/commits/${config.githubBranch}`;

  // Step 4: Slack notification (non-blocking)
  if (config.slackWebhookUrl) {
    figma.ui.postMessage({ type: 'status', step: 'slack', message: 'Notifying Slack...' });
    try {
      await postToSlack(config.slackWebhookUrl, tokenCount);
    } catch (e) {
      console.warn('Slack notification failed:', e);
    }
  }

  return { success: true, tokenCount, commitUrl };
}

// ── Storage ───────────────────────────────────────────────────────────────────

async function loadConfig(): Promise<Config> {
  const keys = [
    'ilds_github_pat', 'ilds_github_owner', 'ilds_github_repo',
    'ilds_github_branch', 'ilds_github_file_path',
    'ilds_slack_webhook', 'ilds_commit_name', 'ilds_commit_email'
  ];
  const values = await Promise.all(keys.map(k => figma.clientStorage.getAsync(k)));
  return {
    githubPAT:          (values[0] as string) || '',
    githubOwner:        (values[1] as string) || 'dsoftacademy',
    githubRepo:         (values[2] as string) || 'ilds-design-system',
    githubBranch:       (values[3] as string) || 'main',
    githubFilePath:     (values[4] as string) || 'tokens/tokens.json',
    slackWebhookUrl:    (values[5] as string) || '',
    commitAuthorName:   (values[6] as string) || 'ILDS Plugin',
    commitAuthorEmail:  (values[7] as string) || 'ilds@dsoft.academy',
  };
}

async function saveConfig(config: Config): Promise<void> {
  await Promise.all([
    figma.clientStorage.setAsync('ilds_github_pat',        config.githubPAT),
    figma.clientStorage.setAsync('ilds_github_owner',      config.githubOwner),
    figma.clientStorage.setAsync('ilds_github_repo',       config.githubRepo),
    figma.clientStorage.setAsync('ilds_github_branch',     config.githubBranch),
    figma.clientStorage.setAsync('ilds_github_file_path',  config.githubFilePath),
    figma.clientStorage.setAsync('ilds_slack_webhook',     config.slackWebhookUrl),
    figma.clientStorage.setAsync('ilds_commit_name',       config.commitAuthorName),
    figma.clientStorage.setAsync('ilds_commit_email',      config.commitAuthorEmail),
  ]);
}

// ── Transform ─────────────────────────────────────────────────────────────────

function rgbToHex(r: number, g: number, b: number): string {
  const h = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`.toUpperCase();
}

function normaliseGroup(raw: string): string {
  return raw.toLowerCase().trim().replace(/\s*-\s*/g, '-').replace(/\s+/g, '-');
}

function buildDTCG(variables: Variable[], collections: VariableCollection[]): object {
  const colMap: Record<string, VariableCollection> = {};
  collections.forEach(c => { colMap[c.id] = c; });

  const colorTokens: Record<string, Record<string, object>> = {};
  const spacingTokens: Record<string, object> = {};
  const radiusTokens: Record<string, object> = {};

  for (const variable of variables) {
    const col = colMap[variable.variableCollectionId];
    if (!col) continue;
    const modeId = col.modes[0].modeId;
    const rawValue = variable.valuesByMode[modeId];

    if (col.name === 'Colours- All' && variable.resolvedType === 'COLOR') {
      const rgba = rawValue as FigmaColor;
      const hex = rgbToHex(rgba.r, rgba.g, rgba.b);
      const slashIdx = variable.name.indexOf('/');
      if (slashIdx === -1) continue;
      const group = normaliseGroup(variable.name.substring(0, slashIdx));
      const key = variable.name.substring(slashIdx + 1);
      if (!colorTokens[group]) colorTokens[group] = {};
      colorTokens[group][key] = { '$type': 'color', '$value': hex };
    }

    if (col.name === 'Spacing' && variable.resolvedType === 'FLOAT') {
      const val = rawValue as number;
      spacingTokens[`sp-${val}`] = { '$type': 'spacing', '$value': String(val) };
    }

    if (col.name === 'Border radius' && variable.resolvedType === 'FLOAT') {
      const val = rawValue as number;
      radiusTokens[variable.name] = { '$type': 'borderRadius', '$value': String(val) };
    }
  }

  return {
    global: { color: colorTokens, spacing: spacingTokens, borderRadius: radiusTokens },
    $metadata: { tokenSetOrder: ['global'] },
  };
}

// ── GitHub API ────────────────────────────────────────────────────────────────

// Retry once on 409 (stale SHA — happens when GH Action commits between our GET and PUT)
async function pushWithRetry(
  owner: string, repo: string, path: string, branch: string,
  pat: string, content: string, message: string,
  authorName: string, authorEmail: string
): Promise<void> {
  let sha = await getCurrentFileSHA(owner, repo, path, branch, pat);
  try {
    await pushToGitHub(owner, repo, path, branch, pat, content, sha, message, authorName, authorEmail);
  } catch (e) {
    if (e instanceof Error && e.message.includes('409')) {
      // SHA went stale — fetch fresh and retry once
      sha = await getCurrentFileSHA(owner, repo, path, branch, pat);
      await pushToGitHub(owner, repo, path, branch, pat, content, sha, message, authorName, authorEmail);
    } else {
      throw e;
    }
  }
}

async function getCurrentFileSHA(
  owner: string, repo: string, path: string, branch: string, pat: string
): Promise<string | null> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}?ref=${branch}`,
    { headers: { Authorization: `token ${pat}`, Accept: 'application/vnd.github.v3+json' } }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  return ((await res.json()) as { sha: string }).sha;
}

async function pushToGitHub(
  owner: string, repo: string, path: string, branch: string,
  pat: string, content: string, sha: string | null,
  message: string, authorName: string, authorEmail: string
): Promise<void> {
  const body: Record<string, unknown> = {
    message,
    content: toBase64(content),
    branch,
    committer: { name: authorName, email: authorEmail },
  };
  if (sha) body['sha'] = sha;
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${pat}`,
        'Content-Type': 'application/json',
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) throw new Error(`GitHub PUT failed: ${res.status} — ${await res.text()}`);
}

// ── Slack ─────────────────────────────────────────────────────────────────────

async function postToSlack(webhookUrl: string, tokenCount: number): Promise<void> {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🎨 *ILDS Token Sync* — Figma Variables pushed to GitHub\n• ${tokenCount} tokens extracted\n• \`tokens/tokens.json\` updated\n• Supernova sync auto-triggered via GitHub Action`
    }),
  });
  if (!res.ok) throw new Error(`Slack failed: ${res.status}`);
}
