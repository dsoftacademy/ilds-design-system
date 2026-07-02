# Phase 5f — Selective Review Router (GitHub settings)

**Owner action:** Pratishek applies these in GitHub UI after Cursor ships `review-router.yml` + scoped `CODEOWNERS`.  
**Brief:** `CURSOR_SELECTIVE_REVIEW_ROUTER.md`

---

## Problem (Phase 5a side effect)

- Every PR required code owner review.
- `@dsoftacademy` is the only owner on protected paths **and** workflows.
- No auto-merge → human clicks merge on docs, plans, and tooling.
- **Fix:** human is the **exception** handler (T1), not the default gate (T0).

---

## 1. Enable auto-merge (repo)

**Settings → General → Pull Requests**

- [x] **Allow auto-merge**
- [x] **Automatically delete head branches** (recommended)

---

## 2. CODEOWNERS (Cursor PR — scoped)

Require review **only** on:

| Path | Owner |
|------|--------|
| `/lib/` | `@dsoftacademy` |
| `/web/src/` | `@dsoftacademy` |
| `/tokens/` | `@dsoftacademy` |
| `/dist/` | `@dsoftacademy` |
| `/.github/workflows/` | `@dsoftacademy` |

**Remove** any blanket `* @dsoftacademy` entry.

Docs (`docs/**`), root `*.md`, `test/**`, `tool/**` → **no** code owner required.

---

## 3. Branch protection / ruleset (`main`)

Keep:

- [x] Require a pull request before merging
- [x] Require status checks to pass
- [x] Require branches up to date before merging
- [x] Do not allow bypassing
- [x] Restrict direct pushes to `main`

**Required status checks (7 — unchanged):**

1. Cross-platform parity QA  
2. Flutter golden tests  
3. Flutter analyze  
4. iOS compile (Swift Package)  
5. Android compile (Compose library)  
6. `parity`  
7. Chromatic snapshot test  

**Add when router ships (5f v1):**

8. `review-router` (or exact job name from `review-router.yml`)

**Add when Phase 6 adversary ships:**

9. `adversary-review` (or exact job name from `adversary-review.yml`)

**Code owner reviews:**

- [x] Require review from Code Owners — **only applies to paths in CODEOWNERS**
- [ ] Required approving review count: **0** (code owners path-scoped is enough for T1)
- [x] Dismiss stale pull request approvals when new commits are pushed

---

## 4. Bot account for T0 auto-merge

| Item | Value |
|------|--------|
| Account | `uniquedesignpratishek-maker` |
| PAT | Classic `repo` scope (already created) |
| GitHub secret | `ILDS_AUTO_MERGE_TOKEN` (or reuse handler token with narrow workflow scope) |
| Rule | Bot may approve + enable auto-merge **only** on PRs labeled `auto-merge` |

Bot must **never** satisfy CODEOWNERS on `/lib/`, `/web/src/`, `/tokens/`, `/dist/`.

---

## 5. Verification checklist

1. Open a **docs-only** PR → labeled `auto-merge` → merges without `@dsoftacademy` approval.  
2. Open a **`lib/`** PR → labeled `needs-human` → blocked until Pratishek approves.  
3. Mixed PR (docs + `lib/`) → **T1** (`needs-human`).  
4. Attempt bot approve on T1 → must **not** unblock merge.

---

## Bootstrap (one-time — only you can do this)

PRs **#24** and **#25** are **control-plane** (they define the automation). They need your judgment this once — the bot must not self-approve the PR that grants the bot its authority.

1. **Settings → General → Pull Requests** → enable **Allow auto-merge**
2. **Settings → Secrets → Actions** → add `ILDS_AUTO_MERGE_TOKEN` = classic PAT from `uniquedesignpratishek-maker` (`repo` scope)
3. **Merge #25** then **#24** (yes/no on impact summary — bot can execute merge after your approval once 5f workflow exists; for this bootstrap you click merge once)
4. After Cursor ships `review-router.yml`: apply branch protection per §3 below

From then on: content T0 clears itself; you only see T1 outputs (content visual + control plane).
