# ILDS GIF Export — Publishing Brief

Everything needed to publish the plugin privately to the ILDS organization. Copy the fields straight into Figma's **Publish plugin** dialog.

---

## 0. Blocker first (from your screenshot)

The publish dialog showed: *"You must enable two factor authentication to publish."*

Before you can submit, **enable 2FA on your Figma account**: Figma → Settings → **Security** → Two-factor authentication. (If ILDS uses SSO sign-in, this requirement is waived and you can skip it.) The account publishing must be a **member of the ILDS organization**.

---

## 1. Assets (ready, in `assets/`)

| Asset | File | Size | Where it goes |
|---|---|---|---|
| Plugin icon | `assets/icon-128.png` | 128×128 | "Choose some images" → icon |
| Cover art | `assets/cover-1920x960.png` | 1920×960 | "Choose some images" → cover |

Extra sizes `icon-256.png` / `icon-512.png` are included if a larger source is ever needed.

---

## 2. Listing fields (copy-paste)

**Name**
```
ILDS GIF Export
```

**Tagline** (≤100 chars — cleaner than the current "Optimise and export gif easily")
```
Export a whole frame — GIF and all — as one animated GIF
```

**Description**
```
ILDS GIF Export turns any frame into a downloadable animated GIF — the placed GIF composited with everything around it (text, layout, effects, layer order, multiple GIFs), exactly as it looks on your canvas.

Select a frame, choose Original or Optimized size, and export. Figma composites every frame, so stacking order, masks, blend modes and rotation are all preserved. Multiple GIFs of different lengths animate together on a shared timeline.

• Whole-frame export — not just the raw GIF, the full composed design
• Multiple GIFs, each looping independently
• Original (full fidelity) or Optimized (smaller: scale, colors, frame sampling)
• Global palette + dithering for smooth gradients and minimal banding
• Fully offline — no network access

Private to the ILDS organization.
```

**Category**
```
Import & export
```

**Tags** (≤5 — GIF is already selected; add from the recommended list + custom)
```
GIF, Image, export, animation, design-system
```

---

## 3. Publish steps

1. **Figma desktop app** → Plugins → Development → **Import plugin from manifest…** → select `ilds-gif-export/manifest.json`.
2. Run it once on a frame with a GIF. Confirm the footer reads **v1.2.2** and the export animates ("~N unique" in the size line).
3. Plugins → Development → **ILDS GIF Export → Publish…**
4. Set visibility to **Organization** (private to ILDS — not public Community).
5. Paste the fields from Section 2, add both images from Section 1.
6. **Data security** step: the plugin makes no network calls and stores nothing — declare accordingly.
7. Submit. Org-private plugins usually skip Community review and appear for members shortly.

Do **not** hand-edit `manifest.json` line 3 (`"id": "REPLACE_WITH_ID_AFTER_FIRST_PUBLISH"`). Figma writes the real id back on first publish.

---

## 4. Team access & updates

Members find it via Plugins → search **"ILDS GIF Export"** (or the Resources panel, filtered to the org). No local import for them.

To ship an update: `npm run build`, then Plugins → Development → **ILDS GIF Export → Publish…** again. The footer version (`v1.2.2 · built …`) is the at-a-glance check that users are on the latest.
