// Ad-hoc analyzer: decode a real exported GIF and report per-frame animation +
// whether the center (sphere) region actually has content that changes.
import fs from 'fs';
import gifuct from 'gifuct-js';
const { parseGIF, decompressFrames } = gifuct;

const path = process.argv[2];
const buf = fs.readFileSync(path);
const gif = parseGIF(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
const frames = decompressFrames(gif, true);
const W = gif.lsd.width, H = gif.lsd.height;
console.log(`file: ${path}`);
console.log(`canvas: ${W}x${H}, frames: ${frames.length}`);

// Composite frames respecting disposal, into full RGBA canvases.
const canvas = new Uint8ClampedArray(W * H * 4);
const full = [];
for (const f of frames) {
  const { width: pw, height: ph, left, top } = f.dims;
  const patch = f.patch;
  for (let y = 0; y < ph; y++) {
    for (let x = 0; x < pw; x++) {
      const s = (y * pw + x) * 4;
      const tx = left + x, ty = top + y;
      const t = (ty * W + tx) * 4;
      const a = patch[s + 3];
      if (a === 0) continue; // transparent index → keep prior
      canvas[t] = patch[s]; canvas[t + 1] = patch[s + 1]; canvas[t + 2] = patch[s + 2]; canvas[t + 3] = 255;
    }
  }
  full.push(new Uint8ClampedArray(canvas));
  if (f.disposalType === 2) {
    for (let y = 0; y < ph; y++) for (let x = 0; x < pw; x++) {
      const t = ((top + y) * W + (left + x)) * 4;
      canvas[t] = canvas[t + 1] = canvas[t + 2] = canvas[t + 3] = 0;
    }
  }
}

function regionStats(rgba, x0, y0, x1, y1) {
  let n = 0, sr = 0, sg = 0, sb = 0, minL = 255, maxL = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const p = (y * W + x) * 4;
    const r = rgba[p], g = rgba[p + 1], b = rgba[p + 2];
    sr += r; sg += g; sb += b; n++;
    const l = (r + g + b) / 3;
    if (l < minL) minL = l;
    if (l > maxL) maxL = l;
  }
  return { r: sr / n, g: sg / n, b: sb / n, contrast: maxL - minL };
}

// Center region = where the sphere lives (middle band between the cards).
const cx0 = Math.floor(W * 0.38), cx1 = Math.floor(W * 0.62);
const cy0 = Math.floor(H * 0.36), cy1 = Math.floor(H * 0.60);
console.log(`\nsphere region px box: x[${cx0}-${cx1}] y[${cy0}-${cy1}]`);
console.log('frame  meanRGB              contrast(range of luma)');
const sampleIdx = [0, 1, 2, Math.floor(frames.length / 3), Math.floor(frames.length / 2), frames.length - 1];
for (const i of sampleIdx) {
  if (i >= full.length) continue;
  const s = regionStats(full[i], cx0, cx1 < cx0 ? cx0 + 1 : cx1, cy0, cy1);
  // note: guard for arg order
  const st = regionStats(full[i], cx0, cx1, cy0, cy1);
  console.log(`#${String(i).padStart(3)}  (${st.r.toFixed(0)},${st.g.toFixed(0)},${st.b.toFixed(0)})   contrast=${st.contrast.toFixed(1)}`);
}

// How much does the sphere region change frame-to-frame?
let maxDelta = 0;
for (let i = 1; i < full.length; i++) {
  let d = 0, n = 0;
  for (let y = cy0; y < cy1; y += 3) for (let x = cx0; x < cx1; x += 3) {
    const p = (y * W + x) * 4;
    d += Math.abs(full[i][p] - full[i - 1][p]) + Math.abs(full[i][p + 1] - full[i - 1][p + 1]) + Math.abs(full[i][p + 2] - full[i - 1][p + 2]);
    n++;
  }
  maxDelta = Math.max(maxDelta, d / n);
}
console.log(`\nmax per-frame mean abs delta in sphere region: ${maxDelta.toFixed(2)} (near 0 = sphere not animating/absent)`);
