# ILDS GIF Export

Figma plugin with two modes:

- **Frame → GIF** — select a frame that contains a placed GIF and export the **whole frame** (the GIF composited with everything else) as an animated GIF. Choose **Original size** or **Optimized size**.
- **Video → GIF** — drop a video file (MP4, MOV, WebM) into the plugin and convert it to an animated GIF, fully offline.

Side project. Separate from the ILDS design-system work.

## What it does

### Frame → GIF
- Scans your selection for placed `.gif` image fills.
- Confirms they are real GIFs by magic bytes (`GIF87a` / `GIF89a`).
- Always exports the **whole frame** as an animated GIF: every GIF in the frame animates together on a shared timeline, composited with every other layer (backgrounds, text, overlays, masks, effects, rotation). Multiple GIFs — including the same GIF placed more than once — are all animated. Figma does the compositing, one timeline step at a time.
- **Original size** (default) — full frame resolution (longest edge capped at 2048px), 256 colors, all frames.
- **Optimized size** — smaller: choose scale (default 75%), color count (default 256), and frame sampling.

### Video → GIF
- Upload a video file; it's decoded entirely in the plugin iframe (a Chromium context) — the Figma document is never touched.
- The video is loaded into a `<video>` element, seeked to evenly spaced timestamps, and each frame is drawn to a canvas. Those RGBA frames feed the **same global-palette + dithering encoder** as the frame path.
- Controls: frame rate (10/15/24 fps), scale, colors.
- **Destination:** choose **Download file** or **Place in Figma**. "Place in Figma" drops the finished GIF onto the canvas as an image fill on a new rectangle (Figma animates GIF fills), so you never have to download and re-import.
- Defaults guard output size: longest edge capped at 800px, duration capped at 30s, frame count capped at 150.
- **Avoid round-tripping.** Converting a video → GIF, placing that GIF back in a frame, and re-exporting the frame re-encodes already-lossy, dithered pixels. Dither noise defeats GIF/LZW compression, so the file balloons (a full-res 144-frame re-export can exceed 30 MB and fail in email/Slack). Use **Place in Figma** to keep the single conversion, or re-export with fewer colors / smaller scale / frame skipping. A ⚠ warning appears when an export exceeds ~5 MB.
- **Codecs:** only browser-native formats decode — **MP4 (H.264), MOV, WebM**. **WMV is not supported** (browsers can't decode it; it would require bundling `ffmpeg.wasm`). Deferred.
- **Placed videos on the canvas are not readable** by the plugin API (Figma's `Video` object exposes only a hash, no byte access), so the plugin detects a placed video and nudges you to drop the source file into this tab instead.

Fully offline in both modes. No network calls. `networkAccess` is locked to `none`.

## How whole-frame export works (Figma-composited)

Figma's plugin API cannot output GIF and cannot render an animated GIF's individual frames. So the plugin lets **Figma** do the compositing, one animation frame at a time:

1. The UI decodes every placed GIF and builds one shared timeline (GIFs of different lengths each loop independently).
2. For each timeline step it hands the sandbox the right frame PNG for each GIF. The sandbox swaps each GIF node's image fill to that frame and calls `exportAsync` on the whole frame.
3. Because Figma renders the export, **layer order, blend modes, masks, effects, rotation and transparency are all honored exactly as on the canvas** — anything stacked above a GIF stays above it.
4. The composited frames are re-encoded into one animated GIF with `gifenc`.

This is the only approach that reproduces the frame faithfully. Drawing the GIF pixels ourselves cannot respect layers on top of the GIF.

### Faithful color: one global palette + dithering

A GIF holds at most `colors` entries. Plain nearest-color mapping snaps every low-contrast pixel to the dominant background, so **faint content silently disappears** (a subtle particle sphere, skyline line-art, smooth gradients) — worse the fewer colors you allow. Two things prevent that:

1. **One global palette** shared by every frame. It's sampled evenly across the whole animation (uniform striding preserves each color's proportion), so animated and faint colors get palette entries instead of being dropped into the background. Sharing one palette also means static regions render identically frame to frame — no palette shimmer.
2. **Floyd–Steinberg error diffusion.** Recovers gradients and faint detail as a stable dither pattern. It's deterministic (same pixels + palette → same indices), and flat areas that match a palette color diffuse ~zero error, so large solids stay clean and steady across frames.

Frame 0 writes the global color table; later frames reuse it (no local tables).

## Scope limits & costs (read these)

- **Opaque GIF backgrounds:** a GIF whose background is baked opaque (many are) shows that background. To drop it against a colored frame, set that layer's **blend mode to Multiply or Darken** in Figma — the export honors it because Figma composites the blend. GIF format has no real alpha channel, so the plugin cannot invent transparency the asset doesn't have.
- **Document images:** each distinct GIF frame is briefly added to the file via `figma.createImage` to drive the export. They become unreferenced once original fills are restored, so Figma garbage-collects them — but expect a temporary size bump during export.
- **Payload / time:** the frame is exported once per timeline step. Long or high-resolution clips move more data and take longer. Prefer **Optimized size** (lower fps / scale) for those; output is capped at 150 frames.
- **Transparency in the output** is flattened to opaque (the encoder ignores alpha). Figma-rendered frames are opaque when the frame has a background.
- Only placed GIF files are detected. Prototype/Smart-Animate capture is **not** possible in a plugin and is out of scope.

## Setup

Requires Node 18+.

```bash
npm install
npm run build      # outputs dist/code.js and dist/ui.html
npm run watch      # rebuild on change while developing
npm run typecheck  # tsc --noEmit
```

## Load in Figma

1. Figma desktop app → menu → Plugins → Development → **Import plugin from manifest…**
2. Pick `manifest.json` in this folder.
3. Run it: Plugins → Development → **ILDS GIF Export**.
4. Select a frame containing a GIF. The plugin lists detected GIFs. Pick one, choose **Original size** or **Optimized size**, click **Export frame as GIF**. The file downloads to your browser/OS download location.

> **After changing code you must `npm run build`, then fully close and reopen the plugin in Figma.** The plugin loads the compiled `dist/`, not `src/`. The plugin footer shows `vX.Y.Z · built <date time>` — check it matches your last build so you never chase a stale `dist/` again.

## How it is built

Two contexts, standard Figma split:

- `src/code.ts` — sandbox. Has the Figma API, no DOM. Detects GIFs, and on export swaps each GIF node's fill to the current frame and `exportAsync`-es the whole frame per timeline step, restoring fills afterward.
- `src/ui.ts` + `src/ui.html` — iframe. Has the DOM and libraries. Decodes with `gifuct-js`, builds the timeline + frame PNGs, re-encodes the composited frames with `gifenc`, triggers the download.
- `build.mjs` — esbuild. Bundles `code.ts` to `dist/code.js`, bundles `ui.ts` and inlines it into `dist/ui.html` (single file, no external requests).

## Publish to ILDS (private org)

ILDS is on an Organization license, so private publishing is available. Publish exactly like the existing ILDS token plugin.

1. Add a `128×128` plugin icon and set an `id` — Figma assigns the `id` on first publish; paste it back into `manifest.json`.
2. In Figma: right-click the plugin → Plugins → Development → **Publish**.
3. Set visibility to **your organization only** (private), not Community.
4. Fill name, description, tagline. Publish.
5. Team members find it under the org's private plugins.
6. To update: rebuild, then Publish again to ship a new version.

## Verification done

- `tsc --noEmit` passes clean.
- `npm run build` produces `dist/code.js` and a single self-contained `dist/ui.html` (verified on a clean install).
- `npm test` — 31/31 headless tests pass: detection, decode, timeline math, scale capping, and a real animated-GIF re-encode round trip. Figma compositing (fill swap + exportAsync) is validated only inside Figma.

## Phase 2 (later, not now)

- Frame sequence → animated GIF: `exportAsync` each selected frame as PNG, encode with delay/loop controls.
- Transparency-preserving optimization.
- Prototype capture stays out of scope — the plugin API cannot render prototype playback.
