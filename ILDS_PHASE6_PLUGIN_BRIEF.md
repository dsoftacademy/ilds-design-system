# ILDS Unified Figma Plugin — Phase 6 Build Brief for Cursor
### Complete Implementation Brief · Version 1.0 · Apr 7, 2026
### Repo: dsoftacademy/ilds-design-system

---

## ⚠️ RULES BEFORE YOU START

1. Plugin runs in two sandboxes: **main thread** (`code.ts`) + **UI iframe** (`ui.html`). They communicate only via `figma.ui.postMessage` / `window.onmessage`.
2. **No npm packages in main thread.** Figma sandbox has no Node.js. Use vanilla TS only.
3. `fetch()` is available in main thread since Figma 2023. Use it for GitHub + Supernova calls.
4. **Never hardcode credentials.** All secrets stored in `figma.clientStorage` (persists per user per plugin).
5. All three collections must be extracted exactly as named in Figma — naming verified from live data.
6. This plugin lives at `ilds-plugin/` inside the existing repo root.

---

## SECTION 1 — WHAT THE PLUGIN DOES

Single "Sync Tokens" button in Figma. One click:

```
Figma Variables (Plugin API)
  ↓ extract + transform (DTCG)
  ├─→ GitHub: PUT tokens/tokens.json → triggers Action → Supernova
  └─→ Slack: POST notification to #design-system-updates
```

**Replaces:** n8n workflow `q6TjuM7fUilBJUtA` + `P82tigHMhMfUl25s` entirely.
**Keeps:** GitHub Action `sync-supernova.yml` (it still handles Supernova sync after push).

---

## SECTION 2 — LIVE FIGMA VARIABLE DATA (verified Apr 7 2026)

### Collections

| Collection name | Var count | Mode |
|---|---|---|
| `Colours- All` | 92 | `Mode 1` (modeId: `13097:0`) |
| `Spacing` | 12 | `Mode 1` (modeId: `13131:0`) |
| `Border radius` | 8 | `Mode 1` (modeId: `13132:0`) |

### Colour naming pattern
Format: `Group/shade` — slash is the separator.

| Figma name | Group | Key |
|---|---|---|
| `Global/white-000` | `global` | `white-000` |
| `Primary-orange/500` | `primary-orange` | `500` |
| `Secondary-maroon/600` | `secondary-maroon` | `600` |
| `Neutral- warmgray/200` | `neutral-warmgray` | `200` |
| `Neutral- coolgray/400` | `neutral-coolgray` | `400` |
| `Error-red/600` | `error-red` | `600` |
| `Warning-amber/500` | `warning-amber` | `500` |
| `Success-green/600` | `success-green` | `600` |
| `Informative-blue/500` | `informative-blue` | `500` |
| `Secondary-blue/500` | `secondary-blue` | `500` |

**Normalise rule:** lowercase, trim spaces, replace ` - ` and `- ` with `-`.
So `Neutral- warmgray` → `neutral-warmgray`.

### Spacing naming pattern
Names are plain numbers: `2, 4, 6, 8, 12, 16, 20, 24, 32, 40, 48, 56`.
Map to DTCG key: `sp-{value}` → e.g. `sp-4`, `sp-16`.

### Border radius naming pattern
Names: `null, xsmall, small, medium, large, xlarge, 2xlarge, massive`.
Map as-is to DTCG key.

---

## SECTION 3 — DTCG TRANSFORM LOGIC

### Colour (FLOAT rgb → hex)
```typescript
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
```

### Target tokens.json structure (MUST match this exactly)
```json
{
  "global": {
    "color": {
      "primary-orange": {
        "500": { "$type": "color", "$value": "#E8440C" }
      },
      "global": {
        "white-000": { "$type": "color", "$value": "#FFFFFF" }
      }
    },
    "spacing": {
      "sp-4":  { "$type": "spacing", "$value": "4" },
      "sp-16": { "$type": "spacing", "$value": "16" }
    },
    "borderRadius": {
      "medium": { "$type": "borderRadius", "$value": "4" },
      "large":  { "$type": "borderRadius", "$value": "8" }
    }
  },
  "$metadata": {
    "tokenSetOrder": ["global"]
  }
}
```

**Critical:** All tokens wrapped under `"global"` key. This matches `tokensTheme: "global"` in `supernova.settings.json`.

### Full transform function
```typescript
interface RGB { r: number; g: number; b: number; a: number }

function buildDTCG(variables: Variable[], collections: VariableCollection[]): object {
  const colMap: Record<string, VariableCollection> = {};
  collections.forEach(c => colMap[c.id] = c);

  const colorTokens: Record<string, Record<string, object>> = {};
  const spacingTokens: Record<string, object> = {};
  const radiusTokens: Record<string, object> = {};

  for (const variable of variables) {
    const col = colMap[variable.variableCollectionId];
    if (!col) continue;
    const modeId = col.modes[0].modeId;
    const value = variable.valuesByMode[modeId];
    const name = variable.name;

    if (col.name === 'Colours- All' && variable.resolvedType === 'COLOR') {
      const rgba = value as RGB;
      const hex = rgbToHex(rgba.r, rgba.g, rgba.b);
      const parts = name.split('/');
      const rawGroup = parts[0];
      const key = parts.slice(1).join('/') || name;
      // Normalise: lowercase, trim, collapse spaces around hyphens
      const group = rawGroup.toLowerCase().replace(/\s*-\s*/g, '-').replace(/\s+/g, '-');
      if (!colorTokens[group]) colorTokens[group] = {};
      colorTokens[group][key] = { '$type': 'color', '$value': hex };
    }

    if (col.name === 'Spacing' && variable.resolvedType === 'FLOAT') {
      const key = `sp-${value}`;
      spacingTokens[key] = { '$type': 'spacing', '$value': String(value) };
    }

    if (col.name === 'Border radius' && variable.resolvedType === 'FLOAT') {
      radiusTokens[name] = { '$type': 'borderRadius', '$value': String(value) };
    }
  }

  return {
    global: {
      color: colorTokens,
      spacing: spacingTokens,
      borderRadius: radiusTokens
    },
    $metadata: { tokenSetOrder: ['global'] }
  };
}
```

---

## SECTION 4 — PLUGIN FILE STRUCTURE

```
ilds-plugin/
  manifest.json       ← Figma plugin manifest
  code.ts             ← Main thread: extract vars, call APIs
  ui.html             ← UI iframe: settings panel + sync button + status
  tsconfig.json       ← Target ES2017, no module (Figma requires it)
  package.json        ← Only devDependencies (@figma/plugin-typings, typescript)
  .gitignore          ← node_modules, dist
```

---

## SECTION 5 — manifest.json

```json
{
  "name": "ILDS Token Sync",
  "id": "ilds-token-sync-001",
  "api": "1.0.0",
  "main": "code.js",
  "ui": "ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": [
      "https://api.github.com",
      "https://slack.com",
      "https://hooks.slack.com"
    ]
  }
}
```

**Note:** `networkAccess.allowedDomains` is required for fetch() calls outside Figma. List every domain the plugin calls.

---

## SECTION 6 — tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["ES2017"],
    "strict": true,
    "noImplicitAny": true,
    "typeRoots": ["./node_modules/@types", "./node_modules/@figma/plugin-typings"]
  }
}
```

---

## SECTION 7 — package.json (plugin)

```json
{
  "name": "ilds-token-sync-plugin",
  "version": "1.0.0",
  "scripts": {
    "build": "tsc -p tsconfig.json"
  },
  "devDependencies": {
    "@figma/plugin-typings": "^1.75.0",
    "typescript": "^5.0.0"
  }
}
```

---

## SECTION 8 — CREDENTIALS STORAGE

All credentials stored in `figma.clientStorage` (persisted per Figma user, not in repo).
Keys:
```typescript
const STORAGE_KEYS = {
  GITHUB_PAT:        'ilds_github_pat',
  GITHUB_OWNER:      'ilds_github_owner',     // 'dsoftacademy'
  GITHUB_REPO:       'ilds_github_repo',      // 'ilds-design-system'
  GITHUB_BRANCH:     'ilds_github_branch',    // 'main'
  GITHUB_FILE_PATH:  'ilds_github_file_path', // 'tokens/tokens.json'
  SLACK_WEBHOOK_URL: 'ilds_slack_webhook',
  COMMIT_AUTHOR_NAME:  'ilds_commit_name',    // 'ILDS Plugin'
  COMMIT_AUTHOR_EMAIL: 'ilds_commit_email',   // 'ilds@dsoft.academy'
};
```

**Default values** to pre-fill on first open:
- `GITHUB_OWNER`: `dsoftacademy`
- `GITHUB_REPO`: `ilds-design-system`
- `GITHUB_BRANCH`: `main`
- `GITHUB_FILE_PATH`: `tokens/tokens.json`
- `COMMIT_AUTHOR_NAME`: `ILDS Plugin`
- `COMMIT_AUTHOR_EMAIL`: `ilds@dsoft.academy`

---

## SECTION 9 — GITHUB API INTEGRATION

Two-step: GET current SHA → PUT new content.

```typescript
const GITHUB_API = 'https://api.github.com';

async function getCurrentFileSHA(
  owner: string, repo: string, path: string, branch: string, pat: string
): Promise<string | null> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}?ref=${branch}`;
  const res = await fetch(url, {
    headers: {
      'Authorization': `token ${pat}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });
  if (res.status === 404) return null; // file doesn't exist yet
  if (!res.ok) throw new Error(`GitHub GET failed: ${res.status}`);
  const data = await res.json() as { sha: string };
  return data.sha;
}

async function pushToGitHub(
  owner: string, repo: string, path: string, branch: string,
  pat: string, content: string, sha: string | null, message: string,
  authorName: string, authorEmail: string
): Promise<void> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`;
  const body: Record<string, unknown> = {
    message,
    content: btoa(unescape(encodeURIComponent(content))), // UTF-8 safe base64
    branch,
    committer: { name: authorName, email: authorEmail },
  };
  if (sha) body['sha'] = sha; // required for update, omit for new file

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Authorization': `token ${pat}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT failed: ${res.status} — ${err}`);
  }
}
```

**Commit message format:**
```
ci: sync Figma Variables to tokens.json [ILDS Plugin]
```

---

## SECTION 10 — SLACK INTEGRATION

```typescript
async function postToSlack(webhookUrl: string, tokenCount: number): Promise<void> {
  const body = {
    text: `🎨 *ILDS Token Sync* — Figma Variables pushed to GitHub\n• ${tokenCount} tokens extracted\n• \`tokens/tokens.json\` updated\n• Supernova sync triggered via GitHub Action`,
  };
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Slack POST failed: ${res.status}`);
}
```

---

## SECTION 11 — code.ts FULL MAIN THREAD LOGIC

```typescript
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

  // Step 3: Push to GitHub
  figma.ui.postMessage({ type: 'status', step: 'github', message: 'Pushing to GitHub...' });
  const sha = await getCurrentFileSHA(
    config.githubOwner, config.githubRepo,
    config.githubFilePath, config.githubBranch, config.githubPAT
  );
  await pushToGitHub(
    config.githubOwner, config.githubRepo,
    config.githubFilePath, config.githubBranch,
    config.githubPAT, tokensJson, sha,
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
      // Slack failure is non-fatal — log but don't throw
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

interface RGB { r: number; g: number; b: number; a: number }

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
      const rgba = rawValue as RGB;
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
    content: btoa(unescape(encodeURIComponent(content))),
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
```

---

## SECTION 12 — ui.html FULL UI

Single file. Two views: `#settings-view` and `#sync-view`. Toggle with JS.

```html
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
  body { background: #1E1E1E; color: #E0E0E0; font-size: 13px; }

  .view { display: none; flex-direction: column; height: 100vh; padding: 16px; gap: 12px; }
  .view.active { display: flex; }

  h2 { font-size: 15px; font-weight: 600; color: #FFFFFF; }
  .subtitle { font-size: 11px; color: #888; }

  .field { display: flex; flex-direction: column; gap: 4px; }
  label { font-size: 11px; color: #AAA; text-transform: uppercase; letter-spacing: 0.5px; }
  input {
    background: #2C2C2C; border: 1px solid #3A3A3A; border-radius: 6px;
    color: #E0E0E0; font-size: 13px; padding: 7px 10px; outline: none; width: 100%;
  }
  input:focus { border-color: #E8440C; }
  input[type="password"] { letter-spacing: 2px; }

  .btn {
    border: none; border-radius: 8px; cursor: pointer;
    font-size: 13px; font-weight: 600; padding: 10px 16px; width: 100%;
    transition: background 0.15s;
  }
  .btn-primary { background: #E8440C; color: #FFF; }
  .btn-primary:hover { background: #B93409; }
  .btn-primary:disabled { background: #5A2005; color: #9A5040; cursor: not-allowed; }
  .btn-secondary { background: #2C2C2C; color: #CCC; border: 1px solid #3A3A3A; }
  .btn-secondary:hover { background: #3A3A3A; }

  .status-list { display: flex; flex-direction: column; gap: 8px; flex: 1; }
  .step {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: 8px; background: #2C2C2C;
    font-size: 12px; color: #AAA;
  }
  .step.active { background: #2C1A0F; color: #E8440C; border: 1px solid #4A2010; }
  .step.done { background: #0F2C1A; color: #4CAF50; }
  .step.error { background: #2C0F0F; color: #F44336; }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
  .spinner {
    width: 14px; height: 14px; border: 2px solid #4A2010;
    border-top-color: #E8440C; border-radius: 50%;
    animation: spin 0.7s linear infinite; flex-shrink: 0;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .result-box {
    padding: 12px; border-radius: 8px; font-size: 12px; line-height: 1.5;
    display: none;
  }
  .result-box.success { background: #0F2C1A; color: #4CAF50; border: 1px solid #1A4A2A; }
  .result-box.error { background: #2C0F0F; color: #F44336; border: 1px solid #4A1A1A; }

  .row { display: flex; gap: 8px; }
  .row .btn { flex: 1; }

  a { color: #E8440C; text-decoration: none; font-size: 11px; }
  a:hover { text-decoration: underline; }
</style>
</head>
<body>

<!-- SYNC VIEW (default) -->
<div id="sync-view" class="view active">
  <div style="display:flex; justify-content:space-between; align-items:center;">
    <div>
      <h2>ILDS Token Sync</h2>
      <div class="subtitle">Figma Variables → GitHub → Supernova</div>
    </div>
    <button class="btn btn-secondary" id="open-settings-btn" style="width:auto; padding:6px 12px;">⚙ Settings</button>
  </div>

  <div class="status-list" id="steps">
    <div class="step" id="step-extract">
      <div class="dot"></div>
      <span>Read Figma Variables</span>
    </div>
    <div class="step" id="step-transform">
      <div class="dot"></div>
      <span>Transform to DTCG</span>
    </div>
    <div class="step" id="step-github">
      <div class="dot"></div>
      <span>Push to GitHub</span>
    </div>
    <div class="step" id="step-slack">
      <div class="dot"></div>
      <span>Notify Slack</span>
    </div>
  </div>

  <div class="result-box" id="result-box"></div>

  <div class="row">
    <button class="btn btn-primary" id="sync-btn">Sync Tokens</button>
  </div>
</div>

<!-- SETTINGS VIEW -->
<div id="settings-view" class="view">
  <div>
    <h2>Settings</h2>
    <div class="subtitle">Stored locally per Figma user. Never committed to repo.</div>
  </div>

  <div class="field">
    <label>GitHub Personal Access Token</label>
    <input type="password" id="github-pat" placeholder="ghp_xxxxxxxxxxxx" />
  </div>
  <div class="field">
    <label>GitHub Owner</label>
    <input type="text" id="github-owner" value="dsoftacademy" />
  </div>
  <div class="field">
    <label>GitHub Repo</label>
    <input type="text" id="github-repo" value="ilds-design-system" />
  </div>
  <div class="field">
    <label>Branch</label>
    <input type="text" id="github-branch" value="main" />
  </div>
  <div class="field">
    <label>File path</label>
    <input type="text" id="github-file-path" value="tokens/tokens.json" />
  </div>
  <div class="field">
    <label>Slack Webhook URL (optional)</label>
    <input type="text" id="slack-webhook" placeholder="https://hooks.slack.com/services/..." />
  </div>

  <div class="row">
    <button class="btn btn-secondary" id="cancel-settings-btn">Cancel</button>
    <button class="btn btn-primary" id="save-settings-btn">Save</button>
  </div>
</div>

<script>
const STEPS = ['extract', 'transform', 'github', 'slack'];

function setStepState(id, state) {
  const el = document.getElementById('step-' + id);
  if (!el) return;
  el.className = 'step' + (state ? ' ' + state : '');
  const icon = el.querySelector('.dot, .spinner');
  if (icon) icon.remove();
  const div = document.createElement('div');
  div.className = state === 'active' ? 'spinner' : 'dot';
  el.insertBefore(div, el.firstChild);
}

function resetSteps() {
  STEPS.forEach(s => setStepState(s, ''));
}

document.getElementById('open-settings-btn').onclick = () => {
  parent.postMessage({ pluginMessage: { type: 'load-config' } }, '*');
  showView('settings');
};

document.getElementById('cancel-settings-btn').onclick = () => showView('sync');

document.getElementById('save-settings-btn').onclick = () => {
  const config = {
    githubPAT:          document.getElementById('github-pat').value,
    githubOwner:        document.getElementById('github-owner').value,
    githubRepo:         document.getElementById('github-repo').value,
    githubBranch:       document.getElementById('github-branch').value,
    githubFilePath:     document.getElementById('github-file-path').value,
    slackWebhookUrl:    document.getElementById('slack-webhook').value,
    commitAuthorName:   'ILDS Plugin',
    commitAuthorEmail:  'ilds@dsoft.academy',
  };
  parent.postMessage({ pluginMessage: { type: 'save-config', config } }, '*');
};

document.getElementById('sync-btn').onclick = () => {
  resetSteps();
  document.getElementById('result-box').style.display = 'none';
  document.getElementById('sync-btn').disabled = true;
  parent.postMessage({ pluginMessage: { type: 'sync' } }, '*');
};

function showView(name) {
  document.getElementById('sync-view').classList.toggle('active', name === 'sync');
  document.getElementById('settings-view').classList.toggle('active', name === 'settings');
}

const stepMap = {
  extracting:   'extract',
  transforming: 'transform',
  github:       'github',
  slack:        'slack',
};
let lastStep = null;

window.onmessage = (event) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;

  if (msg.type === 'config-loaded') {
    const c = msg.config;
    document.getElementById('github-pat').value        = c.githubPAT || '';
    document.getElementById('github-owner').value      = c.githubOwner || 'dsoftacademy';
    document.getElementById('github-repo').value       = c.githubRepo || 'ilds-design-system';
    document.getElementById('github-branch').value     = c.githubBranch || 'main';
    document.getElementById('github-file-path').value  = c.githubFilePath || 'tokens/tokens.json';
    document.getElementById('slack-webhook').value     = c.slackWebhookUrl || '';
  }

  if (msg.type === 'config-saved') {
    showView('sync');
  }

  if (msg.type === 'status') {
    const stepId = stepMap[msg.step];
    if (lastStep) setStepState(lastStep, 'done');
    setStepState(stepId, 'active');
    lastStep = stepId;
  }

  if (msg.type === 'done') {
    if (lastStep) setStepState(lastStep, msg.result.success ? 'done' : 'error');
    const box = document.getElementById('result-box');
    box.style.display = 'block';
    if (msg.result.success) {
      box.className = 'result-box success';
      box.innerHTML = `✅ ${msg.result.tokenCount} tokens synced to GitHub.<br>
        Supernova auto-sync triggered via GitHub Action.<br>
        <a href="${msg.result.commitUrl}" target="_blank">View latest commit →</a>`;
    } else {
      box.className = 'result-box error';
      box.textContent = `❌ ${msg.result.error}`;
    }
    document.getElementById('sync-btn').disabled = false;
    lastStep = null;
  }
};
</script>
</body>
</html>
```

---

## SECTION 13 — WHAT PRATISHEK NEEDS TO PROVIDE

Before Cursor can build and you can test:

**Step 1:** GitHub PAT (already in `.env` — same one goes in plugin Settings on first open).

**Step 2:** Slack Incoming Webhook URL.
- Go to: `https://api.slack.com/apps`
- Your app → Incoming Webhooks → Add New Webhook to Workspace
- Select `#design-system-updates` → Copy URL
- Paste in plugin Settings when first running.

**Step 3:** After build, install plugin in Figma:
- Figma desktop → Plugins → Development → Import plugin from manifest
- Navigate to `ilds-plugin/manifest.json`

**Step 4:** Run once from the ILDS Master | Design file with the file open.

---

## SECTION 14 — BUILD INSTRUCTIONS FOR CURSOR

1. Create `ilds-plugin/` directory in repo root.
2. Create all files from Sections 5–8 and 11–12.
3. Run `npm install` inside `ilds-plugin/`.
4. Run `npm run build` — produces `code.js` from `code.ts`.
5. Verify `code.js` and `ui.html` exist in `ilds-plugin/`.
6. Do not add `ilds-plugin/node_modules` or `ilds-plugin/dist` to git.
7. Add `ilds-plugin/` to the root `.gitignore` exclusions except for source files.
8. Lint check: zero TypeScript errors.

---

## SECTION 15 — TESTING CHECKLIST

- [ ] Plugin opens in Figma without errors
- [ ] Settings panel loads with pre-filled defaults
- [ ] PAT saves and persists on reopen
- [ ] Sync button triggers all 4 step indicators in sequence
- [ ] `tokens.json` appears in GitHub with correct DTCG structure under `"global"` key
- [ ] GitHub Action triggers automatically after push
- [ ] Slack message appears in `#design-system-updates`
- [ ] Error case: wrong PAT → shows red error in UI, does not crash
- [ ] Error case: Slack webhook wrong → shows warning, GitHub push still succeeds
- [ ] Token count in Slack matches variable count in Figma (should be 112: 92 colours + 12 spacing + 8 radius)

---

*Phase 6 Brief · Apr 7, 2026 · ILDS Design System · dsoftacademy/ilds-design-system*
