# Phase 5a — Branch protection for `main`

**Status:** Manual GitHub settings (repo admin applies).  
**Purpose:** Enforce human sign-off before merge — Phase 5 deliverable #5.

## Prerequisites

1. Merge PR that adds `.github/CODEOWNERS` and `.github/pull_request_template.md`.
2. Confirm required CI workflows have run at least once on `main` so check names appear in the branch protection UI.

## Settings to apply (`Settings → Branches → Branch protection rules → main`)

| Setting | Value |
|--------|--------|
| **Require a pull request before merging** | ✅ On |
| **Required approvals** | **1** |
| **Require review from Code Owners** | ✅ On |
| **Dismiss stale pull request approvals when new commits are pushed** | ✅ On |
| **Require status checks to pass before merging** | ✅ On |
| **Require branches to be up to date before merging** | ✅ On (recommended) |
| **Do not allow bypassing the above settings** | ✅ On (recommended for admins) |
| **Restrict who can push to matching branches** | ✅ On — no direct pushes to `main` |
| **Allow force pushes** | ❌ Off |
| **Allow deletions** | ❌ Off |

## Required status checks

Select these job names (exact labels from GitHub Checks tab):

| Workflow | Job name (check) |
|----------|------------------|
| `Web Component Tests` | `parity` |
| `Native Component Tests` | `Cross-platform parity QA` |
| `Native Component Tests` | `Flutter golden tests` |
| `Native Component Tests` | `Flutter analyze` |
| `Native Component Tests` | `iOS compile (Swift Package)` |
| `Native Component Tests` | `Android compile (Compose library)` |
| `Chromatic Visual Regression` | `Chromatic snapshot test` |

**Note:** Workflows are path-filtered. `docs/**` and `.github/workflows/**` are included on `pull_request` so docs-only PRs still report required checks. Component/token PRs must touch paths that trigger Chromatic when React UI changes.

## Verification

1. Open a test PR → template sections appear automatically.
2. Attempt merge without approval → blocked.
3. Merge with green checks + 1 approving review from a code owner → succeeds.

## Owner action

**Pratishek / repo admin:** apply the rule above in GitHub UI (or via `gh api` with admin token). This file documents intent; it does not enforce protection by itself.
