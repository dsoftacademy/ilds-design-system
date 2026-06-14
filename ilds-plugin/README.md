# ILDS Token Sync — Figma Plugin

Syncs **Figma Variables → `tokens/tokens.json` → GitHub** using the Figma **Plugin API** (no Enterprise REST scope required).

## When to use this vs `npm run sync:tokens`

| Tool | Works on your plan? |
|------|---------------------|
| **This plugin** (`ilds-plugin/`) | ✅ Yes — Plugin API inside Figma |
| `npm run sync:tokens` (REST) | ❌ No — needs Figma Enterprise `file_variables:read` |

## Prerequisites

1. **Figma file open:** `ILDS Master | Design` (`PCUj412f0Z1zZLLxQUX22e`) — variables are **local to this file**
2. **Edit access** to that file
3. **GitHub PAT** with `repo` scope (write access to `dsoftacademy/ilds-design-system`)
4. **Plugin built:** `code.js` must exist (see Build below)

### Figma variable collections (names must match exactly)

| Collection | Count | Synced? |
|------------|-------|---------|
| `Colours- All` | 92 colors | ✅ |
| `Spacing` | 12 | ✅ |
| `Border radius` | 8 | ✅ |
| Typography | — | ❌ Preserved from existing `tokens.json` (Phase 8) |

## Build & install (one-time per machine)

```bash
cd ilds-plugin
npm install
npm run build    # code.ts → code.js (code.js is gitignored)
```

In Figma desktop app:

1. **Plugins → Development → Import plugin from manifest…**
2. Select `ilds-plugin/manifest.json`
3. Plugin appears as **ILDS Token Sync**

After editing `code.ts`, run `npm run build` again and re-run the plugin in Figma.

## Configure settings (one-time per Figma user)

1. Open **ILDS Master | Design** in Figma
2. **Plugins → Development → ILDS Token Sync**
3. Click **⚙ Settings**
4. Fill in:

| Field | Value |
|-------|-------|
| GitHub Personal Access Token | `ghp_…` or fine-grained token with **Contents: Read and write** on `ilds-design-system` |
| GitHub Owner | `dsoftacademy` |
| GitHub Repo | `ilds-design-system` |
| Branch | `main` |
| File path | `tokens/tokens.json` |
| Slack Webhook URL | *(optional)* |

5. Click **Save** — stored in `figma.clientStorage` (not in repo)

### Create a GitHub PAT

GitHub → **Settings → Developer settings → Personal access tokens**

- **Classic:** enable `repo` scope
- **Fine-grained:** repository access = `ilds-design-system`, Permissions → Contents = Read and write

## Sync workflow

1. Designer updates Variables in Figma (`Colours- All`, `Spacing`, `Border radius`)
2. Open **ILDS Master | Design**
3. Run **ILDS Token Sync** → **Sync Tokens**

Plugin steps:

```
Read Figma Variables  →  Transform to DTCG  →  Merge with tokens.json  →  Push to GitHub
```

Commit message: `ci: sync Figma Variables to tokens.json [ILDS Plugin]`

### What happens on GitHub after push

```
tokens/tokens.json updated on main
  ├─► build-tokens.yml     → dist/* + Swift + Kotlin + Flutter (auto-commit)
  └─► sync-supernova.yml   → Supernova DS 771068
```

Verify in GitHub **Actions** tab (~2–5 min):

- ✅ Build Design Tokens
- ✅ Supernova Auto-Sync Tokens

Local verification (optional):

```bash
npm run verify:tokens
npm run verify:parity
```

## Merge behaviour

The plugin **overwrites** `global.color`, `global.spacing`, `global.borderRadius` from Figma.

It **preserves** other `global.*` groups from the existing file (e.g. `typography`) until Phase 8 adds typography variables in Figma.

## Troubleshooting

| Error | Fix |
|-------|-----|
| `GitHub PAT not configured` | Open Settings, paste PAT, Save |
| `GitHub PUT failed: 401` | PAT expired or wrong — regenerate |
| `GitHub PUT failed: 403` | PAT lacks write access to repo |
| `GitHub PUT failed: 409` | Plugin retries once automatically; if persistent, sync again |
| `0 tokens` / empty colors | Wrong file open, or collection names don't match (`Colours- All` etc.) |
| Plugin not in menu | Re-import manifest after `npm run build` |
| `fetch` blocked | Check `manifest.json` `networkAccess.allowedDomains` |

## Files

| File | Role |
|------|------|
| `code.ts` | Extract variables, transform, GitHub + Slack API |
| `code.js` | Compiled output (required by Figma; gitignored) |
| `ui.html` | Settings + sync button UI |
| `manifest.json` | Plugin metadata + network allowlist |

## Related docs

- `ILDS_PHASE6_PLUGIN_BRIEF.md` — full implementation spec + Figma naming rules
- `docs/deferred/` — REST sync deferred (Enterprise only)
