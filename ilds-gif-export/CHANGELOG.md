# Changelog — ILDS GIF Export

All notable changes to the plugin. The footer in the plugin UI (`v… · built …`)
always reflects the loaded build.

## v1.6.0 — Placed video in the frame

The headline: a frame that contains a **placed video** now exports as an animated
GIF, with the video composited alongside everything else. This closes the last
asset-type gap — a single frame can now mix video, GIFs, images, gradients, text,
vectors, effects, masks and blend modes and export as one HQ animated GIF.

### Added
- **Placed-video → GIF.** Select a frame with a placed video, drop its source
  file into the per-video drop zone, and export. Each video is matched to its
  node; multiple videos and GIFs animate together on one shared timeline, each
  looping independently.
- **Every asset type in one export.** Figma re-renders the whole frame per
  timeline step, so layer order, masks, blend modes, effects, gradients and text
  are all preserved exactly as on canvas.
- **High-resolution video sampling.** Placed videos are sampled at the node's
  rendered size × export scale (up to 2048px) instead of a flat 800px ceiling —
  large videos stay sharp in "Original size".
- **Decode progress.** Video decoding shows a live `Decoding video N/total…`
  counter and yields to the UI, so large (4K) sources no longer look frozen.

### Fixed
- **Blank/white frames at scale.** On long clips (144+ frames) Figma evicted
  already-decoded images under memory pressure, so `exportAsync` captured
  undecoded (white) fills. Images are now decoded *after* being referenced by a
  node, with a real-millisecond settle — no more intermittent blank frames.
- **`in set_fills: Invalid SHA1 hash` on video frames.** Writing any fills array
  containing a video paint is rejected by Figma (a known platform bug: video
  paints carry hidden keys the validator refuses). The engine no longer writes to
  video nodes at all — it composites each video frame on a temporary **overlay**
  node placed exactly over the video, then deletes it. The design is never
  mutated, so it stays byte-identical after export.
- **Video seek race → blank samples.** `seekVideo` now waits for
  `requestVideoFrameCallback` (frame actually painted) before drawing.
- **Placed-GIF sizing.** "Place in Figma" scales the GIF to the viewport instead
  of dropping a giant rectangle over the design.

### Changed
- A video-only frame with no source file exports a still-frame GIF (video as its
  poster, everything else pixel-perfect) with an honest "still image" note —
  it never blocks or errors.

### Notes / known limits
- A placed video **requires its source file** to animate. Figma exposes no way to
  read a placed video's pixels (no plugin-API byte access, no REST video-fill
  download) — every plugin that composites video works this way. Without a file,
  the video exports as a still.
- Caps: up to 2048px longest edge, 256 colors, 150 frames, 30s of video.

## v1.4.1 — baseline

Whole-frame GIF export (fill-swap + `exportAsync`), multi-GIF shared timeline,
global palette + Floyd–Steinberg dithering, Original/Optimized sizes, the
Video → GIF tab, and Place-in-Figma. Fully offline.
