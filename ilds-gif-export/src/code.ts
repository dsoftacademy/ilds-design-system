// Sandbox context. Has the Figma API. No DOM, no libraries, cannot download.
//
// FIGMA-COMPOSITED ARCHITECTURE (the correct one):
//   1. Detect placed GIFs in the selection, grouped by the frame (export root).
//   2. On export, for each timeline step, swap EVERY GIF node's image fill to
//      that GIF's current frame, then exportAsync the whole frame. FIGMA does the
//      compositing — so layer order (things ABOVE the GIF stay above), blend
//      modes, masks, effects, rotation and transparency are all honored exactly
//      as seen on the canvas. Original fills are always restored afterward.
//
// This is the only approach that reproduces the frame faithfully. Drawing the
// GIF ourselves (overlay) cannot respect layers stacked on top of the GIF.

figma.showUI(__html__, { width: 360, height: 560, themeColors: true });

// A real GIF file starts with "GIF87a" or "GIF89a". Only GIFs animate, so this
// magic-byte check separates a placed GIF from a PNG/JPG image fill.
function isGif(b: Uint8Array): boolean {
  if (b.length < 6) return false;
  const s = String.fromCharCode(b[0], b[1], b[2], b[3], b[4], b[5]);
  return s === 'GIF87a' || s === 'GIF89a';
}

interface GifNodeRef {
  id: string;
  fillIndex: number;
  hash: string;
  name: string;
}

// A placed video fill. Figma exposes no way to read the video's pixels, so the
// user must supply the source file — but we DO need the fill's geometry so the
// swapped-in image lands in exactly the same box (crop/fit) as the video.
interface VideoNodeRef {
  id: string;
  fillIndex: number;
  videoHash: string;
  scaleMode: string;
  imageTransform?: number[][];
  nodeWidth: number;
  nodeHeight: number;
  name: string;
}

interface Asset {
  hash: string;
  bytes: Uint8Array;
  width: number;
  height: number;
  size: number;
}

interface Root {
  id: string;
  name: string;
  width: number;
  height: number;
  gifNodes: GifNodeRef[];
  assets: Asset[];
  videoNodes: VideoNodeRef[];
}

// Record every image-fill node (not deduped — each node instance needs its own
// fill swapped). GIF vs non-GIF is resolved later by reading bytes.
function collectImageFillNodes(node: SceneNode, out: GifNodeRef[], hashes: Set<string>) {
  const anyNode = node as unknown as { fills?: readonly Paint[] };
  if (Array.isArray(anyNode.fills)) {
    anyNode.fills.forEach((fill, index) => {
      if (fill.type === 'IMAGE' && fill.imageHash) {
        out.push({ id: node.id, fillIndex: index, hash: fill.imageHash, name: node.name });
        hashes.add(fill.imageHash);
      }
    });
  }
  if ('children' in node) {
    for (const child of (node as ChildrenMixin).children) {
      collectImageFillNodes(child as SceneNode, out, hashes);
    }
  }
}

// Collect every placed VIDEO fill in the node tree, capturing the geometry we
// need to reconstruct the fill as an IMAGE at export time (scaleMode + the crop
// transform). Figma exposes no way to read a placed video's pixels, so the user
// supplies the source file; this list drives the "drop a file per video" UI.
function collectVideoFillNodes(node: SceneNode, out: VideoNodeRef[]) {
  const anyNode = node as unknown as {
    fills?: readonly Paint[];
    width?: number;
    height?: number;
  };
  if (Array.isArray(anyNode.fills)) {
    anyNode.fills.forEach((fill, index) => {
      const f = fill as {
        type: string;
        videoHash?: string | null;
        scaleMode?: string;
        videoTransform?: number[][];
        imageTransform?: number[][];
      };
      if (f.type === 'VIDEO') {
        out.push({
          id: node.id,
          fillIndex: index,
          videoHash: f.videoHash || '',
          scaleMode: f.scaleMode || 'FILL',
          // Crop transform only matters for CROP. Documented as videoTransform,
          // but real paints sometimes expose it as imageTransform (Figma bug).
          imageTransform: f.scaleMode === 'CROP' ? f.videoTransform || f.imageTransform : undefined,
          nodeWidth: anyNode.width || 0,
          nodeHeight: anyNode.height || 0,
          name: node.name,
        });
      }
    });
  }
  if ('children' in node) {
    for (const child of (node as ChildrenMixin).children) {
      collectVideoFillNodes(child as SceneNode, out);
    }
  }
}

async function scanSelection() {
  const selection = figma.currentPage.selection;
  const roots: Root[] = [];
  let hasPlacedVideo = false;

  for (const sel of selection) {
    const imageNodes: GifNodeRef[] = [];
    const hashes = new Set<string>();
    collectImageFillNodes(sel, imageNodes, hashes);

    const videoNodes: VideoNodeRef[] = [];
    collectVideoFillNodes(sel, videoNodes);
    if (videoNodes.length > 0) hasPlacedVideo = true;

    const assets: Asset[] = [];
    const gifHashes = new Set<string>();
    for (const h of hashes) {
      const image = figma.getImageByHash(h);
      if (!image) continue;
      try {
        const bytes = await image.getBytesAsync();
        if (!isGif(bytes)) continue;
        let width = 0;
        let height = 0;
        try {
          const size = await image.getSizeAsync();
          width = size.width;
          height = size.height;
        } catch (e) {
          // dimensions stay 0 on older API
        }
        assets.push({ hash: h, bytes, width, height, size: bytes.length });
        gifHashes.add(h);
      } catch (e) {
        // skip unreadable fills
      }
    }

    // Include the frame if it has EITHER animatable GIF assets OR placed videos
    // (which become animatable once the user drops the source file).
    if (assets.length === 0 && videoNodes.length === 0) continue;

    const layout = sel as unknown as { width?: number; height?: number };
    roots.push({
      id: sel.id,
      name: sel.name,
      width: layout.width || 0,
      height: layout.height || 0,
      gifNodes: imageNodes.filter((n) => gifHashes.has(n.hash)),
      assets,
      videoNodes,
    });
  }

  figma.ui.postMessage({ type: 'roots', roots, hasSelection: selection.length > 0, hasPlacedVideo });
}

// Multi-GIF composite. The UI sends a deduped list of frame PNGs plus a timeline
// of steps; each step assigns a PNG to every GIF node for that instant. We create
// one Figma image per PNG (content-addressed → bounded growth, and the images
// become unreferenced once fills are restored), swap fills, and exportAsync the
// frame once per step so Figma renders the whole composited layout.
interface Assignment { nodeId: string; fillIndex: number; pngIndex: number; }
interface Step { assignments: Assignment[]; }
interface RenderMsg {
  type: 'renderComposite';
  exportRootId: string;
  scale: number;
  pngs: Uint8Array[];
  steps: Step[];
}

// Build an IMAGE paint that reproduces a VIDEO paint's placement exactly, only
// swapping in decoded video frame pixels. Copying scaleMode + the crop transform
// is MANDATORY: a CROP video (e.g. a phone screen) misaligns or vanishes if these
// are dropped. Properties are copied ONLY where valid for the scaleMode, because
// Figma's set_fills validation rejects stray keys. Note: VideoPaint's crop lives
// in `videoTransform` (docs), but real paints sometimes expose it under a buggy
// `imageTransform` key instead — we accept either. Pure — mirrored in e2e.mjs.
function videoPaintToImagePaint(v: VideoPaint, imageHash: string): ImagePaint {
  const src = v as unknown as {
    scaleMode?: ImagePaint['scaleMode'];
    videoTransform?: Transform;
    imageTransform?: Transform;
    scalingFactor?: number;
    rotation?: number;
    opacity?: number;
    blendMode?: BlendMode;
    visible?: boolean;
  };
  const scaleMode = src.scaleMode || 'FILL';
  const paint: Record<string, unknown> = { type: 'IMAGE', scaleMode, imageHash };
  const transform = src.videoTransform || src.imageTransform;
  if (scaleMode === 'CROP' && transform) paint.imageTransform = transform;
  if (scaleMode === 'TILE' && src.scalingFactor !== undefined) paint.scalingFactor = src.scalingFactor;
  if (scaleMode !== 'CROP' && src.rotation !== undefined) paint.rotation = src.rotation;
  if (src.opacity !== undefined) paint.opacity = src.opacity;
  if (src.blendMode !== undefined) paint.blendMode = src.blendMode;
  if (src.visible !== undefined) paint.visible = src.visible;
  return paint as unknown as ImagePaint;
}

// Rebuild a VideoPaint with ONLY its documented keys. Figma's real video paints
// carry hidden buggy keys (e.g. imageTransform) that make set_fills REJECT the
// whole array ("Invalid SHA1 hash" / "Unrecognized key"), a confirmed Figma API
// bug. Used when a swap array or a restore must include a video paint.
function sanitizeVideoPaint(v: VideoPaint): VideoPaint {
  const src = v as unknown as {
    videoHash?: string | null;
    scaleMode?: string;
    videoTransform?: Transform;
    scalingFactor?: number;
    rotation?: number;
    opacity?: number;
    blendMode?: BlendMode;
    visible?: boolean;
  };
  const scaleMode = src.scaleMode || 'FILL';
  const paint: Record<string, unknown> = { type: 'VIDEO', scaleMode, videoHash: src.videoHash || '' };
  if (scaleMode === 'CROP' && src.videoTransform) paint.videoTransform = src.videoTransform;
  if (scaleMode === 'TILE' && src.scalingFactor !== undefined) paint.scalingFactor = src.scalingFactor;
  if (scaleMode !== 'CROP' && src.rotation !== undefined) paint.rotation = src.rotation;
  if (src.opacity !== undefined) paint.opacity = src.opacity;
  if (src.blendMode !== undefined) paint.blendMode = src.blendMode;
  if (src.visible !== undefined) paint.visible = src.visible;
  return paint as unknown as VideoPaint;
}

// Create a temporary node that sits EXACTLY over a video node and will carry the
// per-step video frame as an image fill. We never write the video node's own
// fills — Figma's set_fills is broken for video paints (see sanitizeVideoPaint)
// and a failed RESTORE would corrupt the design. The overlay:
//   - childless video node → a clone (same shape, radius, transform, opacity),
//     inserted directly above the original so z-order and masks are preserved;
//   - container with a video background → a rectangle inserted as the BOTTOM
//     child (above the background fill, below all children).
// Returns null when insertion is impossible (e.g. inside an instance) — the
// video then just renders as its poster (graceful degradation).
function createVideoOverlay(node: SceneNode & MinimalFillsMixin): (SceneNode & MinimalFillsMixin) | null {
  try {
    if ('children' in node) {
      const container = node as unknown as FrameNode;
      const rect = figma.createRectangle();
      rect.name = 'GIF Export video frame (temp)';
      rect.resize(Math.max(1, container.width), Math.max(1, container.height));
      rect.x = 0;
      rect.y = 0;
      rect.fills = [];
      container.insertChild(0, rect);
      return rect;
    }
    const parent = node.parent;
    if (!parent || !('children' in parent)) return null;
    const clone = (node as SceneNode & { clone(): SceneNode }).clone();
    clone.name = 'GIF Export video frame (temp)';
    const anyClone = clone as unknown as { fills?: Paint[]; effects?: unknown[]; strokes?: unknown[] };
    anyClone.fills = [];
    // Effects/strokes would render twice (once on the original underneath).
    if (anyClone.effects) anyClone.effects = [];
    if (anyClone.strokes) anyClone.strokes = [];
    const idx = (parent as ChildrenMixin).children.indexOf(node);
    (parent as BaseNode & ChildrenMixin).insertChild(idx + 1, clone);
    clone.relativeTransform = node.relativeTransform;
    return clone as SceneNode & MinimalFillsMixin;
  } catch (e) {
    return null;
  }
}

async function renderComposite(msg: RenderMsg) {
  const root = (await figma.getNodeByIdAsync(msg.exportRootId)) as (SceneNode & ExportMixin) | null;
  if (!root || typeof root.exportAsync !== 'function') {
    throw new Error('Frame moved or cannot be exported. Reselect and try again.');
  }

  // Create one Figma image per unique PNG. figma.createImage() returns
  // synchronously but the bytes decode ASYNCHRONOUSLY; if we assign an undecoded
  // image as a fill and immediately exportAsync, Figma captures an EMPTY render
  // (the swapped layer comes back blank). Proven from a real export: the sphere
  // showed in exactly one frame and was blank in the other 32.
  //
  // getSizeAsync() forces Figma to decode the image. We pre-warm every image
  // once here, and — because a single up-front pass can still lose to lazy
  // re-decode / eviction — we RE-ASSERT the decode of each image right before
  // the step that uses it (see the loop below). Decoding an already-decoded
  // image is cheap, so this is safe belt-and-suspenders.
  const images: Image[] = [];
  const imageHashes: string[] = [];
  for (const png of msg.pngs) {
    const image = figma.createImage(png);
    images.push(image);
    imageHashes.push(image.hash);
  }
  for (const image of images) {
    try {
      await image.getSizeAsync();
    } catch (e) {
      // Older API / undecodable — best effort; per-step decode below retries.
    }
  }

  // Split the touched nodes into two strategies:
  //   IMAGE fills → classic swap + restore (safe; set_fills accepts image paints).
  //   VIDEO fills → temporary OVERLAY node carrying the frame as an image fill.
  //     We must never call set_fills on a fills array containing a video paint:
  //     Figma's validation is broken for them (hidden keys → "Invalid SHA1
  //     hash"), and a failed RESTORE would corrupt the user's design.
  const touched = new Map<string, { node: SceneNode & MinimalFillsMixin; original: Paint[] }>();
  const overlays = new Map<string, { overlay: SceneNode & MinimalFillsMixin; paint: VideoPaint }>();
  const nodeIds = new Set<string>();
  for (const step of msg.steps) for (const a of step.assignments) nodeIds.add(a.nodeId);
  for (const id of nodeIds) {
    const n = (await figma.getNodeByIdAsync(id)) as (SceneNode & MinimalFillsMixin) | null;
    if (!n) continue;
    const fills = n.fills;
    if (fills === figma.mixed || !Array.isArray(fills)) continue;
    const videoPaint = (fills as Paint[]).find((p) => (p as { type: string }).type === 'VIDEO');
    if (videoPaint) {
      const overlay = createVideoOverlay(n);
      // No overlay possible (e.g. inside an instance): the video renders as its
      // poster still — degraded but safe. Its assignments are simply skipped.
      if (overlay) overlays.set(id, { overlay, paint: sanitizeVideoPaint(videoPaint as VideoPaint) });
    } else {
      touched.set(id, { node: n, original: JSON.parse(JSON.stringify(fills)) as Paint[] });
    }
  }

  const out: Uint8Array[] = [];
  try {
    for (let i = 0; i < msg.steps.length; i++) {
      // Group assignments per node so a node with multiple GIF fills is set once.
      const byNode = new Map<string, Assignment[]>();
      for (const a of msg.steps[i].assignments) {
        const list = byNode.get(a.nodeId);
        if (list) list.push(a);
        else byNode.set(a.nodeId, [a]);
      }
      for (const [nodeId, list] of byNode) {
        const ov = overlays.get(nodeId);
        if (ov) {
          // Video node: paint this step's frame on the temporary overlay,
          // matching the video's fit/crop. The video node itself is untouched.
          const hash = imageHashes[list[0].pngIndex];
          if (hash) ov.overlay.fills = [videoPaintToImagePaint(ov.paint, hash)];
          continue;
        }
        const entry = touched.get(nodeId);
        if (!entry) continue;
        const fills = JSON.parse(JSON.stringify(entry.original)) as Paint[];
        for (const a of list) {
          const paint = fills[a.fillIndex];
          const hash = imageHashes[a.pngIndex];
          if (paint && paint.type === 'IMAGE' && hash) {
            // Preserve everything about the paint (scaleMode, transform, blend,
            // opacity) and only change the pixels.
            fills[a.fillIndex] = { ...(paint as ImagePaint), imageHash: hash };
          }
        }
        entry.node.fills = fills;
      }

      // CRITICAL ordering: assign the fills FIRST (above) so each image is now
      // REFERENCED by a node — Figma won't evict a referenced image — THEN force
      // its decode. With many distinct frames (e.g. a 144-frame clip) Figma
      // evicts earlier-decoded images under memory pressure; decoding after the
      // swap, while the image is referenced, guarantees the pixels are ready.
      // Skipping this produced intermittent BLANK (white) frames where the fill
      // hadn't decoded before exportAsync captured the frame.
      const usedPngs = new Set<number>();
      for (const a of msg.steps[i].assignments) usedPngs.add(a.pngIndex);
      for (const idx of usedPngs) {
        const image = images[idx];
        if (image) {
          try {
            await image.getSizeAsync();
          } catch (e) {
            // best effort
          }
        }
      }

      // Let Figma apply the decoded fill to the render tree before capturing.
      // A couple of real-millisecond settles are more reliable than setTimeout(0)
      // when the render pipeline is busy decoding large frames.
      await new Promise((r) => setTimeout(r, 6));
      await new Promise((r) => setTimeout(r, 6));

      const bytes = await root.exportAsync({
        format: 'PNG',
        constraint: { type: 'SCALE', value: msg.scale || 1 },
      });
      out.push(bytes);
      figma.ui.postMessage({ type: 'compositeProgress', done: i + 1, total: msg.steps.length });
    }
  } finally {
    // Restore image-fill swaps and delete the temporary video overlays. The
    // video nodes themselves were never written, so the design is untouched
    // even if this cleanup runs mid-failure.
    for (const { node, original } of touched.values()) node.fills = original;
    for (const { overlay } of overlays.values()) {
      try {
        overlay.remove();
      } catch (e) {
        // already gone
      }
    }
  }

  figma.ui.postMessage({ type: 'composited', frames: out });
}

// Place a finished GIF (e.g. from the Video → GIF tab) onto the canvas as an
// image fill on a new rectangle. Figma animates GIF image fills, so the placed
// rectangle plays the animation in presentation. This lets the user drop a
// converted video straight into the file without a lossy download → re-import.
interface PlaceMsg { type: 'placeGif'; bytes: Uint8Array; name: string; width: number; height: number; }

function placeGif(msg: PlaceMsg) {
  const image = figma.createImage(msg.bytes);
  const rect = figma.createRectangle();

  const srcW = Math.max(1, Math.round(msg.width || 400));
  const srcH = Math.max(1, Math.round(msg.height || 300));

  // Scale the placed rectangle to fit comfortably in the current viewport
  // (~60% of the shorter visible edge) instead of dropping it at full pixel
  // size, which lands as a giant rectangle covering the design.
  const bounds = figma.viewport.bounds;
  const fitTarget = Math.max(80, Math.min(bounds.width, bounds.height) * 0.6);
  const longest = Math.max(srcW, srcH);
  const scale = longest > fitTarget ? fitTarget / longest : 1;
  const w = Math.max(1, Math.round(srcW * scale));
  const h = Math.max(1, Math.round(srcH * scale));

  rect.resize(w, h);
  rect.name = msg.name || 'Video GIF';
  rect.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash: image.hash }];
  const center = figma.viewport.center;
  rect.x = Math.round(center.x - w / 2);
  rect.y = Math.round(center.y - h / 2);
  figma.currentPage.appendChild(rect);
  figma.currentPage.selection = [rect];
  figma.viewport.scrollAndZoomIntoView([rect]);
  figma.notify('GIF placed on the canvas.');
  figma.ui.postMessage({ type: 'placed' });
}

figma.on('selectionchange', () => {
  scanSelection();
});

type UIMessage =
  | { type: 'rescan' }
  | { type: 'notify'; text: string }
  | { type: 'close' }
  | RenderMsg
  | PlaceMsg;

figma.ui.onmessage = (msg: UIMessage) => {
  if (msg.type === 'rescan') scanSelection();
  if (msg.type === 'notify' && msg.text) figma.notify(msg.text);
  if (msg.type === 'close') figma.closePlugin();
  if (msg.type === 'placeGif') {
    try {
      placeGif(msg);
    } catch (e) {
      figma.ui.postMessage({ type: 'placeError', message: e instanceof Error ? e.message : String(e) });
    }
  }
  if (msg.type === 'renderComposite') {
    renderComposite(msg).catch((e) => {
      figma.ui.postMessage({
        type: 'compositeError',
        message: e instanceof Error ? e.message : String(e),
      });
    });
  }
};

// Initial scan on launch.
scanSelection();
