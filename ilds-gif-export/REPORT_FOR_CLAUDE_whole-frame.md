# ILDS GIF Export — Whole-Frame Export: Status Report for Claude

**Date:** 2026-07-08
**Author:** Cursor (agent)
**Project:** `ilds-design-system/ilds-gif-export` (standalone Figma plugin, separate from the ILDS control-plane work)
**Status:** Whole-frame export implemented; **failing at runtime in Figma**; a UX redesign is also requested. No fix applied yet — awaiting Claude's review.

---

## 1. What this plugin is

A Figma plugin that exports a placed GIF from a selected frame to local disk. It has two contexts (standard Figma split):

- `src/code.ts` — sandbox. Has the Figma API, no DOM. Detects placed GIFs, reads their bytes, and (new) composites the frame per-animation-frame via `exportAsync`.
- `src/ui.ts` + `src/ui.html` — iframe. Has DOM + libraries (`gifuct-js` decode, `gifenc` encode). Decodes GIFs, drives the export, downloads the file.
- `build.mjs` — esbuild; bundles `code.ts` → `dist/code.js` and inlines `ui.ts` into `dist/ui.html`.

Figma constraint that shapes everything: **`exportAsync` cannot output GIF and cannot render an animated GIF's frames.** GIF output must be re-encoded in the UI iframe.

---

## 2. What I implemented this session

Original Phase 1 exported only the **source GIF file bytes** (ignoring the rest of the frame). The user reported this as a bug: the export must include everything else in the frame around the GIF.

I added a **"Whole frame"** export mode that composites the GIF animation together with all other layers in the frame. Mechanism:

1. UI decodes the placed GIF into full-size composited frames (`decodeGifToFrames`, handling partial-frame patches + disposal method 2).
2. For each kept frame, UI renders a full-size PNG and posts the batch to the sandbox (`renderComposite` message).
3. Sandbox temporarily swaps the GIF node's image fill to each frame's PNG (`figma.createImage` → set `imageHash`) and calls `exportAsync({ format: 'PNG', constraint: SCALE })` on the **enclosing frame**, so Figma composites the whole layout for that instant.
4. Sandbox posts the composited PNGs back; original fill is always restored in a `finally`.
5. UI re-encodes those PNGs into a single animated GIF (`encodePngFramesToGif`) and downloads it.

Design safeguards implemented:
- Original fill restored even on mid-export failure (`finally`).
- `figma.createImage` is content-addressed → bounded file growth on repeat exports.
- Frame sampling (`sampleFrames`) merges skipped-frame delays (and flushes trailing delay onto the last kept frame) so total playback duration is preserved.
- Progress reporting (`compositeProgress`), error channel (`compositeError`), soft cap at >150 kept frames.

### Files changed
- `src/code.ts` — track per-GIF `id` / `fillIndex` / `exportRootId`; new `renderComposite` handler.
- `src/ui.ts` — shared decoder, `sampleFrames`, `optimize` refactor, `exportWholeFrame`, `encodePngFramesToGif`, composite round-trip.
- `src/ui.html` — added "Whole frame" mode button + copy.
- `README.md` — documented the mode.
- `test/e2e.mjs` — mirrored refactor + added frame-sampling/delay tests. **32/32 headless tests passed.**

Note: headless tests cover the pure decode/encode/sampling math. They **cannot** cover the Figma-runtime pieces (`exportAsync`, `createImageBitmap`, `createImage`, `toBlob`), which is exactly where the runtime failure is.

---

## 3. THE BUG (currently failing)

### Symptom
In Figma, selecting a real frame (720×720 GIF inside a 1049×1323 frame) and clicking **Export frame as GIF** fails with:

> Export failed: Failed to execute 'getImageData' on 'CanvasRenderingContext2D': The source width is 0.

(See the two screenshots the user attached: the plugin panel shows the error; the frame renders fine, so the source content is valid.)

### Root cause — high confidence
In `src/ui.ts`, function `encodePngFramesToGif` (around lines 240–249):

```ts
const bmp = await createImageBitmap(new Blob([copy], { type: 'image/png' }));
const [, ctx] = makeCanvas(bmp.width, bmp.height);   // width correct here
ctx.drawImage(bmp, 0, 0);                            // draw works
bmp.close();                                         // <-- releases the bitmap
const data = ctx.getImageData(0, 0, bmp.width, bmp.height).data;  // bmp.width is now 0 -> throws
...
enc.writeFrame(index, bmp.width, bmp.height, { palette, delay: delays[i] }); // also 0
```

**`ImageBitmap.close()` sets `width`/`height` to 0.** I call `bmp.close()` *before* reading `bmp.width`/`bmp.height` in `getImageData` (and again in `writeFrame`). So `getImageData(0, 0, 0, 0)` throws exactly "The source width is 0".

Encouraging implication: because the error is in the **re-encode stage**, the Figma composite round-trip (fill-swap + `exportAsync` per frame + restore) very likely **already worked** — the sandbox returned valid composited PNGs. Only the final encode is broken.

### The fix I want to apply
Capture dimensions before closing (and use those locals everywhere):

```ts
const bmp = await createImageBitmap(new Blob([copy], { type: 'image/png' }));
const w = bmp.width, h = bmp.height;
const [, ctx] = makeCanvas(w, h);
ctx.drawImage(bmp, 0, 0);
const data = ctx.getImageData(0, 0, w, h).data;   // read before close
bmp.close();
const palette = quantize(data, colors);
const index = applyPalette(data, palette);
enc.writeFrame(index, w, h, { palette, delay: delays[i] });
```

### Secondary possibility to rule out (lower likelihood)
If it still fails after the above, the other `getImageData` call is in `decodeGifToFrames` (`actx.getImageData(0, 0, W, H)` with `W = gif.lsd.width`). If `W` were 0, the same error would appear *before* compositing. The 720×720 shown in the UI comes from `getSizeAsync` (image), not `gif.lsd`, so this is unlikely — but worth a guard (`if (!W || !H) throw` with a clear message) to disambiguate.

---

## 4. THE UX REDESIGN (requested by user)

The user wants the mode model changed:

> "The option of whole frame should not be exclusive to other options (Original and Optimised). Every time it has to be whole frame only, not a selection given to users. Options users select are original size or optimised size."

### Meaning
- **Whole-frame compositing is always on.** It is no longer one of three modes.
- Remove the ability to export "just the source GIF file".
- The only user choice is the **output size**:
  - **Original size** — whole frame at full resolution / max fidelity.
  - **Optimized size** — whole frame, smaller (size/quality controls).

### Proposed implementation
Replace the current 3-button mode row (`Whole frame | Original | Optimized`) with a 2-button size selector (`Original size | Optimized size`). Both paths run the **same** whole-frame composite pipeline (`exportWholeFrame`), differing only in encode options:

| Option | scale | colors | frames | controls shown |
|---|---|---|---|---|
| **Original size** | 100% | 256 | keep all | none (fixed, max fidelity) |
| **Optimized size** | user | user | user | scale / colors / frames dropdowns |

Concretely:
- `src/ui.html`: change the `.modes` block to two buttons (`modeOriginal`, `modeOptimized`), remove `modeFrame`. Keep the `#opts` panel, shown only for **Optimized size**.
- `src/ui.ts`: collapse `type Mode` to `'original' | 'optimized'`; both call `exportWholeFrame(...)`. For **Original size**, pass `{ scale: 1, colors: 256, frameStep: 1 }` and hide `#opts`. For **Optimized size**, pass `readOpts()`. Delete the raw-source-GIF download branch and the source-GIF `optimize()` path (or keep `optimize()` only as an internal helper — it is now unused by the UI since everything is whole-frame; can be removed).
- `src/code.ts`: unchanged (already whole-frame capable).
- Filenames: `name.gif` for original size, `name-optimized.gif` for optimized size (use the export-root/frame name).
- README + tests: update copy and drop assertions about source-GIF-only export; keep the composite/sampling tests.

### Open question for Claude
"Original size" whole-frame GIFs can be **large** (full-res frame × N GIF frames, 256 colors). Options to consider:
1. Ship as-is (user explicitly asked for original size).
2. Keep an internal size warning above some threshold.
3. Consider `constraint: SCALE 1` vs exporting at the GIF's native size (currently the frame is exported at the frame's own pixel size, which for 1049×1323 is large). Should "Original size" mean the frame's full pixel size, or capped? Recommend: full pixel size (true "original"), with a soft warning.

---

## 5. Performance / correctness notes for review

- **Per-frame `exportAsync`**: whole-frame export renders the frame once per kept GIF frame. For long GIFs this is slow and memory-heavy. Current soft cap: >150 kept frames throws and asks the user to raise sampling. Claude may want a different cap or a scale-down-first strategy.
- **File growth**: `createImage` dedupes by content hash, so distinct frames add at most one image each; repeat exports of the same GIF reuse hashes. Acceptable, but the images do persist in the document.
- **Undo history**: each `node.fills = ...` assignment during compositing may create undo entries. Not currently batched (no transaction API). Worth confirming this is acceptable UX.
- **`createImageBitmap` availability**: assumed present in the Figma plugin iframe (Chromium/Electron). If unavailable, an alternative PNG-decode path (e.g. `<img>` + canvas draw) would be needed. The current bug masks whether this is an issue — after the fix, verify this call actually succeeds in Figma.

---

## 6. Current test status

- `npm run typecheck` — clean.
- `npm run build` — produces `dist/code.js` + single `dist/ui.html`.
- `npm test` (`test/e2e.mjs`) — **32/32 pass** (detection, decode, optimize, scale, frame-sampling/delay-merge, safeName). These do **not** exercise the Figma-runtime path where the failure lives.

---

## 7. Summary of what I want to do next (pending Claude's OK)

1. **Fix the bug**: read `bmp.width`/`bmp.height` into locals before `bmp.close()` in `encodePngFramesToGif` (Section 3).
2. **Redesign UX**: make whole-frame always-on; replace the 3-mode toggle with **Original size / Optimized size** (Section 4).
3. Add a guard in `decodeGifToFrames` for zero dimensions to disambiguate future failures.
4. Rebuild, re-run headless tests, and hand back to the user for in-Figma verification (the runtime path can only be validated inside Figma).

Please review the root-cause diagnosis in Section 3 and the redesign in Section 4, and suggest any changes before I implement.
