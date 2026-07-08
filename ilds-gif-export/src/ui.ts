// UI (iframe) context. Has the DOM, can run libraries, can download files.
// Cannot touch the Figma document.
//
// FIGMA-COMPOSITED FLOW:
//   - Decode every placed GIF locally and build one shared timeline (GIFs of
//     different lengths each loop independently).
//   - Hand the sandbox a deduped set of frame PNGs + a per-step assignment of
//     which PNG each GIF node shows. The sandbox swaps fills and exports the
//     whole frame per step, so FIGMA composites layer order / blend / masks.
//   - Re-encode the composited frames into one animated GIF.

import { parseGIF, decompressFrames } from 'gifuct-js';
import { GIFEncoder, quantize, applyPalette, nearestColorIndex } from 'gifenc';

interface GifNodeRef { id: string; fillIndex: number; hash: string; name: string; }
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
interface Asset { hash: string; bytes: Uint8Array; width: number; height: number; size: number; }
interface Root {
  id: string;
  name: string;
  width: number;
  height: number;
  gifNodes: GifNodeRef[];
  assets: Asset[];
  videoNodes: VideoNodeRef[];
}

type Mode = 'original' | 'optimized';

// Cap the longest exported edge so "original size" can't produce an unusable
// multi-tens-of-MB raster.
const MAX_EDGE = 2048;
// Hard cap on output frames to bound export time, payload, and file size.
const FRAME_CAP = 150;

let roots: Root[] = [];
let selectedIndex = 0;
let mode: Mode = 'original';
// True when the selection contains a placed VIDEO fill but no exportable GIF —
// Figma can't read placed video bytes, so we nudge the user to the Video tab.
let placedVideoHint = false;
// Source files the user has dropped for placed video nodes, keyed by node id.
// A video node with no entry here exports as its frozen poster (fallback).
const frameVideoFiles = new Map<string, File>();

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const emptyEl = $('empty');
const mainEl = $('main');
const listEl = $('gifList');
const videoSourcesEl = $('videoSources');
const optsEl = $('opts');
const sizeEl = $('sizeline');
const statusEl = $('status');
const exportBtn = $<HTMLButtonElement>('exportBtn');
const modeOriginal = $('modeOriginal');
const modeOptimized = $('modeOptimized');

function human(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

function notify(text: string) {
  parent.postMessage({ pluginMessage: { type: 'notify', text } }, '*');
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
}

function render() {
  if (roots.length === 0) {
    emptyEl.style.display = 'block';
    mainEl.style.display = 'none';
    emptyEl.innerHTML = placedVideoHint
      ? 'This selection has a placed <strong>video</strong> but nothing exportable was detected. Select the frame that contains it.'
      : 'Select a frame that contains a GIF or a placed video.';
    return;
  }
  emptyEl.style.display = 'none';
  mainEl.style.display = 'block';

  listEl.innerHTML = '';
  roots.forEach((r, i) => {
    const item = document.createElement('div');
    item.className = 'gif-item' + (i === selectedIndex ? ' selected' : '');
    const dims = r.width && r.height ? `${Math.round(r.width)}×${Math.round(r.height)} · ` : '';
    item.innerHTML =
      `<div class="radio"></div>` +
      `<div style="flex:1;min-width:0;">` +
      `<div class="name">${escapeHtml(r.name)}</div>` +
      `<div class="meta">${dims}${sourceSummary(r)}</div>` +
      `</div>`;
    item.addEventListener('click', () => {
      selectedIndex = i;
      render();
    });
    listEl.appendChild(item);
  });

  renderVideoSources();

  optsEl.classList.toggle('show', mode === 'optimized');
  modeOriginal.classList.toggle('active', mode === 'original');
  modeOptimized.classList.toggle('active', mode === 'optimized');
  exportBtn.textContent = 'Export frame as GIF';
  updateSizeLine();
}

// "2 GIFs · 1 video" style summary for a root row.
function sourceSummary(r: Root): string {
  const parts: string[] = [];
  const g = r.gifNodes.length;
  const v = r.videoNodes.length;
  if (g) parts.push(`${g} GIF${g === 1 ? '' : 's'}`);
  if (v) parts.push(`${v} video${v === 1 ? '' : 's'}`);
  return parts.join(' · ') || 'no animated sources';
}

// Render one "drop the source file" row per placed video node on the selected
// frame. Figma can't read placed-video pixels, so each needs its source file to
// animate; without a file it exports as a frozen poster (handled at export time).
function renderVideoSources() {
  const r = roots[selectedIndex];
  videoSourcesEl.innerHTML = '';
  if (!r || r.videoNodes.length === 0) {
    videoSourcesEl.style.display = 'none';
    return;
  }
  videoSourcesEl.style.display = 'block';

  const heading = document.createElement('div');
  heading.className = 'vs-heading';
  heading.textContent = r.videoNodes.length === 1 ? 'Placed video — drop its source file' : 'Placed videos — drop each source file';
  videoSourcesEl.appendChild(heading);

  r.videoNodes.forEach((vn) => {
    const has = frameVideoFiles.has(vn.id);
    const row = document.createElement('div');
    row.className = 'vs-row' + (has ? ' ready' : '');
    const dims = vn.nodeWidth && vn.nodeHeight ? `${Math.round(vn.nodeWidth)}×${Math.round(vn.nodeHeight)}` : '';
    const file = frameVideoFiles.get(vn.id);
    const label = has && file ? `✓ ${escapeHtml(file.name)}` : 'Drop video / click to choose';
    row.innerHTML =
      `<div class="vs-name">${escapeHtml(vn.name)}${dims ? ` · ${dims}` : ''}</div>` +
      `<div class="vs-drop">${label}</div>`;
    const drop = row.querySelector('.vs-drop') as HTMLElement;

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/mp4,video/quicktime,video/webm,.mp4,.mov,.webm';
    input.style.display = 'none';
    row.appendChild(input);
    input.addEventListener('change', () => {
      const f = input.files && input.files[0];
      if (f) { frameVideoFiles.set(vn.id, f); render(); }
    });
    drop.addEventListener('click', () => input.click());
    drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
    drop.addEventListener('dragleave', () => drop.classList.remove('over'));
    drop.addEventListener('drop', (e) => {
      e.preventDefault();
      drop.classList.remove('over');
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      if (f) { frameVideoFiles.set(vn.id, f); render(); }
    });

    videoSourcesEl.appendChild(row);
  });
}

function updateSizeLine() {
  const r = roots[selectedIndex];
  if (!r) { sizeEl.textContent = ''; return; }
  const edge = Math.max(r.width, r.height);
  if (mode === 'original') {
    const note = edge > MAX_EDGE ? ` (capped to ${MAX_EDGE}px)` : '';
    sizeEl.innerHTML = `Whole frame, full size${note} · size shown after export`;
  } else {
    sizeEl.innerHTML = `Whole frame, optimized · size shown after export`;
  }
}

function download(bytes: Uint8Array, filename: string) {
  const copy = new Uint8Array(bytes);
  const blob = new Blob([copy], { type: 'image/gif' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function safeName(name: string): string {
  const base = name.trim().replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '-') || 'export';
  return base + '.gif';
}

// ---------------------------------------------------------------------------
// GIF decoding into full-size composited frames (partial-frame patches +
// disposal method 2).
// ---------------------------------------------------------------------------
interface DecodedFrame { rgba: Uint8ClampedArray; delay: number; }

function makeCanvas(w: number, h: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas not available.');
  return [c, ctx];
}

function decodeGifToFrames(bytes: Uint8Array): { width: number; height: number; frames: DecodedFrame[] } {
  const copy = new Uint8Array(bytes);
  const gif = parseGIF(copy.buffer as ArrayBuffer);
  const raw = decompressFrames(gif, true);
  if (raw.length === 0) throw new Error('No frames decoded.');

  const W = gif.lsd.width;
  const H = gif.lsd.height;
  if (!W || !H) throw new Error('GIF reports zero dimensions — cannot decode.');
  const [, actx] = makeCanvas(W, H);

  const frames: DecodedFrame[] = [];
  for (const f of raw) {
    const patch = new ImageData(new Uint8ClampedArray(f.patch), f.dims.width, f.dims.height);
    actx.putImageData(patch, f.dims.left, f.dims.top);
    const snap = actx.getImageData(0, 0, W, H);
    frames.push({ rgba: new Uint8ClampedArray(snap.data), delay: f.delay || 100 });
    if (f.disposalType === 2) {
      actx.clearRect(f.dims.left, f.dims.top, f.dims.width, f.dims.height);
    }
  }
  return { width: W, height: H, frames };
}

// ---------------------------------------------------------------------------
// Pure timeline helpers (unit-tested in test/e2e.mjs).
// ---------------------------------------------------------------------------
function cumulativeTimes(delays: number[]): number[] {
  const cum: number[] = [];
  let t = 0;
  for (const d of delays) { cum.push(t); t += d; }
  return cum;
}

function frameIndexAtTime(cum: number[], t: number): number {
  let ans = 0;
  for (let i = 0; i < cum.length; i++) {
    if (cum[i] <= t) ans = i;
    else break;
  }
  return ans;
}

function planTimeline(totalDuration: number, fps: number, cap: number): { numFrames: number; frameDelay: number } {
  const dur = Math.max(1, totalDuration);
  let numFrames = Math.max(1, Math.round((dur * fps) / 1000));
  if (numFrames > cap) numFrames = cap;
  const frameDelay = Math.max(20, Math.round(dur / numFrames));
  return { numFrames, frameDelay };
}

// ---------------------------------------------------------------------------
// Sandbox round-trip.
// ---------------------------------------------------------------------------
async function frameToPng(rgba: Uint8ClampedArray, w: number, h: number): Promise<Uint8Array> {
  const [c, ctx] = makeCanvas(w, h);
  ctx.putImageData(new ImageData(new Uint8ClampedArray(rgba), w, h), 0, 0);
  const blob: Blob = await new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error('PNG encode failed.'))), 'image/png'),
  );
  return new Uint8Array(await blob.arrayBuffer());
}

interface Assignment { nodeId: string; fillIndex: number; pngIndex: number; }
interface Step { assignments: Assignment[]; }

let compositeResolve: ((frames: Uint8Array[]) => void) | null = null;
let compositeReject: ((err: Error) => void) | null = null;

function requestComposite(payload: {
  exportRootId: string;
  scale: number;
  pngs: Uint8Array[];
  steps: Step[];
}): Promise<Uint8Array[]> {
  return new Promise((resolve, reject) => {
    compositeResolve = resolve;
    compositeReject = reject;
    parent.postMessage({ pluginMessage: { type: 'renderComposite', ...payload } }, '*');
  });
}

// ---------------------------------------------------------------------------
// Palette + dithering (pure, unit-tested in test/e2e.mjs).
//
// Why this matters: a GIF holds at most `colors` entries. Plain nearest-color
// mapping snaps every low-contrast pixel to the dominant background, so faint
// content (a subtle particle sphere, a skyline line-art, smooth gradients)
// silently DISAPPEARS — worse the fewer colors you allow. Two fixes together:
//   1. ONE global palette shared by every frame — sampled across the whole
//      animation so animated + faint colors are represented, and so static
//      regions render identically frame to frame (no palette shimmer).
//   2. Floyd–Steinberg error diffusion — recovers gradients and faint detail as
//      a stable dither pattern. It is deterministic (same pixels + palette →
//      same indices), and flat areas that match a palette color diffuse ~zero
//      error, so large solids stay clean and stable across frames.
// ---------------------------------------------------------------------------
type Palette = number[][];

function nearestIndexInPalette(palette: Palette, r: number, g: number, b: number): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const dr = r - p[0];
    const dg = g - p[1];
    const db = b - p[2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) {
      bestD = d;
      best = i;
      if (d === 0) break;
    }
  }
  return best;
}

// rgb565-keyed lookup so repeated lookups (within and across frames) are O(1).
function makeNearest(palette: Palette): (r: number, g: number, b: number) => number {
  const lut = new Int16Array(65536).fill(-1);
  return (r: number, g: number, b: number) => {
    const key = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
    const hit = lut[key];
    if (hit >= 0) return hit;
    const idx = nearestIndexInPalette(palette, r, g, b);
    lut[key] = idx;
    return idx;
  };
}

function ditherToIndices(
  data: Uint8ClampedArray | Uint8Array,
  w: number,
  h: number,
  palette: Palette,
  nearest: (r: number, g: number, b: number) => number,
): Uint8Array {
  const out = new Uint8Array(w * h);
  // Error rows padded by one cell each side so x-1 / x+1 stay in bounds.
  let curr = new Float32Array((w + 2) * 3);
  let next = new Float32Array((w + 2) * 3);
  for (let y = 0; y < h; y++) {
    next.fill(0);
    for (let x = 0; x < w; x++) {
      const p = (y * w + x) * 4;
      const c = (x + 1) * 3;
      let r = data[p] + curr[c];
      let g = data[p + 1] + curr[c + 1];
      let b = data[p + 2] + curr[c + 2];
      r = r < 0 ? 0 : r > 255 ? 255 : r;
      g = g < 0 ? 0 : g > 255 ? 255 : g;
      b = b < 0 ? 0 : b > 255 ? 255 : b;
      const idx = nearest((r + 0.5) | 0, (g + 0.5) | 0, (b + 0.5) | 0);
      out[y * w + x] = idx;
      const pc = palette[idx];
      const er = r - pc[0];
      const eg = g - pc[1];
      const eb = b - pc[2];
      curr[c + 3] += er * 0.4375; // 7/16 → right
      curr[c + 4] += eg * 0.4375;
      curr[c + 5] += eb * 0.4375;
      next[c - 3] += er * 0.1875; // 3/16 → below-left
      next[c - 2] += eg * 0.1875;
      next[c - 1] += eb * 0.1875;
      next[c] += er * 0.3125; // 5/16 → below
      next[c + 1] += eg * 0.3125;
      next[c + 2] += eb * 0.3125;
      next[c + 3] += er * 0.0625; // 1/16 → below-right
      next[c + 4] += eg * 0.0625;
      next[c + 5] += eb * 0.0625;
    }
    const tmp = curr;
    curr = next;
    next = tmp;
  }
  return out;
}

// ---------------------------------------------------------------------------
// Shared GIF encoder core. Streams frames from a getter (never holds them all
// in memory), builds ONE global palette, dithers, and writes an animated GIF.
// Both the frame path (PNGs from the sandbox) and the video path (canvas frames
// from an uploaded file) feed this same core.
// ---------------------------------------------------------------------------
interface FrameRGBA { data: Uint8ClampedArray; w: number; h: number; }
type FrameGetter = (i: number) => Promise<FrameRGBA>;

async function decodePng(png: Uint8Array): Promise<FrameRGBA> {
  const copy = new Uint8Array(png);
  const bmp = await createImageBitmap(new Blob([copy], { type: 'image/png' }));
  // Read dimensions BEFORE close(): close() zeroes width/height.
  const w = bmp.width;
  const h = bmp.height;
  const [, ctx] = makeCanvas(w, h);
  ctx.drawImage(bmp, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;
  bmp.close();
  return { data, w, h };
}

// Build one palette from an even sample across all frames. Uniform striding
// preserves each color's proportion, so a subtle sphere keeps its share and the
// quantizer allocates entries to it instead of dropping it into the background.
async function buildGlobalPalette(count: number, get: FrameGetter, colors: number): Promise<Palette> {
  const sampleFrames = Math.min(count, 16);
  const perFrameCap = 24000;
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (let s = 0; s < sampleFrames; s++) {
    const i = Math.floor((s * count) / sampleFrames);
    const { data, w, h } = await get(i);
    const px = w * h;
    const stride = Math.max(1, Math.floor(px / perFrameCap));
    const buf = new Uint8Array(Math.ceil(px / stride) * 4);
    let o = 0;
    for (let p = 0; p < px; p += stride) {
      const q = p * 4;
      buf[o++] = data[q];
      buf[o++] = data[q + 1];
      buf[o++] = data[q + 2];
      buf[o++] = 255;
    }
    chunks.push(buf.subarray(0, o));
    total += o;
  }
  const merged = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) {
    merged.set(c, off);
    off += c.length;
  }
  return quantize(merged, colors, { format: 'rgb565', oneBitAlpha: false, clearAlpha: false }) as Palette;
}

async function encodeFramesToGif(
  count: number,
  get: FrameGetter,
  delay: number,
  colors: number,
  onStatus?: (s: string) => void,
): Promise<Uint8Array> {
  const status = onStatus || ((s: string) => { statusEl.textContent = s; });
  status('Building color palette…');
  await new Promise((r) => setTimeout(r, 0));
  const palette = await buildGlobalPalette(count, get, colors);
  const nearest = makeNearest(palette);

  const enc = GIFEncoder();
  for (let i = 0; i < count; i++) {
    const { data, w, h } = await get(i);
    const index = ditherToIndices(data, w, h, palette, nearest);
    // First frame writes the global color table; the rest reuse it.
    if (i === 0) enc.writeFrame(index, w, h, { palette, delay, repeat: 0 });
    else enc.writeFrame(index, w, h, { delay });

    if (i % 4 === 0) {
      status(`Encoding ${i + 1}/${count}…`);
      await new Promise((r) => setTimeout(r, 0));
    }
  }
  enc.finish();
  return enc.bytes();
}

async function encodePngFramesToGif(pngs: Uint8Array[], delay: number, colors: number): Promise<Uint8Array> {
  return encodeFramesToGif(pngs.length, (i) => decodePng(pngs[i]), delay, colors);
}

interface DecodedAsset {
  frames: DecodedFrame[];
  cum: number[];
  total: number;
  width: number;
  height: number;
}

// Fast FNV-1a checksum over sampled bytes (+ length) — enough to tell frames apart.
function frameChecksum(bytes: Uint8Array): number {
  let h = 2166136261 >>> 0;
  const step = Math.max(1, Math.floor(bytes.length / 4096));
  for (let i = 0; i < bytes.length; i += step) {
    h ^= bytes[i];
    h = Math.imul(h, 16777619) >>> 0;
  }
  h ^= bytes.length;
  return h >>> 0;
}

function countDistinct(frames: Uint8Array[]): number {
  const seen = new Set<number>();
  for (const f of frames) seen.add(frameChecksum(f));
  return seen.size;
}

// A node that animates on the shared timeline. GIFs decode from bytes already in
// hand; videos decode from a user-supplied file into pre-sampled canvases. Both
// loop independently on one timeline (each sampled at t % its own total).
interface GifSource { kind: 'gif'; nodeId: string; fillIndex: number; hash: string; cum: number[]; total: number; width: number; height: number; frames: DecodedFrame[]; }
interface VideoSource { kind: 'video'; nodeId: string; fillIndex: number; total: number; frames: HTMLCanvasElement[]; }
type AnimatedSource = GifSource | VideoSource;

// Pure: nearest pre-sampled video frame for a wrapped time (unit-tested).
function videoFrameIndexAt(total: number, frameCount: number, tMod: number): number {
  if (frameCount <= 1 || total <= 0) return 0;
  let idx = Math.floor((tMod / total) * frameCount);
  if (idx >= frameCount) idx = frameCount - 1;
  if (idx < 0) idx = 0;
  return idx;
}

// fps for pre-sampling placed videos on the frame path. Dense enough to look
// smooth; the shared timeline resamples from these frames.
const FRAME_VIDEO_FPS = 15;

async function exportRoot(root: Root, opts: { scale: number; colors: number; frameStep: number }) {
  const sources: AnimatedSource[] = [];
  let minDelay = 100;

  // --- GIF sources: decode each distinct asset once, one source per node. ---
  const decoded = new Map<string, DecodedAsset>();
  for (const asset of root.assets) {
    const { width, height, frames } = decodeGifToFrames(asset.bytes);
    const cum = cumulativeTimes(frames.map((f) => f.delay));
    const total = cum.length ? cum[cum.length - 1] + frames[frames.length - 1].delay : 1;
    for (const f of frames) if (f.delay > 0) minDelay = Math.min(minDelay, f.delay);
    decoded.set(asset.hash, { frames, cum, total, width, height });
  }
  for (const node of root.gifNodes) {
    const d = decoded.get(node.hash);
    if (!d) continue;
    sources.push({ kind: 'gif', nodeId: node.id, fillIndex: node.fillIndex, hash: node.hash, cum: d.cum, total: d.total, width: d.width, height: d.height, frames: d.frames });
  }

  // --- Video sources: decode each supplied file once (pre-sampled canvases). ---
  let missingVideos = 0;
  for (const vn of root.videoNodes) {
    const file = frameVideoFiles.get(vn.id);
    if (!file) { missingVideos++; continue; } // fallback: frozen poster (Phase D)
    statusEl.textContent = `Decoding video: ${file.name}…`;
    await new Promise((r) => setTimeout(r, 0));
    // Sample at the sharpness this export actually needs: the video node's
    // rendered size × export scale (min 800, capped at MAX_EDGE). A flat 800px
    // ceiling visibly softened large placed videos in "Original size" exports.
    const nodeEdge = Math.max(vn.nodeWidth, vn.nodeHeight) * (opts.scale || 1);
    const maxEdge = Math.min(MAX_EDGE, Math.max(VIDEO_MAX_EDGE, Math.ceil(nodeEdge)));
    const dv = await decodeVideoFile(file, FRAME_VIDEO_FPS, 1, maxEdge, (done, total) => {
      statusEl.textContent = `Decoding video ${done}/${total}: ${file.name}`;
    });
    if (dv.frames.length === 0) { missingVideos++; continue; }
    minDelay = Math.min(minDelay, dv.delay);
    sources.push({ kind: 'video', nodeId: vn.id, fillIndex: vn.fillIndex, total: dv.durationMs, frames: dv.frames });
  }

  if (sources.length === 0 && root.videoNodes.length === 0) {
    throw new Error('No animated sources found in this frame.');
  }

  // Video-only frame with no source file: never block. Export a single-step
  // composite — the video renders as its poster still, everything else (text,
  // images, gradients, effects) renders exactly as Figma draws it.
  const stillOnly = sources.length === 0;
  const totalDuration = stillOnly ? 1000 : Math.max(...sources.map((s) => s.total));
  const baseFps = Math.min(24, Math.max(1, Math.round(1000 / minDelay)));
  const fps = Math.max(1, Math.round(baseFps / opts.frameStep));
  const { numFrames, frameDelay } = stillOnly
    ? { numFrames: 1, frameDelay: 1000 }
    : planTimeline(totalDuration, fps, FRAME_CAP);

  statusEl.textContent = `Preparing ${numFrames} frames…`;
  await new Promise((r) => setTimeout(r, 16));

  // Deduplicate PNGs: GIF frames by (hash, frameIdx); video frames by (nodeId, frameIdx).
  const pngs: Uint8Array[] = [];
  const pngIndexByKey = new Map<string, number>();
  async function pngForGif(hash: string, frameIdx: number): Promise<number> {
    const key = 'g:' + hash + ':' + frameIdx;
    const existing = pngIndexByKey.get(key);
    if (existing !== undefined) return existing;
    const d = decoded.get(hash)!;
    const f = d.frames[frameIdx];
    const idx = pngs.length;
    pngs.push(await frameToPng(f.rgba, d.width, d.height));
    pngIndexByKey.set(key, idx);
    return idx;
  }
  async function pngForVideo(src: VideoSource, frameIdx: number): Promise<number> {
    const key = 'v:' + src.nodeId + ':' + frameIdx;
    const existing = pngIndexByKey.get(key);
    if (existing !== undefined) return existing;
    const idx = pngs.length;
    pngs.push(await canvasToPng(src.frames[frameIdx]));
    pngIndexByKey.set(key, idx);
    return idx;
  }

  const steps: Step[] = [];
  for (let k = 0; k < numFrames; k++) {
    const t = (k * totalDuration) / numFrames;
    const assignments: Assignment[] = [];
    for (const src of sources) {
      const tMod = src.total > 0 ? t % src.total : 0;
      let pngIndex: number;
      if (src.kind === 'gif') {
        pngIndex = await pngForGif(src.hash, frameIndexAtTime(src.cum, tMod));
      } else {
        pngIndex = await pngForVideo(src, videoFrameIndexAt(src.total, src.frames.length, tMod));
      }
      assignments.push({ nodeId: src.nodeId, fillIndex: src.fillIndex, pngIndex });
    }
    steps.push({ assignments });
  }

  const composited = await requestComposite({ exportRootId: root.id, scale: opts.scale, pngs, steps });
  if (composited.length === 0) throw new Error('No frames were composited.');

  // Self-check: how many composited frames are actually distinct? If the
  // fill-swap/export race regresses, this collapses toward 1 and the GIF is
  // effectively static. A quick rolling checksum over sampled bytes is enough.
  const uniqueFrames = countDistinct(composited);

  statusEl.textContent = 'Encoding GIF…';
  await new Promise((r) => setTimeout(r, 16));
  const outBytes = await encodePngFramesToGif(composited, frameDelay, opts.colors);

  const suffix = mode === 'optimized' ? '-optimized' : '';
  download(outBytes, safeName(root.name + suffix));

  const animNote = stillOnly
    ? ' · still image'
    : uniqueFrames <= 1
      ? ' · ⚠ frames identical (static)'
      : ` · ${uniqueFrames} unique`;
  const stillNote = missingVideos > 0
    ? ` · ${missingVideos} video${missingVideos === 1 ? '' : 's'} exported as a still (drop the source file to animate)`
    : '';
  sizeEl.innerHTML = `Whole frame → <strong>${human(outBytes.length)}</strong> (${composited.length} frames${animNote})${sizeWarnNote(outBytes.length)}${stillNote}`;
  statusEl.textContent = 'Exported frame as GIF.';
  notify('Frame exported as GIF.');
}

// Clamp requested scale so the exported frame's longest edge stays under MAX_EDGE.
function cappedScale(root: Root, desiredScale: number): number {
  const edge = Math.max(root.width, root.height) * desiredScale;
  if (edge > MAX_EDGE && edge > 0) return desiredScale * (MAX_EDGE / edge);
  return desiredScale;
}

function resolveOpts(root: Root): { scale: number; colors: number; frameStep: number } {
  if (mode === 'original') {
    return { scale: cappedScale(root, 1), colors: 256, frameStep: 1 };
  }
  const frameStep = parseInt($<HTMLSelectElement>('frameStep').value, 10) || 1;
  return {
    scale: cappedScale(root, parseFloat($<HTMLSelectElement>('scale').value)),
    colors: parseInt($<HTMLSelectElement>('colors').value, 10),
    frameStep,
  };
}

async function doExport() {
  const root = roots[selectedIndex];
  if (!root) return;

  exportBtn.disabled = true;
  statusEl.className = 'status';

  try {
    await exportRoot(root, resolveOpts(root));
  } catch (e) {
    statusEl.className = 'status error';
    statusEl.textContent = 'Export failed: ' + (e instanceof Error ? e.message : String(e));
  } finally {
    exportBtn.disabled = false;
  }
}

modeOriginal.addEventListener('click', () => { mode = 'original'; render(); });
modeOptimized.addEventListener('click', () => { mode = 'optimized'; render(); });
exportBtn.addEventListener('click', doExport);

// ---------------------------------------------------------------------------
// VIDEO → GIF (uploaded file, decoded entirely in the iframe).
//
// The Figma document is NOT involved. Figma's plugin API cannot read the pixels
// of a video placed on the canvas (the Video object exposes only a hash, no
// getBytesAsync), so the feasible path is: the user drops a video file here, we
// load it into a <video>, seek to evenly spaced timestamps, draw each into a
// canvas, and feed the sampled RGBA frames to the SAME global-palette + dither
// encoder as the frame path. Only browser-native codecs decode here
// (MP4/H.264, MOV, WebM). WMV can't decode in-browser and is deferred.
// ---------------------------------------------------------------------------
const VIDEO_MAX_EDGE = 800; // keep video GIFs a sane default size
const VIDEO_MAX_DURATION = 30; // seconds — guards runaway exports

interface VideoPlan { numFrames: number; delay: number; duration: number; w: number; h: number; }

// Pure (unit-tested): decide frame count, delay, and output dimensions.
// maxEdge defaults to the Video-tab cap; the frame path passes the video node's
// rendered size × export scale so the sampled frames are exactly as sharp as
// the export needs (no fixed 800px ceiling degrading a large placed video).
function planVideo(
  durationSec: number,
  videoW: number,
  videoH: number,
  fps: number,
  scale: number,
  maxEdge: number = VIDEO_MAX_EDGE,
): VideoPlan {
  const duration = Math.max(0.001, Math.min(durationSec, VIDEO_MAX_DURATION));
  let numFrames = Math.max(1, Math.round(duration * fps));
  if (numFrames > FRAME_CAP) numFrames = FRAME_CAP;
  const delay = Math.max(20, Math.round(1000 / Math.max(1, fps)));
  let s = scale;
  const edge = Math.max(videoW, videoH) * s;
  if (edge > maxEdge && edge > 0) s = s * (maxEdge / edge);
  const w = Math.max(1, Math.round(videoW * s));
  const h = Math.max(1, Math.round(videoH * s));
  return { numFrames, delay, duration, w, h };
}

let videoFile: File | null = null;
type VideoDest = 'download' | 'figma';
let videoDest: VideoDest = 'download';

interface DecodedVideo {
  width: number;
  height: number;
  durationMs: number;
  delay: number;
  capped: boolean;
  frames: HTMLCanvasElement[];
}

// Decode a video file to a fixed set of pre-sampled frame canvases ONCE. Both
// the Video → GIF tab and the frame-with-video path use this: seeking is slow
// and flaky, so we never seek again per timeline step — we resample from these
// canvases. Reuses loadVideo + seekVideo (rVFC-guarded) + planVideo.
async function decodeVideoFile(
  file: File,
  fps: number,
  scale: number,
  maxEdge: number = VIDEO_MAX_EDGE,
  onProgress?: (done: number, total: number) => void,
): Promise<DecodedVideo> {
  const v = await loadVideo(file);
  const objUrl = v.src;
  try {
    if (!v.videoWidth || !v.videoHeight) throw new Error('This file has no visual track.');
    const durationSec = isFinite(v.duration) && v.duration > 0 ? v.duration : VIDEO_MAX_DURATION;
    const plan = planVideo(durationSec, v.videoWidth, v.videoHeight, fps, scale, maxEdge);
    const frames: HTMLCanvasElement[] = [];
    for (let i = 0; i < plan.numFrames; i++) {
      const t = plan.numFrames <= 1 ? 0 : (i * plan.duration) / plan.numFrames;
      await seekVideo(v, t);
      const [c, ctx] = makeCanvas(plan.w, plan.h);
      ctx.drawImage(v, 0, 0, plan.w, plan.h);
      frames.push(c);
      // High-res sources seek slowly (hundreds of ms/frame on 4K video); report
      // progress and yield so the UI repaints instead of looking frozen.
      if (onProgress) onProgress(i + 1, plan.numFrames);
      if (i % 3 === 0) await new Promise((r) => setTimeout(r, 0));
    }
    const durationMs = plan.duration * 1000;
    const delay = Math.max(20, Math.round(durationMs / Math.max(1, plan.numFrames)));
    return {
      width: plan.w,
      height: plan.h,
      durationMs,
      delay,
      capped: durationSec > VIDEO_MAX_DURATION,
      frames,
    };
  } finally {
    setTimeout(() => URL.revokeObjectURL(objUrl), 2000);
  }
}

function canvasFrame(c: HTMLCanvasElement): FrameRGBA {
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas not available.');
  return { data: ctx.getImageData(0, 0, c.width, c.height).data, w: c.width, h: c.height };
}

async function canvasToPng(c: HTMLCanvasElement): Promise<Uint8Array> {
  const blob: Blob = await new Promise((res, rej) =>
    c.toBlob((b) => (b ? res(b) : rej(new Error('PNG encode failed.'))), 'image/png'),
  );
  return new Uint8Array(await blob.arrayBuffer());
}

const tabFrame = $('tabFrame');
const tabVideo = $('tabVideo');
const viewFrame = $('viewFrame');
const viewVideo = $('viewVideo');
const dropEl = $('drop');
const videoFileInput = $<HTMLInputElement>('videoFile');
const videoInfoEl = $('videoInfo');
const videoSizeEl = $('videoSize');
const videoStatusEl = $('videoStatus');
const videoBtn = $<HTMLButtonElement>('videoBtn');
const destDownload = $('destDownload');
const destFigma = $('destFigma');

// A GIF above this size tends to fail in email tools, Slack, and some viewers.
const SIZE_WARN = 5 * 1024 * 1024;
function sizeWarnNote(bytes: number): string {
  return bytes > SIZE_WARN
    ? ' · ⚠ large file — lower Colors/Scale or use fewer frames for email/web'
    : '';
}

function setVideoStatus(text: string, error = false) {
  videoStatusEl.className = 'status' + (error ? ' error' : '');
  videoStatusEl.textContent = text;
}

function switchTab(which: 'frame' | 'video') {
  const isVideo = which === 'video';
  viewFrame.style.display = isVideo ? 'none' : 'block';
  viewVideo.style.display = isVideo ? 'block' : 'none';
  tabFrame.classList.toggle('active', !isVideo);
  tabVideo.classList.toggle('active', isVideo);
}

function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement('video');
    v.preload = 'auto';
    v.muted = true;
    (v as unknown as { playsInline: boolean }).playsInline = true;
    v.onloadeddata = () => resolve(v);
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not decode this video. Use MP4, MOV, or WebM (WMV is not supported yet).'));
    };
    v.src = url;
  });
}

// Seek to t and resolve only once the decoded frame is actually PRESENTED.
// Waiting on 'seeked' alone is not enough: drawImage right after 'seeked' can
// capture a not-yet-painted (blank) frame. requestVideoFrameCallback fires when
// a new frame is composited, which is the true "safe to draw" signal. A timeout
// guards the case where rVFC never fires (e.g. an identical adjacent frame).
function seekVideo(v: HTMLVideoElement, t: number): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    let timer = 0;
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      v.removeEventListener('seeked', onSeeked);
      resolve();
    };
    const rvfc = (v as unknown as { requestVideoFrameCallback?: (cb: () => void) => number }).requestVideoFrameCallback;
    const onSeeked = () => {
      v.removeEventListener('seeked', onSeeked);
      if (typeof rvfc === 'function') {
        rvfc.call(v, () => finish());
        timer = setTimeout(finish, 150) as unknown as number; // safety net
      } else {
        // No rVFC: give the compositor two frames to paint, then draw.
        requestAnimationFrame(() => requestAnimationFrame(() => finish()));
        timer = setTimeout(finish, 150) as unknown as number;
      }
    };
    v.addEventListener('seeked', onSeeked);
    const dur = isFinite(v.duration) && v.duration > 0 ? v.duration : t + 1;
    v.currentTime = Math.max(0, Math.min(t, dur - 0.001));
  });
}

function onVideoChosen(file: File) {
  videoFile = file;
  videoInfoEl.textContent = `${file.name} · ${human(file.size)}`;
  videoBtn.disabled = false;
  videoSizeEl.textContent = '';
  setVideoStatus('');
}

async function exportVideo() {
  if (!videoFile) return;
  videoBtn.disabled = true;
  setVideoStatus('Decoding video…');
  try {
    const fps = parseInt($<HTMLSelectElement>('videoFps').value, 10) || 15;
    const scale = parseFloat($<HTMLSelectElement>('videoScale').value) || 1;
    const colors = parseInt($<HTMLSelectElement>('videoColors').value, 10) || 256;

    const dv = await decodeVideoFile(videoFile, fps, scale, VIDEO_MAX_EDGE, (done, total) => {
      setVideoStatus(`Decoding video ${done}/${total}…`);
    });

    setVideoStatus(`Sampling ${dv.frames.length} frames…`);
    const outBytes = await encodeFramesToGif(
      dv.frames.length,
      (i) => Promise.resolve(canvasFrame(dv.frames[i])),
      dv.delay,
      colors,
      setVideoStatus,
    );

    const base = videoFile.name.replace(/\.[^.]+$/, '') || 'video';
    const capNote = dv.capped ? ` · first ${VIDEO_MAX_DURATION}s` : '';
    videoSizeEl.innerHTML =
      `Video → <strong>${human(outBytes.length)}</strong> (${dv.frames.length} frames · ${dv.width}×${dv.height}${capNote})${sizeWarnNote(outBytes.length)}`;

    if (videoDest === 'figma') {
      setVideoStatus('Placing on canvas…');
      requestPlace(outBytes, base, dv.width, dv.height);
      // status is finalized when the sandbox confirms placement.
    } else {
      download(outBytes, safeName(base));
      setVideoStatus('Downloaded GIF.');
      notify('Video exported as GIF.');
    }
  } catch (e) {
    setVideoStatus('Export failed: ' + (e instanceof Error ? e.message : String(e)), true);
  } finally {
    videoBtn.disabled = !videoFile;
  }
}

function requestPlace(bytes: Uint8Array, name: string, width: number, height: number) {
  parent.postMessage({ pluginMessage: { type: 'placeGif', bytes, name, width, height } }, '*');
}

function setVideoDest(dest: VideoDest) {
  videoDest = dest;
  destDownload.classList.toggle('active', dest === 'download');
  destFigma.classList.toggle('active', dest === 'figma');
  videoBtn.textContent = dest === 'figma' ? 'Convert & place in Figma' : 'Convert & download';
}

tabFrame.addEventListener('click', () => switchTab('frame'));
tabVideo.addEventListener('click', () => switchTab('video'));
destDownload.addEventListener('click', () => setVideoDest('download'));
destFigma.addEventListener('click', () => setVideoDest('figma'));
dropEl.addEventListener('click', () => videoFileInput.click());
videoFileInput.addEventListener('change', () => {
  const f = videoFileInput.files && videoFileInput.files[0];
  if (f) onVideoChosen(f);
});
dropEl.addEventListener('dragover', (e) => { e.preventDefault(); dropEl.classList.add('over'); });
dropEl.addEventListener('dragleave', () => dropEl.classList.remove('over'));
dropEl.addEventListener('drop', (e) => {
  e.preventDefault();
  dropEl.classList.remove('over');
  const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
  if (f) onVideoChosen(f);
});
videoBtn.addEventListener('click', exportVideo);
setVideoDest('download');

// Show which build is loaded — a live check against stale dist/.
const buildEl = document.getElementById('build');
if (buildEl) buildEl.textContent = `v${__PLUGIN_VERSION__} · built ${__BUILD_TIME__}`;

window.onmessage = (event: MessageEvent) => {
  const msg = event.data.pluginMessage;
  if (!msg) return;
  if (msg.type === 'roots') {
    roots = msg.roots as Root[];
    if (selectedIndex >= roots.length) selectedIndex = 0;
    placedVideoHint = Boolean(msg.hasPlacedVideo) && roots.length === 0;
    // Keep dropped files only for video nodes still present in the new scan;
    // drop entries for nodes that are gone (selection changed).
    const liveVideoIds = new Set<string>();
    for (const r of roots) for (const vn of r.videoNodes) liveVideoIds.add(vn.id);
    for (const id of [...frameVideoFiles.keys()]) if (!liveVideoIds.has(id)) frameVideoFiles.delete(id);
    statusEl.textContent = '';
    statusEl.className = 'status';
    render();
  } else if (msg.type === 'compositeProgress') {
    statusEl.textContent = `Rendering frame ${msg.done}/${msg.total}…`;
  } else if (msg.type === 'composited') {
    compositeResolve?.(msg.frames as Uint8Array[]);
    compositeResolve = null;
    compositeReject = null;
  } else if (msg.type === 'compositeError') {
    compositeReject?.(new Error(msg.message || 'Composite failed.'));
    compositeResolve = null;
    compositeReject = null;
  } else if (msg.type === 'placed') {
    setVideoStatus('Placed on the canvas.');
    notify('GIF placed on the canvas.');
  } else if (msg.type === 'placeError') {
    setVideoStatus('Could not place: ' + (msg.message || 'unknown error'), true);
  }
};
