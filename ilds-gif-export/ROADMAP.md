# ILDS GIF Export — Roadmap

Identity: **Figma's motion-export layer.** One hub, two lanes — a **raster lane** (GIF/MP4/WebM) for whole-frame animated content, and a **vector lane** (Lottie) for Smart-Animate interactions. Same promise: read a Figma selection, get motion out in the format the destination needs.

Phases are ordered. Do not start a phase until the prior one is proven.

---

## Phase 0 — Whole-frame GIF export (shipped: v1.6.0)

Status: working, incl. **placed video** in the frame. Figma-composited engine
(fill-swap for GIFs, temporary overlay for videos), shared multi-source timeline,
global palette + dithering, Original/Optimized sizes, offline. A single frame can
mix video + GIFs + images + gradients + text + effects and export as one GIF.

Done: validated on real frames; the "N unique" indicator is the animation
acceptance signal. Video needs its source file dropped in (Figma exposes no way to
read placed-video pixels). Next: publish the v1.6.0 update to ILDS.

---

## Phase 1 — MP4 / WebM export

The highest-value next step. Retires the entire GIF-quality problem class (256 colors, banding, palette). Full color, alpha (WebM), 5–10× smaller files, plays everywhere.

Reuses the existing frame-capture engine; swaps the encoder (WebCodecs `VideoEncoder` or an in-iframe mp4/webm muxer). Effort: medium. Value: highest.

---

## Phase 2 — Batch export + platform size presets

- **Batch:** select N frames, export all in one action. Marketing/social make these in bulk.
- **Size presets:** same animation → 1:1, 9:16 story, 16:9, LinkedIn. Reuses existing scale logic.

Low-to-medium effort, high time-saving for repeat workflows.

---

## Phase 3 — Motion polish + handoff

- **Loop controls:** ping-pong, loop count, trim start/end frames.
- **Motion handoff spec:** emit the internal timeline (timing, delays, dimensions) as a spec alongside the file — real motion specs for engineering. Ties into ILDS design-system handoff.
- **APNG / WebP** for lossless + transparency where GIF can't.

---

## Phase 4 (LAST) — Lottie export (vector lane)

Scoped, separate pipeline. **Not** an extension of the raster engine. Build only after Phases 1–2 and only if ILDS integration justifies it over the free LottieFiles plugin.

### Why (conditional)
Designers hand engineers micro-interactions (toggles, loaders, button states, onboarding) and **Lottie is the standard lightweight vector format** for shipping them into apps/web. Real ILDS fit: tokenized motion micro-interactions, built with your easing tokens, handed to engineering as Lottie.

**Catch:** LottieFiles ships a free Figma→Lottie plugin (Aninix/Phase too). Build this only if org-integration, your motion tokens, and reliability *for your own component library* justify it. Otherwise use the free plugin.

### The only coherent mapping
Lottie is vector-keyframe, not raster. So the source must be a **Smart-Animate prototype transition** (frame A → frame B), where Figma interpolates matched layers' position/scale/rotation/opacity/color along an easing curve — which *is* Lottie keyframe animation. Raster GIF content does **not** translate (it embeds as a static image that only slides/scales). Do not offer "animated frame → Lottie."

### v1 scope — one transition, image-layer Lottie
1. Read the source frame's reaction → find the `SMART_ANIMATE` action; pull easing + duration (`node.reactions → actions[].transition`).
2. Match layers A↔B by name (same as Smart Animate).
3. Per matched layer, read transform in both states (position, size→scale, rotation, opacity). Unmatched → fade in (B-only) / fade out (A-only).
4. Rasterize each layer to PNG via `exportAsync`; embed as base64 image asset (`assets[]`), one Lottie image layer (`ty:2`) each. (Sidesteps Figma-path → Lottie-shape conversion; reuses existing per-node export.)
5. Emit transform keyframes A→B, converting Figma easing to Lottie in/out bezier tangents. `op = duration × fps`.

Output: a valid, playable Lottie that reproduces the Smart-Animate motion.

### v2
Convert simple layers (rects, ellipses, solid fills, basic text) to native Lottie **shape** layers (`ty:4`) for crisp scaling; keep images for complex ones.

### Hard parts — do not hand-wave
- **Coordinate math:** Figma top-left absolute transforms vs Lottie anchor/position. Main v1 risk.
- **Easing:** named + `CUSTOM_CUBIC_BEZIER` map cleanly; **spring/bouncy have no Lottie native equivalent** — bake them by sampling into many keyframes.
- **Not translated in v1:** raster internal animation, blur/shadow, blend modes, masks, gradients, auto-layout reflow, nested-component edge cases — lossy or dropped.
- **Layer-match ambiguity:** duplicate names, reordering, add/remove.
- **Multi-step flows (A→B→C)** are a later increment; v1 is a single transition.

### De-risk before building
One-day spike: image-layer Lottie on a single two-frame toggle. If it plays correctly in lottie-web, the coordinate + easing mapping is proven and the rest is grind, not risk.

---

## What NOT to build
- General-purpose image/GIF optimizer (crowded, dilutes the wedge).
- Prototype/Smart-Animate **playback** capture to video — the plugin API cannot render prototype playback; needs a different approach entirely.
- Lottie for raster content — it doesn't map.

## Sources
- [Figma reactions API](https://developers.figma.com/docs/plugins/api/properties/nodes-reactions/)
- [Figma Transition (easing/duration)](https://www.figma.com/plugin-docs/api/Transition/)
- [Lottie JSON schema](https://lottiefiles.github.io/lottie-docs/schema/)
