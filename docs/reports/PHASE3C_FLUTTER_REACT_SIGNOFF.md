# Flutter ↔ React visual sign-off gate (Phase 3c)

**Date:** 13 June 2026  
**Status:** Approved — Pratishek sign-off 18 June 2026  
**Figma file:** ILDS Master | Design (`PCUj412f0Z1zZLLxQUX22e`)

---

## How to run the gate

| Platform | Command | URL / app |
|----------|---------|-----------|
| React (Storybook) | `npm run storybook` | http://localhost:6006 |
| Flutter (playground) | `cd ilds_component_playground_app && flutter run -d chrome` | local Chrome |

Open both side-by-side. Walk each row below and confirm visual parity before signing off.

---

## Sign-off checklist

### Button
| Check | Flutter playground | Storybook | Figma node |
|-------|-------------------|-----------|------------|
| Primary L/M/S default | Button section | Components → Button | 13472:2804 |
| Icon-only Large (px-16) | Button section | Icon Only Large | 13472:2810 |
| Icon-only Medium | Button section | — | Button set — Icon Only M |
| Icon-only Small (px-8 py-6) | Button section | Icon Only Small | 13472:3718 |
| Loading — leading visible, spinner trailing | — | Loading Both Icons Large | 13472:2877 |
| Secondary/Tertiary pressed | Button section (press & hold) | Secondary/Tertiary stories | 13472:3024 / 3042 |

**Parity harness:** 17/17 Button variants (`web/specs/button.spec.json`)

### TextField
| Check | Flutter `ilds_text_field.dart` | Storybook | Figma node |
|-------|-------------------------------|-----------|------------|
| Standard default/focus/typing | — | Standard * stories | 13478:25333+ |
| Password default + toggle | Password kind | Password Default | 13478:25341 |
| Password typing (masked) | Password kind | Password Typing | 13478:25691 |
| OTP x 6 default/focus/typing | otpX6 kind | Otp6 Default / Typing | 13478:25349 / 25701 |
| OTP x 4 | otpX4 kind | Otp4 Default | 13478:25366 |
| Required text + asterisk | — | Required Text / Asterisk | Mandatory Asterik set |
| Help button (orange, footer right) | — | Password / OTP stories | Password row |

**Parity harness:** 12/12 TextField variants (`web/specs/textfield.spec.json`)

### Dropdown
| Check | Flutter `ilds_dropdown.dart` | Storybook | Figma node |
|-------|------------------------------|-----------|------------|
| Trigger empty/hover/focus/active | Trigger states | Dropdown stories | 13476:22316 |
| Menu panel (5 items + footer) | Overlay panel | Menu Panel / With Menu | 16055:6152 |
| Section label header | — | Menu Panel | 16055:6685 |
| Radio-style option rows | — | Menu Panel | 16055:6128 |

**Parity harness:** 7/7 Dropdown trigger + 1/1 menu panel

### Chip (Flutter-only regression)
| Check | Flutter playground | Storybook | Notes |
|-------|-------------------|-----------|-------|
| Filter default/selected/disabled | — | Chip stories | 15 defects fixed Phase 3b |
| Tag variants | — | — | **Deferred** — see `docs/deferred/TAG_REACT_DEFERRED.md` (no Figma Tag Display node) |

---

## Token alignment (spot-check)

| Token | CSS var / Tailwind | Dart `ILDSTokens` | Hex |
|-------|-------------------|-------------------|-----|
| Primary orange 500 | `primary-orange-500` | `orange500` | `#E3530F` |
| Orange 600 (focus ring) | `primary-orange-600` | `orange600` | `#C74C01` |
| Coolgray 500 border | `neutral-coolgray-500` | `neutralCoolgray500` | `#9E9E9E` |
| Coolgray 100 hover bg | `neutral-coolgray-100` | `neutralCoolgray100` | `#F5F5F5` |
| Error red 600 | `error-red-600` | `red600` | `#E00903` |

---

## Sign-off

| Reviewer | Date | Result |
|----------|------|--------|
| Pratishek | 18 June 2026 | ☑ Approved ☐ Changes requested |

**Notes:**

---

## Known open items (not blocking mechanical gate)

1. **Dropdown focus ring / WCAG** — see `docs/a11y/DROPDOWN_FOCUS_RING_FLAG.md` (designer decision pending).
2. **Flutter dropdown menu** — Flutter overlay panel predates Figma 16055 menu spec; React menu panel is canonical for Phase 3c. Flutter menu refresh deferred to Phase 4.
