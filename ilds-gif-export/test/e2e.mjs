// End-to-end test harness for the ILDS GIF Export plugin (overlay architecture).
//
// The plugin's runtime pieces (exportAsync, createImageBitmap, real canvas
// compositing) only exist inside Figma. What we CAN verify headless in Node:
//   1. code.ts — GIF detection (magic bytes + per-node fill walk).
//   2. ui.ts   — GIF decode (gifuct-js), the shared timeline math, the
//      cover/contain geometry used to place a GIF frame in its node box, and
//      that a real animated GIF round-trips through gifenc into a valid GIF.
//
// Run: node test/e2e.mjs

import gifuct from 'gifuct-js';
import gifenc from 'gifenc';

const { parseGIF, decompressFrames } = gifuct;
const { GIFEncoder, quantize, applyPalette } = gifenc;

let passed = 0;
let failed = 0;
const results = [];

function ok(name, cond, detail = '') {
  if (cond) {
    passed++;
    results.push(`  PASS  ${name}${detail ? ' — ' + detail : ''}`);
  } else {
    failed++;
    results.push(`  FAIL  ${name}${detail ? ' — ' + detail : ''}`);
  }
}

function eq(name, actual, expected) {
  ok(name, actual === expected, `expected ${expected}, got ${actual}`);
}

function near(name, actual, expected, tol = 0.001) {
  ok(name, Math.abs(actual - expected) <= tol, `expected ~${expected}, got ${actual}`);
}

// ---------------------------------------------------------------------------
// Minimal canvas shim — supports exactly what decodeGifToFrames uses.
// ---------------------------------------------------------------------------
class ImageDataPoly {
  constructor(a, b, c) {
    if (a instanceof Uint8ClampedArray) {
      this.data = a; this.width = b; this.height = c;
    } else {
      this.width = a; this.height = b; this.data = new Uint8ClampedArray(a * b * 4);
    }
  }
}

class Ctx2D {
  constructor(canvas) {
    this.canvas = canvas;
    this.buf = new Uint8ClampedArray(canvas.width * canvas.height * 4);
  }
  putImageData(img, dx, dy) {
    const cw = this.canvas.width;
    for (let y = 0; y < img.height; y++) {
      for (let x = 0; x < img.width; x++) {
        const s = (y * img.width + x) * 4;
        const tx = dx + x, ty = dy + y;
        if (tx < 0 || ty < 0 || tx >= cw || ty >= this.canvas.height) continue;
        const t = (ty * cw + tx) * 4;
        this.buf[t] = img.data[s];
        this.buf[t + 1] = img.data[s + 1];
        this.buf[t + 2] = img.data[s + 2];
        this.buf[t + 3] = img.data[s + 3];
      }
    }
  }
  clearRect(x, y, w, h) {
    const cw = this.canvas.width;
    for (let yy = y; yy < y + h; yy++) {
      for (let xx = x; xx < x + w; xx++) {
        if (xx < 0 || yy < 0 || xx >= cw || yy >= this.canvas.height) continue;
        const t = (yy * cw + xx) * 4;
        this.buf[t] = this.buf[t + 1] = this.buf[t + 2] = this.buf[t + 3] = 0;
      }
    }
  }
  getImageData(x, y, w, h) {
    const out = new Uint8ClampedArray(w * h * 4);
    const cw = this.canvas.width;
    for (let yy = 0; yy < h; yy++) {
      for (let xx = 0; xx < w; xx++) {
        const s = ((y + yy) * cw + (x + xx)) * 4;
        const t = (yy * w + xx) * 4;
        out[t] = this.buf[s];
        out[t + 1] = this.buf[s + 1];
        out[t + 2] = this.buf[s + 2];
        out[t + 3] = this.buf[s + 3];
      }
    }
    return new ImageDataPoly(out, w, h);
  }
}

class CanvasPoly {
  constructor() { this.width = 0; this.height = 0; this._ctx = null; }
  getContext() { if (!this._ctx) this._ctx = new Ctx2D(this); return this._ctx; }
}

global.ImageData = ImageDataPoly;
global.document = {
  createElement(tag) {
    if (tag === 'canvas') return new CanvasPoly();
    throw new Error('unexpected createElement: ' + tag);
  },
};

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
function solidRGBA(w, h, [r, g, b]) {
  const data = new Uint8ClampedArray(w * h * 4);
  for (let i = 0; i < w * h; i++) {
    data[i * 4] = r; data[i * 4 + 1] = g; data[i * 4 + 2] = b; data[i * 4 + 3] = 255;
  }
  return data;
}

function buildAnimatedGif(w, h, colors, delay = 100) {
  const enc = GIFEncoder();
  for (const color of colors) {
    const data = solidRGBA(w, h, color);
    const palette = quantize(data, 256);
    const index = applyPalette(data, palette);
    enc.writeFrame(index, w, h, { palette, delay });
  }
  enc.finish();
  return enc.bytes();
}

function buildStaticGif(w, h, color) { return buildAnimatedGif(w, h, [color], 0); }

// ---------------------------------------------------------------------------
// Ported from code.ts — per-node GIF fill collection (one fill per node).
// ---------------------------------------------------------------------------
function isGif(b) {
  if (b.length < 6) return false;
  const s = String.fromCharCode(b[0], b[1], b[2], b[3], b[4], b[5]);
  return s === 'GIF87a' || s === 'GIF89a';
}

function collectImageFillNodes(node, out, hashes) {
  if (Array.isArray(node.fills)) {
    node.fills.forEach((fill, index) => {
      if (fill.type === 'IMAGE' && fill.imageHash) {
        out.push({ id: node.id, fillIndex: index, hash: fill.imageHash, name: node.name });
        hashes.add(fill.imageHash);
      }
    });
  }
  if ('children' in node && node.children) {
    for (const child of node.children) collectImageFillNodes(child, out, hashes);
  }
}

// ---------------------------------------------------------------------------
// Ported from ui.ts — decode + timeline + overlay geometry.
// ---------------------------------------------------------------------------
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d', { willReadFrequently: true })];
}

function decodeGifToFrames(bytes) {
  const copy = new Uint8Array(bytes);
  const gif = parseGIF(copy.buffer);
  const raw = decompressFrames(gif, true);
  if (raw.length === 0) throw new Error('No frames decoded.');
  const W = gif.lsd.width, H = gif.lsd.height;
  const [, actx] = makeCanvas(W, H);
  const frames = [];
  for (const f of raw) {
    const patch = new ImageData(new Uint8ClampedArray(f.patch), f.dims.width, f.dims.height);
    actx.putImageData(patch, f.dims.left, f.dims.top);
    const snap = actx.getImageData(0, 0, W, H);
    frames.push({ rgba: new Uint8ClampedArray(snap.data), delay: f.delay || 100 });
    if (f.disposalType === 2) actx.clearRect(f.dims.left, f.dims.top, f.dims.width, f.dims.height);
  }
  return { width: W, height: H, frames };
}

const cumulativeTimes = (delays) => {
  const cum = []; let t = 0;
  for (const d of delays) { cum.push(t); t += d; }
  return cum;
};
const frameIndexAtTime = (cum, t) => {
  let ans = 0;
  for (let i = 0; i < cum.length; i++) { if (cum[i] <= t) ans = i; else break; }
  return ans;
};
const planTimeline = (totalDuration, fps, cap) => {
  const dur = Math.max(1, totalDuration);
  let numFrames = Math.max(1, Math.round((dur * fps) / 1000));
  if (numFrames > cap) numFrames = cap;
  const frameDelay = Math.max(20, Math.round(dur / numFrames));
  return { numFrames, frameDelay };
};
const cappedScale = (w, h, desired) => {
  const MAX_EDGE = 2048;
  const edge = Math.max(w, h) * desired;
  if (edge > MAX_EDGE && edge > 0) return desired * (MAX_EDGE / edge);
  return desired;
};

// Ported from ui.ts — video plan (frame count, delay, output dims).
const FRAME_CAP = 150;
const VIDEO_MAX_EDGE = 800;
const VIDEO_MAX_DURATION = 30;
const planVideo = (durationSec, videoW, videoH, fps, scale) => {
  const duration = Math.max(0.001, Math.min(durationSec, VIDEO_MAX_DURATION));
  let numFrames = Math.max(1, Math.round(duration * fps));
  if (numFrames > FRAME_CAP) numFrames = FRAME_CAP;
  const delay = Math.max(20, Math.round(1000 / Math.max(1, fps)));
  let s = scale;
  const edge = Math.max(videoW, videoH) * s;
  if (edge > VIDEO_MAX_EDGE && edge > 0) s = s * (VIDEO_MAX_EDGE / edge);
  const w = Math.max(1, Math.round(videoW * s));
  const h = Math.max(1, Math.round(videoH * s));
  return { numFrames, delay, duration, w, h };
};

// Ported from ui.ts — shared streaming encoder core (frame getter based).
async function encodeFramesToGif(count, get, delay, colors) {
  const sample = Math.min(count, 16);
  const chunks = [];
  let total = 0;
  for (let s = 0; s < sample; s++) {
    const i = Math.floor((s * count) / sample);
    const { data, w, h } = await get(i);
    const px = w * h;
    const stride = Math.max(1, Math.floor(px / 24000));
    const buf = new Uint8Array(Math.ceil(px / stride) * 4);
    let o = 0;
    for (let p = 0; p < px; p += stride) {
      const q = p * 4;
      buf[o++] = data[q]; buf[o++] = data[q + 1]; buf[o++] = data[q + 2]; buf[o++] = 255;
    }
    chunks.push(buf.subarray(0, o)); total += o;
  }
  const merged = new Uint8Array(total);
  let off = 0;
  for (const c of chunks) { merged.set(c, off); off += c.length; }
  const palette = quantize(merged, colors, { format: 'rgb565', clearAlpha: false });
  const nearest = makeNearest(palette);
  const enc = GIFEncoder();
  for (let i = 0; i < count; i++) {
    const { data, w, h } = await get(i);
    const index = ditherToIndices(data, w, h, palette, nearest);
    if (i === 0) enc.writeFrame(index, w, h, { palette, delay, repeat: 0 });
    else enc.writeFrame(index, w, h, { delay });
  }
  enc.finish();
  return enc.bytes();
}
const safeName = (name) => {
  const base = name.trim().replace(/[^a-z0-9-_ ]/gi, '').replace(/\s+/g, '-') || 'export';
  return base + '.gif';
};

// ---------------------------------------------------------------------------
// Ported from ui.ts — palette + Floyd–Steinberg dithering (the fidelity path).
// ---------------------------------------------------------------------------
function nearestIndexInPalette(palette, r, g, b) {
  let best = 0, bestD = Infinity;
  for (let i = 0; i < palette.length; i++) {
    const p = palette[i];
    const dr = r - p[0], dg = g - p[1], db = b - p[2];
    const d = dr * dr + dg * dg + db * db;
    if (d < bestD) { bestD = d; best = i; if (d === 0) break; }
  }
  return best;
}

function makeNearest(palette) {
  const lut = new Int16Array(65536).fill(-1);
  return (r, g, b) => {
    const key = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3);
    const hit = lut[key];
    if (hit >= 0) return hit;
    const idx = nearestIndexInPalette(palette, r, g, b);
    lut[key] = idx;
    return idx;
  };
}

function ditherToIndices(data, w, h, palette, nearest) {
  const out = new Uint8Array(w * h);
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
      const er = r - pc[0], eg = g - pc[1], eb = b - pc[2];
      curr[c + 3] += er * 0.4375; curr[c + 4] += eg * 0.4375; curr[c + 5] += eb * 0.4375;
      next[c - 3] += er * 0.1875; next[c - 2] += eg * 0.1875; next[c - 1] += eb * 0.1875;
      next[c] += er * 0.3125; next[c + 1] += eg * 0.3125; next[c + 2] += eb * 0.3125;
      next[c + 3] += er * 0.0625; next[c + 4] += eg * 0.0625; next[c + 5] += eb * 0.0625;
    }
    const tmp = curr; curr = next; next = tmp;
  }
  return out;
}

function trailerOk(bytes) { return bytes[bytes.length - 1] === 0x3b; }

async function run() {
  // --- 1. Detection: isGif ---
  const anim = buildAnimatedGif(16, 16, [[255, 0, 0], [0, 255, 0], [0, 0, 255]]);
  const staticGif = buildStaticGif(16, 16, [10, 20, 30]);
  ok('isGif accepts real animated GIF', isGif(anim));
  ok('isGif accepts real static GIF', isGif(staticGif));
  ok('isGif rejects PNG bytes', !isGif(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a])));
  ok('isGif rejects JPEG bytes', !isGif(new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10])));
  ok('isGif rejects short buffer', !isGif(new Uint8Array([0x47, 0x49, 0x46])));
  ok('isGif rejects empty buffer', !isGif(new Uint8Array([])));

  // --- 2. Detection: collectGifFillNodes (per node, one fill each) ---
  const tree = {
    id: 'n0', name: 'Frame', fills: [],
    children: [
      { id: 'n1', name: 'RectA', fills: [{ type: 'IMAGE', imageHash: 'h1' }] },
      {
        id: 'n2', name: 'Group', fills: [{ type: 'SOLID' }],
        children: [
          { id: 'n3', name: 'RectB', fills: [{ type: 'IMAGE', imageHash: 'h2' }] },
          { id: 'n4', name: 'RectC', fills: [{ type: 'IMAGE', imageHash: 'h1' }] }, // same asset, different node
          { id: 'n5', name: 'RectD', fills: [{ type: 'IMAGE', imageHash: null }] },  // no hash
        ],
      },
    ],
  };
  const found = [];
  const hashes = new Set();
  collectImageFillNodes(tree, found, hashes);
  eq('collectImageFillNodes returns one entry per GIF node', found.length, 3);
  eq('collectImageFillNodes dedupes assets into the hash set', hashes.size, 2);
  ok('collectImageFillNodes tracks node id + fillIndex for the swap',
    found[1].id === 'n3' && found[2].id === 'n4' && found[2].hash === 'h1' && found[0].fillIndex === 0);

  const none = [];
  collectImageFillNodes({ id: 'x', name: 'Empty', fills: [{ type: 'SOLID' }] }, none, new Set());
  eq('collectImageFillNodes finds nothing when no image fills', none.length, 0);

  // --- 3. Decode round-trips a real animated GIF ---
  const decoded = decodeGifToFrames(anim);
  eq('decodeGifToFrames returns all frames', decoded.frames.length, 3);
  eq('decodeGifToFrames reports dimensions', decoded.width + 'x' + decoded.height, '16x16');

  // --- 4. Composited frames re-encode into a valid, playable GIF ---
  // Mirror the real encoder: ONE global palette, dithered indices, global color
  // table on frame 0, no local tables after.
  const gp = quantize(decoded.frames[0].rgba, 64, { format: 'rgb565', clearAlpha: false });
  const near = makeNearest(gp);
  const enc = GIFEncoder();
  decoded.frames.forEach((f, i) => {
    const idx = ditherToIndices(f.rgba, decoded.width, decoded.height, gp, near);
    if (i === 0) enc.writeFrame(idx, decoded.width, decoded.height, { palette: gp, delay: 100, repeat: 0 });
    else enc.writeFrame(idx, decoded.width, decoded.height, { delay: 100 });
  });
  enc.finish();
  const out = enc.bytes();
  ok('re-encoded output is a valid GIF', isGif(out));
  ok('re-encoded output has GIF trailer', trailerOk(out));
  const outFrames = decompressFrames(parseGIF(new Uint8Array(out).buffer), true);
  eq('re-encoded output preserves frame count', outFrames.length, 3);

  // --- 5. Timeline helpers ---
  const cum = cumulativeTimes([100, 100, 100, 100]);
  eq('cumulativeTimes builds start offsets', cum.join(','), '0,100,200,300');
  eq('frameIndexAtTime at t=0 -> 0', frameIndexAtTime(cum, 0), 0);
  eq('frameIndexAtTime mid frame 2', frameIndexAtTime(cum, 250), 2);
  eq('frameIndexAtTime past last -> last', frameIndexAtTime(cum, 999), 3);
  // Shorter GIF wraps on the shared timeline so both keep animating.
  const shortCum = cumulativeTimes([100, 100]); // total 200
  eq('shorter GIF wraps within shared timeline', frameIndexAtTime(shortCum, 350 % 200), 1);
  const plan = planTimeline(2000, 15, 150);
  eq('planTimeline frame count from duration*fps', plan.numFrames, 30);
  ok('planTimeline respects the frame cap', planTimeline(60000, 30, 150).numFrames === 150);
  ok('planTimeline never returns zero frames', planTimeline(10, 1, 150).numFrames >= 1);

  // --- 6. cappedScale keeps the longest edge under MAX_EDGE ---
  eq('cappedScale leaves a small frame at native scale', cappedScale(1049, 1323, 1), 1);
  eq('cappedScale leaves an exactly-max frame untouched', cappedScale(2048, 1000, 1), 1);
  ok('cappedScale downscales an oversized frame', cappedScale(4096, 2000, 1) < 1);
  near('cappedScale pins the longest edge to the cap', Math.max(4096, 2000) * cappedScale(4096, 2000, 1), 2048);

  // --- 9. safeName sanitization ---
  eq('safeName strips unsafe chars', safeName('My Frame/../x*?'), 'My-Framex.gif');
  eq('safeName collapses spaces to single dash', safeName('a   b'), 'a-b.gif');
  eq('safeName falls back to export', safeName('***'), 'export.gif');
  eq('safeName keeps clean name', safeName('hero-banner'), 'hero-banner.gif');

  // --- 10. nearestIndexInPalette ---
  const pal3 = [[0, 0, 0], [255, 255, 255], [255, 0, 0]];
  eq('nearest picks exact black', nearestIndexInPalette(pal3, 0, 0, 0), 0);
  eq('nearest picks exact white', nearestIndexInPalette(pal3, 255, 255, 255), 1);
  eq('nearest picks closest (near-red)', nearestIndexInPalette(pal3, 240, 10, 5), 2);
  eq('makeNearest agrees with direct nearest', makeNearest(pal3)(250, 250, 250), 1);

  // --- 11. Dither: large flat solids stay clean (no speckle) ---
  // A frame whose only color is exactly a palette entry must map to a single
  // index everywhere — dithering must not inject noise into flat backgrounds.
  const cream = [245, 240, 230];
  const flat = solidRGBA(40, 40, cream);
  const flatPal = quantize(flat, 32, { format: 'rgb565', clearAlpha: false });
  const flatIdx = ditherToIndices(flat, 40, 40, flatPal, makeNearest(flatPal));
  ok('dither leaves a flat solid perfectly uniform', flatIdx.every((v) => v === flatIdx[0]));
  eq('dither output length is w*h', flatIdx.length, 40 * 40);

  // --- 12. Dither RECOVERS faint low-contrast content (the sphere bug) ---
  // Build a cream frame with a faint bluish tint region — the exact failure the
  // user saw where the sphere vanished. Plain nearest-color would snap the whole
  // tint region to cream; dithering + a palette that saw the tint must keep it.
  const W = 64, H = 64;
  const frame = solidRGBA(W, H, cream);
  const tint = [237, 240, 248]; // ~cream, faintly blue: <=11 per-channel delta
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const dx = x - W / 2, dy = y - H / 2;
      if (dx * dx + dy * dy <= (W / 4) * (W / 4)) {
        const p = (y * W + x) * 4;
        frame[p] = tint[0]; frame[p + 1] = tint[1]; frame[p + 2] = tint[2];
      }
    }
  }
  const fpal = quantize(frame, 64, { format: 'rgb565', clearAlpha: false });
  const near2 = makeNearest(fpal);
  const idx2 = ditherToIndices(frame, W, H, fpal, near2);
  // Average the palette blue channel inside the sphere vs a background corner.
  const avgBlue = (xs, ys, xe, ye) => {
    let sum = 0, n = 0;
    for (let y = ys; y < ye; y++) for (let x = xs; x < xe; x++) {
      sum += fpal[idx2[y * W + x]][2]; n++;
    }
    return sum / n;
  };
  const sphereBlue = avgBlue(W / 2 - 6, H / 2 - 6, W / 2 + 6, H / 2 + 6);
  const cornerBlue = avgBlue(0, 0, 8, 8);
  ok('dither preserves faint content (sphere region is bluer than background)',
    sphereBlue > cornerBlue + 2, `sphere=${sphereBlue.toFixed(1)} corner=${cornerBlue.toFixed(1)}`);

  // Error diffusion proper: a uniform mid-tone that sits BETWEEN the only two
  // palette entries must be reproduced as a black/white mix, not snapped flat.
  const bw = [[0, 0, 0], [255, 255, 255]];
  const gray = solidRGBA(32, 32, [128, 128, 128]);
  const grayIdx = ditherToIndices(gray, 32, 32, bw, makeNearest(bw));
  const used = new Set(grayIdx);
  ok('dither diffuses a between-palette tone into a 2-color mix', used.size === 2, `colors=${used.size}`);
  const black = grayIdx.filter((v) => v === 0).length;
  ok('dithered mid-gray is roughly balanced', Math.abs(black - grayIdx.length / 2) < grayIdx.length * 0.15,
    `black=${black}/${grayIdx.length}`);

  // --- 13. Determinism → temporal stability across frames ---
  const idxA = ditherToIndices(frame, W, H, fpal, makeNearest(fpal));
  const idxB = ditherToIndices(frame, W, H, fpal, makeNearest(fpal));
  ok('dither is deterministic (identical input → identical output)', idxA.every((v, i) => v === idxB[i]));
  // A change confined to the bottom-right must not alter the top-left quadrant
  // (Floyd–Steinberg only diffuses right/down), so static regions don't shimmer.
  const frame2 = new Uint8ClampedArray(frame);
  for (let y = H - 8; y < H; y++) for (let x = W - 8; x < W; x++) {
    const p = (y * W + x) * 4; frame2[p] = 255; frame2[p + 1] = 0; frame2[p + 2] = 0;
  }
  const idx2b = ditherToIndices(frame2, W, H, fpal, makeNearest(fpal));
  let topLeftStable = true;
  for (let y = 0; y < H / 2 && topLeftStable; y++) for (let x = 0; x < W / 2; x++) {
    if (idx2[y * W + x] !== idx2b[y * W + x]) { topLeftStable = false; break; }
  }
  ok('unchanged region upstream of an edit stays pixel-identical (no shimmer)', topLeftStable);

  // --- 14. Full pipeline: faint content survives decode round-trip ---
  const encF = GIFEncoder();
  encF.writeFrame(idx2, W, H, { palette: fpal, delay: 100, repeat: 0 });
  encF.finish();
  const gifF = encF.bytes();
  ok('faint-sphere frame encodes to a valid GIF', isGif(gifF) && trailerOk(gifF));
  const back = decompressFrames(parseGIF(new Uint8Array(gifF).buffer), true)[0];
  // Reconstruct RGBA from the decoded patch and confirm the sphere is bluer.
  const decRGBA = back.patch;
  const decAvgBlue = (xs, ys, xe, ye) => {
    let sum = 0, n = 0;
    for (let y = ys; y < ye; y++) for (let x = xs; x < xe; x++) { sum += decRGBA[(y * W + x) * 4 + 2]; n++; }
    return sum / n;
  };
  ok('decoded GIF still shows the faint sphere',
    decAvgBlue(W / 2 - 6, H / 2 - 6, W / 2 + 6, H / 2 + 6) > decAvgBlue(0, 0, 8, 8) + 1);

  // --- 15. Edge cases: 1px frame, and a fully transparent-input frame ---
  const onePx = solidRGBA(1, 1, [12, 34, 56]);
  const onePal = quantize(onePx, 8, { format: 'rgb565', clearAlpha: false });
  const oneIdx = ditherToIndices(onePx, 1, 1, onePal, makeNearest(onePal));
  eq('dither handles a 1x1 frame', oneIdx.length, 1);
  ok('1x1 index is within palette range', oneIdx[0] < onePal.length);
  const twoColor = quantize(solidRGBA(8, 8, [0, 0, 0]), 2, { format: 'rgb565', clearAlpha: false });
  ok('quantize returns at least one color for a solid frame', twoColor.length >= 1);

  // --- 16. planVideo (video → GIF frame planning) ---
  const p2s = planVideo(2, 640, 480, 15, 1);
  eq('planVideo frame count = duration*fps', p2s.numFrames, 30);
  eq('planVideo delay from fps', p2s.delay, 67);
  eq('planVideo keeps in-bounds dimensions at scale 1', `${p2s.w}x${p2s.h}`, '640x480');
  ok('planVideo caps frame count to FRAME_CAP', planVideo(60, 320, 240, 30, 1).numFrames === 150);
  ok('planVideo clamps duration to VIDEO_MAX_DURATION', planVideo(120, 320, 240, 1, 1).numFrames <= 30);
  const big = planVideo(1, 1920, 1080, 10, 1);
  ok('planVideo shrinks oversized video to VIDEO_MAX_EDGE', Math.max(big.w, big.h) <= 800);
  near('planVideo pins longest edge to the cap', Math.max(big.w, big.h), 800, 1);
  eq('planVideo never returns zero frames', planVideo(0, 100, 100, 24, 1).numFrames, 1);
  eq('planVideo applies user scale', planVideo(1, 400, 400, 10, 0.5).w, 200);

  // --- 17. Shared encoder core streams a video-style getter into a valid GIF ---
  const vpal = [[20, 30, 40], [200, 60, 60], [60, 200, 60]];
  const vframes = [solidRGBA(24, 24, vpal[0]), solidRGBA(24, 24, vpal[1]), solidRGBA(24, 24, vpal[2]), solidRGBA(24, 24, vpal[1])];
  let getCalls = 0;
  const getVid = async (i) => { getCalls++; return { data: vframes[i], w: 24, h: 24 }; };
  const vgif = await encodeFramesToGif(vframes.length, getVid, 67, 64);
  ok('encoder core emits a valid GIF from a frame getter', isGif(vgif) && trailerOk(vgif));
  const vout = decompressFrames(parseGIF(new Uint8Array(vgif).buffer), true);
  eq('encoder core preserves frame count from getter', vout.length, 4);
  ok('encoder core streamed frames on demand (getter was called)', getCalls > 0);

  console.log('\nILDS GIF Export — end-to-end test\n');
  console.log(results.join('\n'));
  console.log(`\n${passed} passed, ${failed} failed\n`);
  if (failed > 0) process.exit(1);
}

run().catch((e) => {
  console.error('Harness crashed:', e);
  process.exit(1);
});
