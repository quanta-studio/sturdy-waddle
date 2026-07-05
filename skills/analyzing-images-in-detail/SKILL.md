---
name: analyzing-images-in-detail
description: Use when an image's DETAILS matter — implementing a design mockup, extracting design tokens, comparing QA/evidence screenshots, transcribing small text, or slicing asset sheets (sprite sheets, sticker packs). LLM vision sees downsampled whole images and reports the gist; exact colors, thin borders, and small text get guessed. This skill forces slice → measure → compose so details are observed, not invented. Trigger phrases — "match this design exactly", "what color/font is…", "compare these screenshots", "make stickers from this image".
---

# Analyzing Images in Detail

**Core principle: your eyes report the gist; tools report the truth.** A color you name without sampling a pixel is a guess. Text you transcribe from a full screenshot is a guess. Slice the image so each detail becomes the big picture of its own crop, probe everything measurable, then compose.

**Don't use when:** the question is genuinely gist-level ("what is this a picture of?", "roughly what's the layout?"). One viewing pass is fine there.

## The Five Passes

### 1. OVERVIEW — one full-image viewing

View the image once. Record: overall background treatment (solid / gradient / texture), the major layout regions, reading order. Get exact canvas size:

```bash
magick identify -format "%wx%h %[colorspace]\n" input.png
```

Output of this pass: a **component inventory** — one line per visually distinct component with an estimated bounding box:

```
C1 header bar        ~0,0     1440x64
C2 hero image        ~0,64    1440x480
C3 primary button    ~620,410 200x48
...
```

### 2. SLICE — one file per component (tools, not eyes)

```bash
# crop: WxH+X+Y from the inventory
magick input.png -crop 200x48+620+410 +repage c3-button.png

# small crop? magnify with point filter (no smoothing) until text is large
magick c3-button.png -filter point -resize 400% c3-button@4x.png

# no natural components (sprite sheet / sticker grid)? grid-slice:
magick input.png -crop 4x4@ +repage tile_%02d.png
```

Python fallback if ImageMagick is unavailable:

```python
from PIL import Image
img = Image.open("input.png")
img.crop((620, 410, 820, 458)).resize((800, 192), Image.NEAREST).save("c3-button@4x.png")
```

Rule: **any crop whose text you'd squint at gets magnified before viewing.** Re-crop with corrected coordinates if a component came out clipped — badly sliced crops produce confidently wrong readings.

### 3. INSPECT — view each crop alone, probe what's measurable

View one crop at a time. For each component record: text content (transcribed at crop scale), font weight/style/approximate size, foreground color, background color, border (width, style, color, radius), shadow, padding.

**Colors come from the probe, never from looking:**

```bash
# exact pixel value at a coordinate (pick interior points, avoid anti-aliased edges)
magick input.png -format "%[pixel:p{630,420}]\n" info:

# dominant palette of a component (k-means to 5 colors)
magick c3-button.png -colors 5 -unique-colors txt: | tail -5
```

Sample ≥2 points per claimed color (center + off-center) — gradients masquerade as solids at gist level.

### 4. RELATE — each component against its neighbors

Slicing destroys context; this pass restores it. For each adjacent pair, check: edge alignment (shared x/y?), spacing (crop the *gap* and measure it if it matters), style consistency (are C3 and C7 the same button spec or subtly different — probe both), and continuations that cross crop boundaries (a gradient or shadow split across two crops reads as two different treatments — re-crop a strip spanning the boundary to see it whole).

### 5. COMPOSE — reassemble, then verify against the original

Produce the deliverable (design spec, token table, diff report, sticker set) from the per-component findings plus relations:

```markdown
| # | Component | BBox | BG | FG | Border | Text | Notes / relations |
|---|-----------|------|----|----|--------|------|-------------------|
| C3 | primary button | 620,410 200x48 | #b53a1c (probed) | #f5efe3 (probed) | none, r=4px | "Get started" | aligned center-x with C2; same spec as C7 |
```

Then **view the full image one final time** and check the composition predicts it: every region accounted for, no component described in a way the whole image contradicts. For screenshot comparison, run the five passes on both images with the *same* slice grid, and diff per-component.

## Verdict honesty (Pattern 19 discipline)

Mark every value **probed** (from a pixel/tool — CONFIRMED) or **estimated** (from viewing — PLAUSIBLE). Font faces are always estimates unless a font file is available; say so. Never let an estimated value appear next to probed ones without the label.

## Common mistakes

| Mistake | Fix |
|---------|-----|
| Naming colors from the viewing pass | Probe pixels; viewing only decides *where* to probe |
| Transcribing small text from the full image | Crop + 400% point-resize first |
| Slicing but never relating | Step 4 is mandatory — alignment/continuity live between crops |
| One sample point per color | ≥2 points; gradients fake solids |
| Trusting the first crop's bbox | Clipped component → re-crop, don't interpret a truncated view |
| Skipping the final full-image check | Composition drift is invisible without step 5's verification |
