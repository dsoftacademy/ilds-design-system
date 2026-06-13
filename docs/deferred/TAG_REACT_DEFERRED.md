# Tag (React) — Deferred

**Date:** 14 June 2026  
**Status:** Deferred — no Figma Tag Display component set  
**Figma file:** ILDS Master | Design (`PCUj412f0Z1zZLLxQUX22e`)

---

## Why deferred

Phase 5 Figma verification (`search_design_system`, `get_metadata`) found:

| Node | Name | Shape | Maps to |
|------|------|-------|---------|
| `14018:6786` | Tag (Filter) | `rounded-medium` (4px) | **Chip** / `IldsChip` — already implemented in React |
| — | Tag Display (pill) | `Capsule` / `rounded-full` | **Not published** in Figma |

`chip.figma.ts` documents the collision: Figma calls `14018:6786` "Tag", but the pill-shaped **Tag Display** variant (status/category label, removable) has no component set in the ILDS Figma file. `tag.figma.ts` remains disabled until the designer publishes it.

---

## Existing native implementations (reference only)

These were built from Phase 2 brief tokens, not from a verified Figma node:

| Platform | File | Shape |
|----------|------|-------|
| Flutter | `lib/ilds_tag.dart` | `borderRadiusFull` (pill) |
| iOS | `ios/Sources/ILDSDesignSystem/IldsTag.swift` | `Capsule()` |
| Android | `android/ilds-design-system/src/main/kotlin/.../IldsTag.kt` | `CircleShape` |

Visual tokens (native consensus):

- Default: bg `white`, border `neutral200` 1px, text `neutral600`
- Active: bg `orange50`, border `orange500` 2px, text `orange600`
- Disabled: bg `neutral50`, border `neutral100`, text `neutral300`
- Heights: medium 32px, large 40px
- Font: 13px Medium (medium), 14px Medium (large)

---

## Required Figma deliverable before React build

Designer must publish a **Tag Display** component set in `PCUj412f0Z1zZLLxQUX22e` with:

1. Pill shape (`borderRadiusFull` / capsule) — distinct from Chip `14018:6786`
2. Variants: Default, Active, Disabled (+ optional Hover, Pressed, Focused)
3. Sizes: Medium (32px), Large (40px)
4. Optional: Prefix icon, suffix remove (×) button
5. Token-bound colors (not hardcoded hex)

Once published, Cursor should:

1. Verify nodes via Figma MCP `get_design_context`
2. Create `web/src/components/Tag/`, `web/specs/tag.spec.json`, stories
3. Re-enable `tag.figma.ts` with the new node URL
4. Add parity rule to `tool/verify_cross_platform_parity.mjs`

---

## Tracking

- Phase 3c signoff: Tag React row marked **pending**
- Phase 5 Item 2: closed as **deferred** (2026-06-14)
