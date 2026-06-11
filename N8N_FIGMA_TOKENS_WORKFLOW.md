# n8n Workflow: Figma Variables → GitHub Tokens Sync

## Overview
This workflow extracts Figma Variables via the Figma API and syncs them to `tokens/tokens.json` in W3C DTCG format, triggering the GitHub Action → Supernova pipeline automatically.

## Setup Instructions

### Step 1: Create New Workflow
1. In n8n, click **+ New**
2. Name: `Figma Variables to GitHub Tokens`
3. Description: `Extract Figma Variables via API and sync to GitHub tokens.json in W3C DTCG format`

### Step 2: Add Webhook Trigger
1. Click the **+** button in the canvas
2. Search for and select **Webhook**
3. Configure:
   - HTTP Method: `POST`
   - Path: `figma-tokens-sync`
   - Response Mode: `On Received`
4. Save and copy the webhook URL for testing

### Step 3: Add HTTP Request Node (Figma Variables API)
1. Click **+** and add **HTTP Request**
2. Configure:
   - Method: `GET`
   - URL: `https://api.figma.com/v1/files/PCUj412f0Z1zZLLxQUX22e/variables/local`
   - Authentication: `None` (we'll use header)
   - Send Headers: `ON`
   - Headers (keypair mode):
     - Name: `X-Figma-Token`
     - Value: `figd_REDACTED_ROTATE_AND_STORE_IN_ENV`
   - Response Format: `JSON`
3. Save

### Step 4: Add Code Node (Transform to W3C DTCG)
1. Click **+** and add **Code**
2. Mode: `Run Once for All Items`
3. Language: `JavaScript`
4. Paste this code:

```javascript
// Transform Figma Variables to W3C DTCG format
const figmaData = $input.first().json;
const variables = figmaData.variables || [];
const variableCollections = figmaData.variableCollections || [];

// Build collection name map
const collectionMap = {};
variableCollections.forEach(col => {
  collectionMap[col.id] = col.name;
});

// Start with W3C DTCG structure
const tokens = {
  "$schema": "https://tokens.studio/schemas/json/en/v0.6.0/token-schema.json",
  "$version": "1.0.0",
  "global": {
    "colors": {},
    "spacing": {},
    "borderRadius": {},
    "fontWeights": {}
  }
};

// Transform each variable
variables.forEach(variable => {
  if (!variable.resolvedType) return;

  const varName = variable.name;

  switch(variable.resolvedType) {
    case 'COLOR':
      if (variable.value && typeof variable.value === 'object') {
        const r = Math.round((variable.value.r || 0) * 255).toString(16).padStart(2, '0');
        const g = Math.round((variable.value.g || 0) * 255).toString(16).padStart(2, '0');
        const b = Math.round((variable.value.b || 0) * 255).toString(16).padStart(2, '0');
        const hex = '#' + r + g + b.toUpperCase();

        tokens.global.colors[varName] = {
          "$type": "color",
          "$value": hex
        };
      }
      break;

    case 'FLOAT':
      // Numeric values - spacing, radius, etc
      tokens.global.spacing[varName] = {
        "$type": "dimension",
        "$value": `${variable.value}px`
      };
      break;
  }
});

// Return formatted JSON
return {
  item: {
    json: {
      tokensJson: JSON.stringify(tokens, null, 2),
      timestamp: new Date().toISOString()
    }
  }
};
```

5. Save

### Step 5: Add GitHub File Edit Node
1. Click **+** and add **GitHub**
2. Authenticate:
   - Authentication: `Access Token`
   - (You'll need a GitHub PAT with `repo` scope)
3. Configure:
   - Owner: `dsoftacademy`
   - Repository: `ilds-design-system`
   - Operation: `Edit`
   - File Content: Click the **fx** button and enter:
     ```
     {{ $node["Code"].data.item.json.tokensJson }}
     ```
   - Commit Message: `ci: sync Figma Variables to tokens.json via n8n`
   - Additional Parameters:
     - Branch: `main`
     - Author Name: `n8n Bot`
     - Author Email: `bot@dsoft.academy`
4. Save

### Step 6: Add Slack Notification Node
1. Click **+** and add **Slack**
2. Authenticate with your Slack workspace
3. Configure:
   - Resource: `Message`
   - Operation: `Post`
   - Channel: `#design-system-updates` (or `C0AN3J0DKJN` by ID)
   - Message Text:
     ```
     🎉 Figma Variables synced to GitHub

     • Tokens updated from Figma Variables API
     • File: `tokens/tokens.json`
     • Format: W3C DTCG
     • Supernova GitHub Action will run automatically
     ```
4. Save

### Step 7: Connect Nodes
1. Drag connections:
   - Webhook → HTTP Request
   - HTTP Request → Code
   - Code → GitHub (file edit)
   - GitHub → Slack (notification)

### Step 8: Test the Workflow
1. Click **Test** or use the webhook URL from Step 2
2. Use curl to test:
   ```bash
   curl -X POST "https://your-n8n-instance/webhook/figma-tokens-sync" \
     -H "Content-Type: application/json" \
     -d "{}"
   ```
3. Check that:
   - ✅ Figma API returns variables
   - ✅ Code transforms to DTCG format
   - ✅ GitHub receives the commit
   - ✅ Slack notification posts
   - ✅ GitHub Action runs (check Actions tab)

### Step 9: Activate the Workflow
1. Click the **OFF** toggle to turn the workflow **ON**
2. Workflow is now active

## Integration with Figma Library Version Monitor

To automatically trigger this when Figma publishes:

1. Open the **Figma Library Version Monitor** workflow (ID: `q6TjuM7fUilBJUtA`)
2. After the condition check, add a **Webhook** node that calls your new workflow
3. Use the public webhook URL from Step 2

**Alternative**: Set a manual trigger, and call from Figma monitor when publish is detected.

## Testing with Manual Trigger

To test without modifying Figma:
1. Use the webhook URL as a POST endpoint
2. Curl example:
   ```bash
   curl -X POST "https://your-n8n-instance/webhook/figma-tokens-sync" \
     -H "Content-Type: application/json" \
     -d '{"test": true}'
   ```
3. Monitor the workflow execution in n8n

## Expected Output

After successful execution:
- ✅ New commit in GitHub: `ci: sync Figma Variables to tokens.json via n8n`
- ✅ `tokens/tokens.json` updated with W3C DTCG format tokens
- ✅ GitHub Action `sync-supernova.yml` triggered
- ✅ Supernova receives updated tokens
- ✅ Slack notification in `#design-system-updates`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Figma API returns 401 | Check PAT is valid: `figd_REDACTED_ROTATE_AND_STORE_IN_ENV` |
| GitHub edit fails | Verify GitHub PAT has `repo` scope; check branch name is `main` |
| GitHub Action doesn't trigger | Confirm `sync-supernova.yml` is committed; check `paths: tokens/tokens.json` |
| Slack notification fails | Verify bot has permission to post in `#design-system-updates` |
| No tokens in output | Ensure Figma file has Variables defined (not just Styles) |

## Key Details

- **Figma File ID**: `PCUj412f0Z1zZLLxQUX22e`
- **Figma PAT**: `figd_REDACTED_ROTATE_AND_STORE_IN_ENV`
- **GitHub Repo**: `dsoftacademy/ilds-design-system`
- **Slack Channel**: `#design-system-updates` (ID: `C0AN3J0DKJN`)
- **Token Format**: W3C DTCG (Design Tokens Community Group)
- **Trigger Path**: `figma-tokens-sync`
