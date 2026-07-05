# PR #35 — retroactive human review

**Incident:** #35 (`feat/automerge-on-approval`) merged to `main` without a human approving review. See `docs/CONTROL_PLANE_INTEGRITY.md`.

**Status:** Pending Pratishek sign-off on the merged diff.

## Files landed by #35 (review these)

| File | Purpose |
|------|---------|
| `.github/CODEOWNERS` | Added `PHASE5F_AUTOMERGE_ON_APPROVAL.md` owner |
| `.github/workflows/review-router.yml` | Enable auto-merge for T0 **and** T1 |
| `docs/PHASE5F_AUTOMERGE_ON_APPROVAL.md` | Spec — auto-merge on human approval |
| `tool/lib/review_router_classify.mjs` | Classifier pattern for automerge doc |
| `tool/review_router.mjs` | T1: enable auto-merge without bot approval |
| `tool/review_router.test.mjs` | T1 human-approval gate tests |
| `tool/review_router_classify.test.mjs` | Classifier test for automerge doc |

## Human review checklist

- [ ] T1 path enables auto-merge only — bot never calls `APPROVE` on T1
- [ ] T0 path still bot-approves then enables auto-merge
- [ ] No unintended changes outside the table above
- [ ] Branch-protection settings updated per `CONTROL_PLANE_INTEGRITY.md` (Pratishek — not in this PR)

## Sign-off

| Reviewer | Date | Decision |
|----------|------|----------|
| Pratishek | | Approve / Revert |

When signed off, check the box in `docs/CONTROL_PLANE_INTEGRITY.md` verification section.
