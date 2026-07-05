/**
 * Phase 5d — shared Slack + GitHub PR helpers.
 */

import crypto from 'node:crypto';

export function verifySlackSignature(signingSecret, signatureHeader, timestampHeader, rawBody) {
  if (!signingSecret || !signatureHeader || !timestampHeader || rawBody == null) {
    return false;
  }

  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > 60 * 5) return false;

  const base = `v0:${timestampHeader}:${rawBody}`;
  const digest = crypto.createHmac('sha256', signingSecret).update(base).digest('hex');
  const expected = `v0=${digest}`;

  if (signatureHeader.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(signatureHeader), Buffer.from(expected));
}

export function cleanTemplateValue(raw) {
  if (!raw) return '—';
  let value = raw.replace(/<!--[\s\S]*?-->/g, '').trim();
  if (!value || /^_+.*_$/.test(value) || /describe the change/i.test(value)) {
    return '—';
  }
  return value;
}

export function parsePrBody(body = '') {
  const normalized = body.replace(/\r\n/g, '\n');
  const type = cleanTemplateValue(normalized.match(/\*\*Type:\*\*[ \t]*([^\n]*)/)?.[1]);
  const scope = cleanTemplateValue(normalized.match(/\*\*Scope:\*\*[ \t]*([^\n]*)/)?.[1]);
  const platforms = [];
  if (/\[x\].*React/i.test(normalized)) platforms.push('React');
  if (/\[x\].*Flutter/i.test(normalized)) platforms.push('Flutter');
  if (/\[x\].*iOS/i.test(normalized)) platforms.push('iOS');
  if (/\[x\].*Android/i.test(normalized)) platforms.push('Android');

  const chromaticRaw =
    normalized.match(/\*\*Chromatic \(React\):\*\*[ \t]*([^\n]*)/)?.[1]?.trim() ?? '';
  const chromatic =
    chromaticRaw && /^https?:\/\//i.test(chromaticRaw) ? chromaticRaw : null;

  return {
    type,
    scope,
    platforms: platforms.length ? platforms.join(', ') : '—',
    chromatic,
  };
}

export function prActionValue(owner, repo, prNumber) {
  return JSON.stringify({ owner, repo, pr: Number(prNumber) });
}

export function parsePrActionValue(value) {
  const data = JSON.parse(value);
  if (!data?.owner || !data?.repo || !data?.pr) {
    throw new Error('Invalid PR action value');
  }
  return { owner: data.owner, repo: data.repo, prNumber: Number(data.pr) };
}

export function buildSlackBlocks({ pr, parsed, chromaticUrl, repo, interactive = false, reviewUiUrl }) {
  const prUrl = pr.html_url;
  const checksUrl = `${prUrl}/checks`;
  const visualDiff = chromaticUrl
    ? `<${chromaticUrl}|Chromatic build>`
    : parsed.chromatic
      ? `<${parsed.chromatic}|Chromatic build>`
      : `<${checksUrl}|View PR checks (Chromatic pending)>`;

  const blocks = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📋 ILDS change proposed — review required',
        emoji: true,
      },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*PR*\n<${prUrl}|#${pr.number}: ${pr.title}>` },
        { type: 'mrkdwn', text: `*Author*\n@${pr.user.login}` },
        { type: 'mrkdwn', text: `*Type*\n${parsed.type}` },
        { type: 'mrkdwn', text: `*Scope*\n${parsed.scope}` },
        { type: 'mrkdwn', text: `*Platforms*\n${parsed.platforms}` },
        { type: 'mrkdwn', text: `*Visual diff*\n${visualDiff}` },
      ],
    },
  ];

  if (interactive) {
    const actionValue = prActionValue(
      pr.base?.repo?.owner?.login ?? repo.split('/')[0],
      pr.base?.repo?.name ?? repo.split('/')[1],
      pr.number,
    );
    blocks.push({
      type: 'actions',
      block_id: `ilds_pr_actions_${pr.number}`,
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: '✅ Approve', emoji: true },
          style: 'primary',
          action_id: 'ilds_pr_approve',
          value: actionValue,
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: '🔄 Request changes', emoji: true },
          style: 'danger',
          action_id: 'ilds_pr_request_changes',
          value: actionValue,
        },
      ],
    });
  } else if (reviewUiUrl) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Review in ILDS Review UI:* <${reviewUiUrl}|Open review surface>`,
      },
    });
  }

  blocks.push({
    type: 'context',
    elements: [
      {
        type: 'mrkdwn',
        text: interactive
          ? `${repo} · Approve/Request changes posts a GitHub review (does not auto-merge)`
          : `${repo} · Pass/Fail or Authorize/Reject in ILDS Review UI (http://localhost:4400)`,
      },
    ],
  });

  return blocks;
}

export function buildSlackPayload(options) {
  const blocks = buildSlackBlocks(options);
  return {
    text: `ILDS PR opened: ${options.pr.title}`,
    blocks,
  };
}

export async function githubRequest(token, method, apiPath, body) {
  const response = await fetch(`https://api.github.com${apiPath}`, {
    method,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }

  if (!response.ok) {
    const details = Array.isArray(data.errors)
      ? data.errors.join('; ')
      : data.message || text.slice(0, 400);
    const err = new Error(
      `GitHub API ${method} ${apiPath} failed (${response.status}): ${details}`,
    );
    err.status = response.status;
    err.githubErrors = data.errors;
    throw err;
  }
  return data;
}

export async function findChromaticDetailsUrl(token, owner, repo, ref) {
  const runs = await githubRequest(
    token,
    'GET',
    `/repos/${owner}/${repo}/commits/${encodeURIComponent(ref)}/check-runs?per_page=30`,
  );
  const chromatic = (runs.check_runs ?? []).find((run) => /chromatic/i.test(run.name ?? ''));
  if (!chromatic) return null;
  return chromatic.details_url || chromatic.html_url || null;
}

export async function postSlackWebhook(webhookUrl, payload) {
  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack webhook failed (${response.status}): ${text.slice(0, 400)}`);
  }
}

export async function postSlackBotMessage(botToken, channel, payload) {
  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${botToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ channel, ...payload }),
  });
  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Slack chat.postMessage failed: ${data.error ?? 'unknown'}`);
  }
  return data;
}

export async function postSlackResponseUrl(responseUrl, payload) {
  const response = await fetch(responseUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Slack response_url failed (${response.status}): ${text.slice(0, 400)}`);
  }
}

export function isApproverAllowed(slackUserId) {
  const allowlist = (process.env.SLACK_APPROVER_USER_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  if (allowlist.length === 0) return true;
  return allowlist.includes(slackUserId);
}

export async function submitPullRequestReview(token, owner, repo, prNumber, { event, body }) {
  const pr = await githubRequest(token, 'GET', `/repos/${owner}/${repo}/pulls/${prNumber}`);
  return githubRequest(token, 'POST', `/repos/${owner}/${repo}/pulls/${prNumber}/reviews`, {
    commit_id: pr.head.sha,
    body,
    event,
  });
}

export function reviewEventForAction(actionId) {
  if (actionId === 'ilds_pr_approve') return 'APPROVE';
  if (actionId === 'ilds_pr_request_changes') return 'REQUEST_CHANGES';
  throw new Error(`Unknown action: ${actionId}`);
}

export function statusLineForReview(event, slackUser) {
  const who = slackUser.username ? `@${slackUser.username}` : slackUser.name ?? 'reviewer';
  if (event === 'APPROVE') return `✅ *Approved* on GitHub by ${who}`;
  return `🔄 *Changes requested* on GitHub by ${who}`;
}

export function blocksAfterReview(originalBlocks, statusLine) {
  const withoutActions = (originalBlocks ?? []).filter((block) => block.type !== 'actions');
  return [
    ...withoutActions,
    { type: 'section', text: { type: 'mrkdwn', text: statusLine } },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'Review recorded on GitHub · merge still requires branch protection checks + merge button',
        },
      ],
    },
  ];
}
