# Action Plan — Frame-with-Video → GIF (Cursor execution checklist)

Step-by-step execution of `VIDEO-IN-FRAME-PLAN.md`. Work top to bottom. Do not start a phase until the previous phase's gate passes. Check each box.

**Goal:** select a frame containing a placed video → drop its source file → export the whole frame (video + text + images + GIFs animating together) as one GIF → design left byte-identical.

**Golden rule:** the saved file must be unchanged after export. Restore every fill you touch. Test this first, not last.

---

## Pre-flight

- [ ] `git checkout -b feat/video-in-frame`
- [ ] `npm install && npm run build && npm test && npx tsc --noEmit` all green on v1.4.0 before changing anything.
- [ ] Bump `package.json` version to `1.5.0-dev` (footer stamp = your "is the new build loaded" check).

---

## Phase A — Detection → data

**A1. `code.ts`: add `VideoNodeRef` and collect video fills.**
- [ ] Add type:
  ```ts
  interface VideoNodeRef {
    id: string; fillIndex: number; videoHash: string;
    scaleMode: string; imageTransform?: number[][];
    nodeWidth: number; nodeHeight: number; name: string;
  }
  ```
- [ ] Add `collectVideoFillNodes(node, out)` mirroring `collectImageFillNodes`, matching `fill.type === 'VIDEO'`. Record `fillIndex`, `videoHash`, `scaleMode`, `imageTransform` (only when `scaleMode === 'CROP'`), node `width`/`height`, `name`.

**A2. `code.ts`: emit `videoNodes` per root.**
- [ ] Add `videoNodes: VideoNodeRef[]` to the `Root` interface.
- [ ] Populate it in `scanSelection` for each selected root.
- [ ] Keep `hasPlacedVideo` for now (empty-state hint), but the list is authoritative.
- [ ] Important: a root may have **video only** (no GIF). Current code `continue`s when `imageNodes.length === 0`. Change so a root is included if it has **either** GIF assets **or** video nodes.

**A3. `ui.ts` + `ui.html`: render "source needed" list in the Frame tab.**
- [ ] Receive `videoNodes` in the `roots` handler; store on the selected root.
- [ ] In the Frame tab, when `videoNodes.length > 0`, render one row per video node: `name · W×H` + a drop zone / file input. Reuse the `.drop` styles.
- [ ] Track supplied files in a `Map<nodeId, File>`.

**Gate A:** `npm run build && npx tsc --noEmit` green. Load in Figma, select the CVRE frame → the video node is listed with a drop zone. No export logic yet.

---

## Phase B — Shared video decode

**B1. `ui.ts`: factor out `decodeVideoFile`.**
- [ ] Extract from the Video-tab path a reusable:
  ```ts
  async function decodeVideoFile(file: File, fps: number, maxEdge: number):
    Promise<{ width: number; height: number; durationMs: number; frames: HTMLCanvasElement[] }>
  ```
- [ ] Internally reuse `loadVideo` + `seekVideo`. **Pre-sample all frames once** into canvases (native or scaled to `maxEdge`). Never seek again after this.
- [ ] Refactor the existing Video → GIF tab to call `decodeVideoFile` (no behavior change there — regression-check it still works).

**Gate B:** Video → GIF tab still converts a file correctly (unchanged output). `npm test` green.

---

## Phase C — Composite + unified timeline (core)

**C1. `code.ts`: factor a pure `videoPaintToImagePaint(videoPaint, imageHash)`.**
- [ ] Returns an `ImagePaint` copying `scaleMode`, `imageTransform`, `scalingFactor`, `rotation`, `opacity`, `blendMode`, `visible`, with the new `imageHash`. Pure + exported for tests.

**C2. `code.ts` `renderComposite`: handle VIDEO fills in the swap.**
- [ ] In the per-step swap, branch on `paint.type`:
  ```ts
  if (paint && hash) {
    if (paint.type === 'IMAGE') fills[a.fillIndex] = { ...(paint as ImagePaint), imageHash: hash };
    else if (paint.type === 'VIDEO') fills[a.fillIndex] = videoPaintToImagePaint(paint as VideoPaint, hash);
  }
  ```
- [ ] Confirm the original fills clone (`touched`) already captures the `VideoPaint`, and the `finally` restores it. Do **not** change the restore path.

**C3. `ui.ts` `exportRoot`: generalize to `AnimatedSource`.**
- [ ] Introduce:
  ```ts
  type AnimatedSource =
    | { kind: 'gif'; nodeId: string; fillIndex: number; frames: DecodedFrame[]; cum: number[]; total: number; w: number; h: number }
    | { kind: 'video'; nodeId: string; fillIndex: number; frames: HTMLCanvasElement[]; total: number; w: number; h: number };
  ```
- [ ] Build GIF sources as today. Build video sources by calling `decodeVideoFile` for each supplied file (pre-sampled frames, `total = durationMs`).
- [ ] `totalDuration = max(all totals)`; reuse `planTimeline`.
- [ ] Per step `k` at time `t`: for each source, pick frame at `t % total`; `pngFor(...)` to dedupe into `pngs`; push `{ nodeId, fillIndex, pngIndex }`. (GIF frame → PNG as today; video frame canvas → PNG via `toBlob`/`canvas` → `Uint8Array`.)
- [ ] Send existing `renderComposite` message; encode with the existing global-palette + dither encoder.

**C4. Wire the export button** to require: at least one animated source resolvable (GIF asset or a supplied video file). If a video node has no file, exclude it (see Phase D fallback).

**Gate C:** In Figma — frame with one placed video + dropped file → exports a GIF where the video animates, **aligned inside its node** (crop correct). Re-scan the frame: the node is still a `VideoPaint` (design unchanged).

---

## Phase D — Fallback + multi-video UX

**D1. Frozen-poster fallback.**
- [ ] If a video node has no supplied file at export time, omit it from `AnimatedSource`. It stays `VideoPaint` → `exportAsync` renders its poster each step (frozen). Show a soft note: *"N video(s) exported as a still — drop the source file to animate."*
- [ ] Never block export on a missing video file.

**D2. Multi-video matching.**
- [ ] One node → one drop zone. Multiple → one drop zone per listed node; on drop, bind file to that `nodeId`. Optional aspect-ratio suggestion, user-overridable.

**D3. Cleanup.**
- [ ] Repurpose the old "switch to Video tab" hint — the Frame tab now handles placed video directly. Keep the Video → GIF tab for pure file→GIF.
- [ ] Progress text: "Decoding video…", reuse the frame "Rendering i/N" + "N unique" indicator.

**Gate D:** cases in the matrix below for skip-file and multi-video behave correctly.

---

## Phase E — Tests

**E1. Unit (`test/e2e.mjs`):**
- [ ] `videoPaintToImagePaint` preserves `scaleMode` + `imageTransform`.
- [ ] `JSON.parse(JSON.stringify(videoPaint))` round-trips losslessly (restore safety).
- [ ] Unified timeline: mixed gif+video sources → correct per-source frame index at sampled times; independent looping.

**E2. `npm test && npx tsc --noEmit && npm run build` all green.**

**E3. Manual matrix (only real fidelity check — do all):**
- [ ] 1 video + file → whole frame exports, video animates, crop-aligned.
- [ ] video + GIF in one frame → both animate on one timeline.
- [ ] multiple videos → each matched + animated.
- [ ] skip file → video frozen, rest animates.
- [ ] cropped video (laptop screen) → lands exactly in the screen, no shift/blank.
- [ ] after every export: undo history clean / node still `VideoPaint` → **design byte-identical**.
- [ ] "N unique" indicator > 1 (animation real, not the export race).

---

## Final acceptance

- [ ] Matrix cases 1–3 correct and aligned; case 4 degrades gracefully; case 6 leaves the file untouched.
- [ ] Bump `package.json` to `1.5.0`, `npm run build`, confirm footer version in Figma.
- [ ] Update `ROADMAP.md`: mark this as Phase 1 done.

## Rollback

Each phase is independent and gated. If Phase C corrupts a design in testing, revert `renderComposite` to the IMAGE-only swap — the file stays safe — and fix `videoPaintToImagePaint`/restore before retrying. Never ship with case 6 failing.
