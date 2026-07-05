/**
 * LLM adversary judge layer — Opus 4.8, catalog-seeded, independent of builder context.
 * Stable prefix (system + catalog) uses a single cache_control block for prompt caching.
 */

import { catalogForPrompt } from './catalog.mjs';

const DEFAULT_MODEL = 'claude-opus-4-8';

/**
 * @typedef {{ id: string; severity: string; summary: string; evidence: string; source: 'judge' }} JudgeFinding
 */

/**
 * @param {{ diff: string; changedFiles: Array<{ path: string; content: string }> }} input
 * @returns {Promise<{ findings: JudgeFinding[]; meta: object }>}
 */
export async function runLlmJudge(input) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    if (process.env.ILDS_ADVERSARY_REQUIRE_JUDGE === 'true') {
      throw new Error('ANTHROPIC_API_KEY required but not set.');
    }
    console.warn('ANTHROPIC_API_KEY not set — skipping LLM judge layer.');
    return { findings: [], meta: { skipped: true, reason: 'no-api-key' } };
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });
  const model = process.env.ILDS_ADVERSARY_MODEL ?? DEFAULT_MODEL;

  const adversaryPrompt = `You are the ILDS Adversary — a scoring opponent, not a linter. Assume the builder gamed the change to pass CI. Check the diff and files against the failure catalog below. Only report CONFIRMED hits with catalog IDs. Output valid JSON only: {"findings":[{"id":"F-001","severity":"critical","summary":"...","evidence":"..."}]}. Empty findings array if clean. Do not assume a dodge was planted.`;

  const cachedPrefix = `${adversaryPrompt}\n\n# Failure catalog\n\n${catalogForPrompt()}`;

  const fileSummaries = input.changedFiles
    .map((f) => `### ${f.path}\n\`\`\`dart\n${f.content.slice(0, 12000)}\n\`\`\``)
    .join('\n\n');

  const user = `# PR diff\n\n\`\`\`diff\n${input.diff.slice(0, 24000)}\n\`\`\`\n\n# Changed file contents\n\n${fileSummaries}`;

  try {
    const response = await client.messages.create({
      model,
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: cachedPrefix,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: user }],
    });

    const text = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('\n');

    const jsonMatch = text.match(/\{[\s\S]*"findings"[\s\S]*\}/);
    const findings = [];
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      for (const f of parsed.findings ?? []) {
        findings.push({
          id: f.id,
          severity: (f.severity ?? 'high').toLowerCase(),
          summary: f.summary ?? 'Judge finding',
          evidence: f.evidence ?? '',
          source: 'judge',
        });
      }
    }

    const usage = response.usage ?? {};
    const meta = {
      model,
      skipped: false,
      usage: {
        input_tokens: usage.input_tokens,
        output_tokens: usage.output_tokens,
        cache_creation_input_tokens: usage.cache_creation_input_tokens ?? 0,
        cache_read_input_tokens: usage.cache_read_input_tokens ?? 0,
      },
    };

    if (meta.usage.cache_read_input_tokens > 0) {
      console.log(
        `Opus judge: cache read ${meta.usage.cache_read_input_tokens} tokens (cached prefix hit)`,
      );
    }

    return { findings, meta };
  } catch (error) {
    if (process.env.ILDS_ADVERSARY_REQUIRE_JUDGE === 'true') {
      throw error;
    }
    console.warn(`LLM judge unavailable (${error.message ?? error}) — machine checks only.`);
    return { findings: [], meta: { skipped: true, reason: String(error.message ?? error) } };
  }
}
