# Fix: Remove "Made-with: Cursor" from Slack Notifications

## Issue
When Cursor commits are pushed to GitHub, n8n appends `\n\nMade-with: Cursor` to the commit message. This causes the Slack notification to show extra lines.

## Solution

Open the **GitHub Push Notifier to Slack** workflow in n8n (ID: `P82tigHMhMfUl25s`).

### Step 1: Find the Send Slack Notification Node
1. Locate the node that posts the message to `#design-system-updates`
2. Look for the parameter that references `$json.body.head_commit.message`

### Step 2: Update the Message Template
Replace:
```
$json.body.head_commit.message
```

With:
```
$json.body.head_commit.message.split('\n')[0]
```

This extracts **only the first line** of the commit message, discarding the "Made-with: Cursor" footer.

### Step 3: Save and Test
1. Click **Save**
2. Make a test commit from Cursor to trigger the workflow
3. Verify the Slack message shows only the commit message, not the footer

## Result
✅ Slack notifications will now display clean commit messages without the Cursor footer.

### Example

**Before:**
```
Refactor token architecture for consistency

Made-with: Cursor
```

**After:**
```
Refactor token architecture for consistency
```
