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

// Detect a placed VIDEO fill anywhere in the node tree. Figma stores videos as
// VideoPaint fills, and the plugin API exposes no way to read their bytes/pixels
// back — so we can't convert a canvas video here. We only detect it to nudge the
// user toward the Video → GIF tab (upload the source file instead).
function hasVideoFill(node: SceneNode): boolean {
  const anyNode = node as unknown as { fills?: readonly Paint[] };
  if (Array.isArray(anyNode.fills)) {
    for (const fill of anyNode.fills) {
      if ((fill as { type: string }).type === 'VIDEO') return true;
    }
  }
  if ('children' in node) {
    for (const child of (node as ChildrenMixin).children) {
      if (hasVideoFill(child as SceneNode)) return true;
    }
  }
  return false;
}

async function scanSelection() {
  const selection = figma.currentPage.selection;
  const roots: Root[] = [];
  let hasPlacedVideo = false;

  for (const sel of selection) {
    if (!hasPlacedVideo && hasVideoFill(sel)) hasPlacedVideo = true;
    const imageNodes: GifNodeRef[] = [];
    const hashes = new Set<string>();
    collectImageFillNodes(sel, imageNodes, hashes);
    if (imageNodes.length === 0) continue;

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
    if (assets.length === 0) continue;

    const layout = sel as unknown as { width?: number; height?: number };
    roots.push({
      id: sel.id,
      name: sel.name,
      width: layout.width || 0,
      height: layout.height || 0,
      gifNodes: imageNodes.filter((n) => gifHashes.has(n.hash)),
      assets,
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

  // Capture the original fills of every node the timeline touches.
  const touched = new Map<string, { node: SceneNode & MinimalFillsMixin; original: Paint[] }>();
  const nodeIds = new Set<string>();
  for (const step of msg.steps) for (const a of step.assignments) nodeIds.add(a.nodeId);
  for (const id of nodeIds) {
    const n = (await figma.getNodeByIdAsync(id)) as (SceneNode & MinimalFillsMixin) | null;
    if (!n) continue;
    const fills = n.fills;
    if (fills === figma.mixed || !Array.isArray(fills)) continue;
    touched.set(id, { node: n, original: JSON.parse(JSON.stringify(fills)) as Paint[] });
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
    for (const { node, original } of touched.values()) node.fills = original;
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
