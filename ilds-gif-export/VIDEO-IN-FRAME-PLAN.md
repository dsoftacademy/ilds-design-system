# Implementation Plan — Frame-with-Video → GIF (integrated)

For Cursor. Builds on v1.4.0. Goal: select a frame that **contains a placed video**, supply the source file, and export the **whole frame** — video animating together with text, images, and GIFs — as one GIF, in one flow, **without permanently changing the design**.

---

## 0. Current state (do not rebuild)

Already shipped in v1.4.0 and reused as-is:

- **Frame → GIF engine** (`code.ts renderComposite`, `ui.ts exportRoot`): fill-swap per timeline step → `exportAsync` → global-palette + Floyd–Steinberg encoder. Pre-warm (`getSizeAsync`) + settle (`setTimeout 0`) race fix is in place.
- **Video decode** (`ui.ts`): `loadVideo()`, `seekVideo()` (awaits `seeked` — keep this, it prevents black frames), `planVideo()`, `FrameGetter`.
- **Placed-video detection** (`code.ts hasVideoFill` → `hasPlacedVideo`).
- **Video → GIF tab** + "Place in Figma": keep unchanged. This is a complementary feature, not what we're building here.

This plan **adds a source path** to the existing engine. It does not replace it.

---

## 1. The one hard constraint (verified, current API)

`Video` exposes only `hash` (readonly). There is **no** way to read a placed video's bytes/pixels. `exportAsync` renders only its frozen poster. So the video frames **must come from a user-supplied source file**. Every working plugin (Framify etc.) does the same. Design the UX around this — it is not optional.

Non-negotiable consequence: the plugin must **restore the original `VideoPaint` after export**. The saved file must be byte-identical to before. A corrupted design is the worst failure mode here.

---

## 2. Target UX

1. User selects the newsletter frame. Frame → GIF tab.
2. Plugin lists animated sources found: GIFs (auto) and **videos (need a file)**. e.g. *"1 video found (720×405) — drop its source file."*
3. User drops the source video file(s). Plugin decodes locally.
4. User picks Original / Optimized, clicks **Export frame as GIF**.
5. Plugin animates every source on a shared timeline, composites the whole frame per step via Figma's renderer, encodes one GIF, restores all fills.
6. **Fallback:** if the user skips the file, export anyway with the video shown as its frozen poster; everything else still animates. Never block the export.

---

## 3. Architecture — extend, don't fork

Treat a **video node** as just another animated source, exactly like a GIF node. The only differences:
- Its frames come from a decoded **file** (not `getBytesAsync`).
- The swapped-in fill is built from a `VideoPaint` (not an `ImagePaint`), so scaleMode/crop must be copied across.

Everything downstream — timeline, dedupe, per-step assignment, `exportAsync` composite, encoder, restore — is the code you already have.

---

## 4. Data model & message protocol changes

### `code.ts` — `scanSelection`

Replace the `hasPlacedVideo` boolean with a real list. For each node with a `VIDEO` fill, capture:

```ts
interface VideoNodeRef {
  id: string;
  fillIndex: number;
  videoHash: string;        // identity / dedupe
  scaleMode: string;        // 'FILL' | 'FIT' | 'CROP' | 'TILE'
  imageTransform?: number[][]; // present when scaleMode === 'CROP' — MUST be preserved
  nodeWidth: number;
  nodeHeight: number;
  name: string;
}
```

Add `videoNodes: VideoNodeRef[]` to each `Root`. Post it in the `roots` message. Keep `hasPlacedVideo` for the empty-state hint if you like, but the list is what drives the feature.

### `ui.ts` — decode files, then send frames the same way as GIFs

No new sandbox round-trip shape is needed. The sandbox already accepts `pngs: Uint8Array[]` + `steps` with `assignments: {nodeId, fillIndex, pngIndex}`. Video frames become PNGs in that same `pngs` array. The sandbox just needs to know a given node's original fill is VIDEO so it builds an `ImagePaint` correctly (below).

Simplest protocol tweak: in the `renderComposite` message, include the `videoNodes` metadata (scaleMode + imageTransform per nodeId) so the sandbox can reconstruct the fill. Or have the sandbox re-read the node's current fill at run time to get scaleMode/transform. **Prefer re-reading at run time** — one source of truth, no drift.

---

## 5. The composite change (`code.ts renderComposite`) — the heart

Today the per-step swap assumes the target fill is `IMAGE`:

```ts
if (paint && paint.type === 'IMAGE' && hash) {
  fills[a.fillIndex] = { ...(paint as ImagePaint), imageHash: hash };
}
```

Extend to also handle `VIDEO`:

```ts
if (paint && hash) {
  if (paint.type === 'IMAGE') {
    fills[a.fillIndex] = { ...(paint as ImagePaint), imageHash: hash };
  } else if (paint.type === 'VIDEO') {
    const v = paint as VideoPaint;
    fills[a.fillIndex] = {
      type: 'IMAGE',
      scaleMode: v.scaleMode,                 // MUST match the video's fit
      imageHash: hash,
      imageTransform: v.imageTransform,       // MUST match — crop alignment
      scalingFactor: (v as any).scalingFactor,
      rotation: (v as any).rotation,
      opacity: v.opacity,
      blendMode: v.blendMode,
      visible: v.visible,
    } as ImagePaint;
  }
}
```

The **original fills array is already cloned into `touched` before the loop and restored in the `finally`** — this restores the `VideoPaint` untouched. Verify `JSON.parse(JSON.stringify(fills))` round-trips a `VideoPaint` (it does — plain object with `videoHash`). Add an assertion in tests.

**Fidelity risk #1 (learn from the blank-sphere bug):** if you drop `scaleMode`/`imageTransform`, a cropped video (the laptop screen) will misalign or vanish. Copy them exactly.

---

## 6. Unified timeline (`ui.ts exportRoot`)

Generalize the source model from "gif nodes" to "animated nodes":

```ts
type AnimatedSource =
  | { kind: 'gif'; node: GifNodeRef; frames: DecodedFrame[]; cum: number[]; total: number; w: number; h: number }
  | { kind: 'video'; node: VideoNodeRef; frames: FrameCanvas[]; total: number; w: number; h: number };
```

- **GIF sources:** unchanged (decode via `getBytesAsync` bytes already in `assets`).
- **Video sources:** decode the supplied file **once** into K sampled frames (reuse `loadVideo`/`seekVideo`), cache them as canvases/ImageData. `total = durationMs`. Sample at `t % total` → nearest frame index. **Pre-sample once — never seek per timeline step** (seeking is slow and flaky).

Then the existing loop is unchanged in shape: for each timeline step `k`, for each animated source, pick its frame at time `t`, `pngFor(...)` to dedupe into `pngs`, push `{nodeId, fillIndex, pngIndex}`. Videos and GIFs mix freely on one timeline; each loops independently (`t % its own total`).

`totalDuration = max(all sources' totals)`. Reuse `planTimeline`.

---

## 7. Fallback — never block

If a video node has **no** supplied file at export time: omit it from the animated-source list. It stays a `VideoPaint`, so `exportAsync` renders its poster frame every step (frozen). Text/images/GIFs still animate. Surface a soft note: *"1 video exported as a still — drop its source file to animate it."*

---

## 8. Multi-video matching

- **One video node:** one drop zone. Done.
- **Multiple:** list each node (`name`, `W×H`) with its own drop zone. On drop, match the file to that specific node. Optional auto-suggest by aspect ratio (`videoW/videoH` vs `nodeWidth/nodeHeight`), but let the user override. Don't auto-match silently.

---

## 9. Phased build order

**Phase A — detection → data (small).** `scanSelection` emits `videoNodes[]` with scaleMode/imageTransform/geometry. UI renders a "source needed" list in the Frame tab.

**Phase B — shared video decode (small).** Extract `decodeVideoFile(file) → { width, height, durationMs, frames }` (pre-sampled canvases) from the existing Video-tab code. Reuse in both tabs.

**Phase C — composite + timeline (medium, core).** Extend `renderComposite` VIDEO→IMAGE swap (Section 5). Generalize `exportRoot` to `AnimatedSource` (Section 6). Restore verified in `finally`.

**Phase D — fallback + multi-video UX (small).** Frozen-poster fallback, per-node drop zones, progress, soft notes. Repurpose the old "go to Video tab" hint — the Frame tab now handles placed video directly.

**Phase E — tests + hardening (small).** Below.

---

## 10. Tests & acceptance

**Headless unit (extend `test/e2e.mjs`):**
- Unified timeline with mixed gif+video sources → correct frame index per source at sampled times; independent looping.
- `VideoPaint` → `ImagePaint` builder preserves `scaleMode` + `imageTransform` (pure function — factor it out so it's testable).
- `JSON` round-trip of a `VideoPaint` is lossless (restore safety).
- `planVideo` caps (already tested — keep).

**Manual matrix (the only real fidelity check):**
1. Frame with **one** placed video + source file → exports whole frame, video animates, aligned in its node (crop correct).
2. Frame with **video + a GIF** → both animate on one timeline.
3. **Multiple** videos → each matched + animated.
4. **Skip the file** → video frozen, rest animates (fallback).
5. **Cropped** video (laptop screen) → frame lands exactly in the screen, no shift/blank (Fidelity risk #1).
6. After every export: **design unchanged** — the video node is still a `VideoPaint`, byte-identical. Confirm via undo history / re-scan.
7. Watch the existing "N unique" indicator — video frames must vary (animation real, not the race).

**Acceptance:** cases 1–3 animate correctly and aligned; case 4 degrades gracefully; case 6 leaves the file untouched.

---

## 11. Risks (ranked)

1. **Design corruption** — a mis-restored `VideoPaint`. Clone before, restore in `finally`, test the round-trip. Highest severity.
2. **Crop/scaleMode misalignment** — copy `scaleMode` + `imageTransform` exactly. Same class as the blank-sphere bug.
3. **Video decode reliability** — reuse `seekVideo` (awaits `seeked`); pre-sample once.
4. **Performance** — pre-sample video frames; keep `FRAME_CAP`, `VIDEO_MAX_DURATION`; large newsletters × many exports are heavy — prefer Optimized for long clips.
5. **exportAsync race** — already fixed (pre-warm + settle); applies to the video-frame images too.
6. **Tier note** — we use `figma.createImage` (not `createVideoAsync`), so free-tier "can't upload video" does not apply.

---

## 12. Out of scope (say no)

- Reading placed-video bytes without a file — impossible (API wall).
- WMV — no in-browser decode; would need ffmpeg.wasm (~25–30 MB) and breaks the offline-trust story. Defer/skip.
- MP4/WebM **output** — that's the separate "video output" lane; different encoder, later phase.
