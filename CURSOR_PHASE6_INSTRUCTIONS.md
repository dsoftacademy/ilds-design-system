# CURSOR: Build ILDS Token Sync Figma Plugin
## Execute all steps below exactly. Zero placeholders. Zero skips.

---

## CONTEXT

Repo root: wherever this file lives (`ilds-design-system/`).
Plugin lives at: `ilds-design-system/ilds-plugin/` — already created.
Goal: populate all plugin files, install deps, compile TypeScript to `code.js`.

---

## STEP 1 — Verify directory exists

Run this from repo root:
```bash
ls ilds-plugin/
```

Expected output (files already created by Claude):
```
.gitignore  code.ts  manifest.json  package.json  tsconfig.json  ui.html
```

If the directory is missing, create it:
```bash
mkdir -p ilds-plugin
```

---

## STEP 2 — Confirm package.json is correct

File: `ilds-plugin/package.json`
Must contain exactly:

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

If it does not match, overwrite it with the content above.

---

## STEP 3 — Confirm tsconfig.json is correct

File: `ilds-plugin/tsconfig.json`
Must contain exactly:

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

## STEP 4 — Confirm manifest.json is correct

File: `ilds-plugin/manifest.json`
Must contain exactly:

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

---

## STEP 5 — Confirm code.ts is correct

File: `ilds-plugin/code.ts`
Must contain exactly this content (overwrite if different):

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

interface RGB { r: number; g: number; b: number; a: number }

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

## STEP 6 — Confirm ui.html is correct

File: `ilds-plugin/ui.html`
Must contain exactly this content (overwrite if different):

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

## STEP 7 — Confirm .gitignore is correct

File: `ilds-plugin/.gitignore`
Must contain:

```
node_modules/
dist/
code.js
```

---

## STEP 8 — Install dependencies

Run these commands INSIDE the `ilds-plugin/` subdirectory — NOT repo root:

```bash
cd ilds-plugin
npm install
```

Expected: installs `typescript` and `@figma/plugin-typings` into `ilds-plugin/node_modules/`.

---

## STEP 9 — Build (compile TypeScript)

Still inside `ilds-plugin/`:

```bash
npm run build
```

This runs `tsc -p tsconfig.json`.

Expected output: **zero errors**, produces `ilds-plugin/code.js`.

If you see TypeScript errors, report them back verbatim.

---

## STEP 10 — Verify build output

```bash
ls ilds-plugin/
```

Must see `code.js` in the listing alongside `ui.html`, `manifest.json`, `code.ts`.

---

## STEP 11 — Done. Report back

Reply with:
1. Whether `npm run build` succeeded or failed
2. If failed: full error output
3. If succeeded: confirm `code.js` exists and its file size

---

## DO NOT:
- Run `npm install` or `npm run build` in the repo root — only inside `ilds-plugin/`
- Add `code.js` to git (it's in `.gitignore`)
- Modify any file content unless confirming it matches the spec above
