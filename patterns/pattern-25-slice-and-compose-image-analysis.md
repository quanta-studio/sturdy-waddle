---
pattern: 25
title: Slice-and-Compose Image Analysis
slug: slice-and-compose-image-analysis
layer: 12
related: [19]
---

Adopt this layer wherever images carry requirements or evidence: design mockups to implement, QA screenshots to compare, evidence-pack captures (Pattern 19), asset sheets to slice. Its implementation recipe ships as a portable skill: **`skills/analyzing-images-in-detail/SKILL.md`**.

### Pattern 25: Slice-and-Compose Image Analysis

**Context:** Modern assistants can "view" images — but their vision runs on downsampled, whole-image input, and their training rewards gist-level description. Ask about a mockup and you get the layout story; the 1-pixel border, the `#f4f4f5`-vs-`#ffffff` background difference, and the 11px caption text silently vanish.

**Problem:** Detail blindness is invisible to the person relying on the answer. The assistant *sounds* equally confident about the layout (which it saw) and the button's exact border color (which it guessed). Design-to-code drifts, screenshot comparisons miss regressions, and nobody can tell which statements were perception and which were plausible invention.

**Therefore:** Never analyze a nontrivial image in one pass. **Slice it so each detail becomes the big picture of its own crop, measure what is measurable with tools, and only then compose.** The five passes:

```
1. OVERVIEW    full image once: background treatment, layout regions,
               reading order → a component inventory with bounding boxes
2. SLICE       crop each component to its own file (tools, not eyes);
               magnify small crops until text is legibly large;
               grid-slice when there are no natural components (sprite
               sheets, sticker packs)
3. INSPECT     view each crop alone: transcribe text at crop scale;
               PROBE colors programmatically — exact pixel values from
               the file, never estimated from looking
4. RELATE      each component against its neighbors: alignment, spacing,
               shared styles, continuations that cross crop boundaries
5. COMPOSE     reassemble the component findings into the deliverable,
               then check the composition against the full image once
               more — does the described whole predict what's there?
```

The discipline that makes it work is the same as Pattern 19's: **measurement beats perception.** A color named without sampling a pixel is a guess; text transcribed from a full-resolution screenshot is a guess; both must come from the crop and the probe. And the relational pass matters because slicing destroys context — gradients, shadows, and alignment only exist *between* components, so step 4 is what step 2 owes back.
