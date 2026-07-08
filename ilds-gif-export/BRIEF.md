# Figma Plugin — GIF Export ("ILDS GIF Export")

Project brief for Cursor. Drop this at repo root as `BRIEF.md`.

---

## 0. Read this first — the hard truth

Figma's plugin API **cannot natively export a GIF**. `exportAsync` only outputs PNG, JPG, SVG, PDF. There is no GIF exporter.

So this plugin does not "render" a GIF. It works one of two ways:

1. **Re-extract** the original GIF bytes already stored in Figma. Works only when a real `.gif` file was placed as an image fill. `image.getBytesAsync()` returns the original file bytes on disk, including animated GIFs. This is the Phase 1 path. Confirmed in Figma docs.
2. **Encode** a GIF from static frames the plugin exports itself. This is the Phase 2 frame-sequence path.

**Prototype / Smart Animate capture is effectively impossible in-plugin.** The API gives no access to prototype playback or interpolated animation frames. Do not promise this. See Phase 2 for the honest scope.

Build in this order. Do not start Phase 2 until Phase 1 ships.

**Scope confirmed:** input is a placed `.gif`, output is that GIF written to local disk (Original) or a re-encoded GIF (Optimized). No frame compositing, no rendering. Figma GIF → local GIF file. Simplest path, take it.

**Plan confirmed:** ILDS is on an Organization license, so private org publishing is available. Publish the same way as the existing ILDS token plugin.

---

## 1. What the plugin does (Phase 1 scope)

User selects a frame (or any node) that contains a placed GIF. Plugin:

1. Detects GIF image fills inside the selection.
2. Offers two export modes:
   - **Original** — download the exact GIF bytes, lossless, unchanged.
   - **Optimized** — re-encode with user-controlled size/quality options.
3. Triggers a file download to the user's local disk.

That is the whole Phase 1 product. Ship it before anything else.

---

## 2. Architecture

Standard Figma plugin = two contexts.

```
manifest.json      → plugin config
src/code.ts        → sandbox (no DOM, has figma API, no libraries/window)
src/ui.html        → iframe (has DOM, can load libs, can trigger downloads)
src/ui.ts          → UI logic (bundled into ui.html)
```

**Why the split matters:** the sandbox has the Figma API but cannot download files or run GIF libraries. The iframe can download and run libraries but cannot touch the Figma document. They talk via `figma.ui.postMessage` / `parent.postMessage`. Bytes flow sandbox → UI.

### Data flow (Phase 1)
```
User selects frame
  → code.ts reads selection
  → finds nodes with ImagePaint fills
  → figma.getImageByHash(hash).getBytesAsync()  → Uint8Array
  → check magic bytes for "GIF87a" / "GIF89a"
  → postMessage bytes to UI
  → ui.ts: either download raw, or pipe through optimizer
  → Blob + <a download> → file hits disk
```

---

## 3. Tech stack

- **Language:** TypeScript.
- **Bundler:** esbuild (fast, simple) or Vite with `vite-plugin-singlefile` to inline UI into one HTML.
- **Figma types:** `@figma/plugin-typings`.
- **GIF optimizer:** `gifsicle-wasm-browser`. Runs the real gifsicle compiled to WASM in the iframe. One library covers lossy compression, color reduction, resize, and optimization level. Do not hand-roll a GIF encoder for Phase 1.
- **Optional fallback encoder (Phase 2):** `gifenc` (fast pure-JS encoder) + `gifuct-js` (decoder) if you need frame-level control gifsicle can't give.

**Decision:** use `gifsicle-wasm-browser` for all optimization. It is the single strongest lever for size and quality.

---

## 4. GIF detection logic (code.ts)

A "frame with a GIF" means a node inside the selection has a fill of type `IMAGE` whose bytes start with the GIF magic number. Only GIFs animate, so magic-byte check is the filter.

```ts
// Recursively collect image hashes from a node and its children.
function collectImageHashes(node: SceneNode, out: string[]) {
  if ('fills' in node && Array.isArray(node.fills)) {
    for (const f of node.fills) {
      if (f.type === 'IMAGE' && f.imageHash) out.push(f.imageHash);
    }
  }
  if ('children' in node) for (const c of node.children) collectImageHashes(c, out);
}

function isGif(bytes: Uint8Array): boolean {
  // "GIF87a" or "GIF89a"
  const sig = String.fromCharCode(...bytes.slice(0, 6));
  return sig === 'GIF87a' || sig === 'GIF89a';
}
```

For each hash: `const img = figma.getImageByHash(hash); const bytes = await img.getBytesAsync();` then test `isGif(bytes)`. Only send GIFs to the UI. If a frame has multiple GIFs, list them and let the user pick.

**Edge cases to handle:**
- No selection → show empty state.
- Selection has no GIF fill → clear message: "No GIF found in selection."
- Multiple GIFs → picker.
- GIF is a fill on a rotated/masked node → you still export the original file, not the composited view. Tell the user this: Original mode = the source GIF, not a re-render of the frame.

---

## 5. Optimization options (UI)

Expose these controls in the Optimized panel. All map to gifsicle flags.

| Control | UI element | gifsicle flag | Notes |
|---|---|---|---|
| Lossy compression | slider 0–200 | `--lossy=N` | Biggest size win. 30–80 is a good default range. |
| Colors | dropdown 256/128/64/32 | `--colors=N` | Fewer colors = smaller, more banding. |
| Scale | dropdown 100/75/50/25% | `--scale=N` | Resizes pixel dimensions. |
| Optimization | fixed | `-O3` | Always on. Frame-diff optimization. |
| Dithering | toggle | `--dither` | On preserves gradients when reducing colors. |
| Frame skip | dropdown keep all / every 2nd | (drop frames) | Cuts frame count for size. Advanced. |

Always show **before/after file size** and a preview of the optimized GIF before download. Users need to see the tradeoff, not guess.

Example call:
```ts
const out = await gifsicle.run({
  input: [{ file: bytes, name: 'in.gif' }],
  command: [`-O3 --lossy=${lossy} --colors=${colors} --scale=${scale} in.gif -o /out/out.gif`],
});
```

---

## 6. Download (ui.ts)

```ts
const blob = new Blob([outBytes], { type: 'image/gif' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = `${name}.gif`;
a.click();
URL.revokeObjectURL(url);
```

The download runs in the iframe, which is allowed. The sandbox cannot do this.

---

## 7. manifest.json

```json
{
  "name": "ILDS GIF Export",
  "id": "REPLACE_AFTER_FIRST_PUBLISH",
  "api": "1.0.0",
  "main": "dist/code.js",
  "ui": "dist/ui.html",
  "editorType": ["figma"],
  "networkAccess": {
    "allowedDomains": ["none"],
    "reasoning": "All processing is local. No network calls."
  }
}
```

Keep `networkAccess` locked to `none`. gifsicle-wasm runs locally; if the WASM is bundled you need no domains. This is a strong trust signal for org review.

---

## 8. Repo structure

```
ilds-gif-export/
  manifest.json
  package.json
  tsconfig.json
  build.mjs            (esbuild config)
  src/
    code.ts            (sandbox: detect + extract GIF bytes)
    ui.html            (markup + styles)
    ui.ts              (UI logic, optimizer, download)
  dist/                (build output: code.js, ui.html)
  README.md
```

`package.json` scripts:
```json
{
  "scripts": {
    "build": "node build.mjs",
    "watch": "node build.mjs --watch"
  }
}
```

---

## 9. Build phases

### Phase 1 — Placed GIF export (ship this alone)
1. Scaffold repo, manifest, build, empty UI. Load in Figma via Plugins → Development → Import from manifest.
2. Selection detection + GIF magic-byte filter in `code.ts`.
3. Post bytes to UI; implement **Original** download. Test end to end.
4. Add **Optimized** panel + gifsicle-wasm integration.
5. Before/after size + preview.
6. Empty states, multi-GIF picker, error handling.
7. Polish UI to match ILDS design system tokens.
8. Internal test, then publish private to org (Section 11).

### Phase 2 — Frame sequence → GIF (feasible)
User selects multiple frames. Plugin `exportAsync` each as PNG at chosen scale, then encodes an animated GIF with a user-set frame delay.
1. Multi-frame selection + ordering UI.
2. `node.exportAsync({ format: 'PNG', constraint: { type: 'SCALE', value } })` per frame.
3. Encode with `gifenc` (per-frame control) or feed PNGs to gifsicle.
4. Frame delay / loop controls, reuse the Phase 1 optimizer.

### Phase 2b — Prototype / Smart Animate → GIF (DO NOT COMMIT TO THIS)
The plugin API cannot render prototype playback or smart-animate interpolation. There is no supported way to capture these frames inside a plugin. Honest options, all outside the plugin sandbox:
- Manual: user duplicates key states as frames, then uses Phase 2 frame-sequence. Documented workflow, not automation.
- Companion screen-recording of the prototype player (separate browser tool), then convert video → GIF. This is a different product, not a Figma plugin feature.

Do not tell users the plugin "exports prototypes as GIF." It cannot. Scope Phase 2 as frame-sequence only and treat prototype capture as a documented manual workflow at best.

---

## 10. Testing

- Unit: `isGif`, hash collection, gifsicle flag builder.
- Fixtures: small animated GIF, static GIF, PNG-only frame, frame with 2 GIFs, empty selection.
- Manual matrix: Original vs Optimized at each color/lossy/scale setting; verify file plays and size drops.
- Verify download filename and that output opens in a browser and Preview.

---

## 11. Publishing

Two paths. You chose "decide later" — here is both.

### A. Private to your organization (ILDS) — chosen path
Recommended for an internal design-system tool. ILDS is on an Organization license, so this is available (confirmed). Private plugins are not reviewed by Figma and are visible only to org members, not guests. Publish exactly like the existing ILDS token plugin.

Steps:
1. In the Figma desktop app, open the plugin: right-click → Plugins → Development → your plugin → **Publish**.
2. Choose **"Only for members of <your org>"** (private) instead of Community.
3. Fill name, description, icon (128×128), tagline.
4. Publish. It appears under the org's private plugins for all members.
5. Updates: bump code, Publish again → new version.

### B. Public Figma Community
Anyone can install. Free. Goes through Figma review.
1. Same Publish flow, choose **Community** visibility.
2. Provide icon, cover art (1920×960), description, tags, support contact.
3. Submit for review. Figma checks it before it goes live.
4. Iterate on any review feedback.

**Recommendation:** publish private to ILDS first. Validate with your team. Only go Community later if you want it public — Community means review, support burden, and public visibility of the code.

---

## 12. Risks / things that will bite you

- **"Export the frame as GIF" ≠ "download the source GIF."** Original mode returns the placed file, ignoring frame transforms, overlays, or masks. Set this expectation in the UI copy.
- If the GIF was **pasted as a flattened image** or converted, the stored bytes may not be a GIF — magic-byte check handles this, but tell the user why nothing exported.
- **WASM size:** gifsicle-wasm adds weight to the bundle. Lazy-load it only when the user opens the Optimize panel.
- **Large GIFs** can freeze the iframe during encode. Show a progress state; consider a size warning above ~10 MB.
- **Reuse the token plugin's setup.** Copy the existing ILDS token plugin's manifest publish flow, org visibility settings, and icon/spec conventions so this ships identically. Match its repo conventions where they exist.

---

## 13. Definition of done (Phase 1)

- Select a frame with a placed GIF → plugin detects it.
- Original download produces a byte-identical, playable GIF.
- Optimized download is smaller, still plays, controls work, before/after size shown.
- Empty/error states are clear.
- Published private to ILDS, installable by team members.

---

## Sources
- [Figma — Working with Images](https://developers.figma.com/docs/plugins/working-with-images/)
- [Figma — Image API (getBytesAsync)](https://www.figma.com/plugin-docs/api/Image/)
- [Figma — exportAsync](https://www.figma.com/plugin-docs/api/properties/nodes-exportasync/)
- [Figma — Create private plugins for an organization](https://help.figma.com/hc/en-us/articles/4404228629655-Create-private-plugins-for-an-organization)
- [Figma — Publish plugins to the Community](https://help.figma.com/hc/en-us/articles/360042293394-Publish-plugins-to-the-Figma-Community)
