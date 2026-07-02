/**
 * LLM adversary judge layer — Opus, catalog-seeded, independent of builder context.
 * Skips gracefully when ANTHROPIC_API_KEY is unset (machine checks still run).
 */

import { catalogForPrompt } from './catalog.mjs';

/**
 * @typedef {{ id: string; severity: string; summary: string; evidence: string; source: 'judge' }} JudgeFinding
 */

/**
 * @param {{ diff: string; changedFiles: Array<{ path: string; content: string }>; machineFindings: object[] }} input
 * @returns {Promise<JudgeFinding[]>}
 */
export async function runLlmJudge(input) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set — skipping LLM judge layer (machine checks only).');
    return [];
  }

  const { default: Anthropic } = await import('@anthropic-ai/sdk');
  const client = new Anthropic({ apiKey });

  const fileSummaries = input.changedFiles
    .map((f) => `### ${f.path}\n\`\`\`dart\n${f.content.slice(0, 12000)}\n\`\`\``)
    .join('\n\n');

  const machineSection =
    input.machineFindings.length > 0
      ? `\n\nMachine pre-scan already flagged:\n${JSON.stringify(input.machineFindings, null, 2)}`
      : '';

  const system = `You are the ILDS Adversary — a scoring opponent, not a linter. Assume the builder gamed the change to pass CI. Check the diff and files against the failure catalog. Only report CONFIRMED hits with catalog IDs. Output valid JSON only: {"findings":[{"id":"F-001","severity":"critical","summary":"...","evidence":"..."}]}. Empty findings array if clean. Do not repeat machine findings unless you confirm them with additional evidence.`;

  const user = `# Failure catalog\n\n${catalogForPrompt()}\n\n# PR diff\n\n\`\`\`diff\n${input.diff.slice(0, 24000)}\n\`\`\`\n\n# Changed file contents\n\n${fileSummaries}${machineSection}`;

  try {
    const response = await client.messages.create({
      model: process.env.ILDS_ADVERSARY_MODEL ?? 'claude-opus-4-20250514',
      max_tokens: 2048,
      system: [
        {
          type: 'text',
          text: system,
          cache_control: { type: 'ephemeral' },
        },
        {
          type: 'text',
          text: catalogForPrompt(),
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
    if (!jsonMatch) return [];

    const parsed = JSON.parse(jsonMatch[0]);
    return (parsed.findings ?? []).map((f) => ({
      id: f.id,
      severity: (f.severity ?? 'high').toLowerCase(),
      summary: f.summary ?? 'Judge finding',
      evidence: f.evidence ?? '',
      source: 'judge',
    }));
  } catch (error) {
    console.warn(
      `LLM judge unavailable (${error.message ?? error}) — machine checks only.`,
    );
    return [];
  }
}
