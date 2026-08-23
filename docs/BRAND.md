# Brand system

How the identity is expressed in this codebase, and the rules that must hold.

---

## Positioning

**A modern, trusted, organized, student-focused Math educator with his own
proven educational system.**

Not a tutoring site. The site's job is to make one system understandable
within a few minutes:

```
Philosophy → Teaching → Practice → Assessment → Feedback
           → Student Success → Parent Visibility → Exam Readiness
```

The emotional targets:

* **Student** — "I understand what I'm supposed to do, and I feel I can improve."
* **Parent** — "My child is following a structured system and I can see the progress."

---

## The logo — absolute rules

1. The approved logo already exists and is final. It is **never** redesigned,
   replaced, simplified, redrawn, reinterpreted, or recreated — in code, in
   SVG, or as a "close enough" substitute.
2. It is loaded as a file from `public/brand/` and only positioned by
   `src/components/brand/Logo.tsx`.
3. Two versions: full-colour and monochrome. Monochrome is used on deep-blue
   sections and single-colour contexts.
4. Clear space around the mark ≥ 25% of its height.
5. Never stretched, recoloured, rotated, given effects, or placed on a busy
   background.
6. Decorative mathematical glyphs elsewhere on the site are typographic
   characters only. They are **not** a version of the mark, and they are never
   placed adjacent to it.

The files currently in `public/brand/` are visibly-marked placeholders. See
[`public/brand/README.md`](../public/brand/README.md).

---

## The portrait — placement rules

The brand is personal, but the face is not the brand. Recognition should come
from **logo + colour + typography + the educational system + portrait**, not
from the portrait alone.

**Used on:** home hero · About · program introductions · mentoring.

**Deliberately absent from:** dashboards · worksheets · quiz and progress cards
· resource cards · footers · any repeating content block.

---

## Colour

Every colour carries a meaning. They are not interchangeable decoration.

| Role | Token | Hex | Meaning |
| --- | --- | --- | --- |
| Primary | `sky-500` | `#1597D4` | **Learn** — clarity, energy, modern education |
| Secondary | `deep-700` | `#123B5D` | **Trust** — professionalism, academic depth |
| Growth | `growth-300` | `#7BCB8B` | **Progress** — success, achievement |
| Accent | `olive-500` | `#6F7F32` | **Identity** — maturity, distinction |
| Alert | `alert-500` | `#D64545` | **Attention** — and nothing else |
| Neutral | `paper` `mist` | `#FFFFFF` `#F4F6F7` | **Clarity** |

Full tint scales are generated around each brand hex in `tailwind.config.ts`.

### Balance

Roughly, per page: **50%** white / soft-gray · **25%** deep blue · **15%** sky
blue · **7%** green + olive · **3%** red.

In practice that means white and mist sections dominate, deep blue appears as
two or three anchor bands (method, CTA, footer), sky blue carries the actions,
green carries progress, and red is rare enough that seeing it means something.

### Red

Red is **not** a brand colour. It appears only where the user must pay
attention:

* "Common mistake" callouts on `/method`
* Missed sessions and unsubmitted homework
* The parent portal's "Needs attention" band
* Genuinely weak topics in progress bars
* Form validation errors
* The no-guaranteed-scores disclaimer on `/about`

It is never used simply to mean "a low number", and never as decoration.

---

## Typography

| Role | Family | Used for |
| --- | --- | --- |
| Display | Plus Jakarta Sans | Headings, buttons, card titles, numerals |
| Body | Inter | Paragraphs, lists, form fields |
| Mono | IBM Plex Mono | Eyebrows, step indices, dates, mathematical detail |

Display sizes are fluid (`clamp`), so mobile typography is designed rather than
scaled down. Headings use `text-wrap: balance`, body copy uses `pretty`.

The mono face carries the "academic instrument" feeling — it appears on every
eyebrow label, every `01 / 02 / 03` step index and every measured value.

---

## Voice

Calm · Confident · Organized · Motivating · Professional · Friendly · Modern ·
Academic.

**Do:** state the mechanism, name the purpose of each stage, be specific about
what is measured, admit what cannot be promised.

**Do not:** use aggressive sales language, exaggerate, guarantee scores, use
childish or cartoon framing, or write generic "online tutor" copy.

A useful test for any sentence on the site: *would a careful parent believe
this, and could the teacher defend it?*

---

## Layout language

* One container width across the whole site (`.container-page`, max 80rem).
* Generous whitespace; sections breathe at `py-16` → `py-28`.
* Cards are `rounded-card` (1rem), panels `rounded-panel` (1.5rem), buttons are
  fully rounded.
* Shadows are soft and low-contrast — `shadow-card` at rest, `shadow-lift` on
  interaction.
* Transitions use the `ease-calm` curve. Nothing bounces, flashes or demands
  attention. Motion says the student is moving forward: one direction, always
  settling. The full system is in [`MOTION.md`](MOTION.md).
* The graph-paper texture and low-opacity math glyphs are the connection to the
  printed workbooks. Both are always subtle and masked out toward the edges.

---

## What the site must never do

1. Redesign or replace the logo.
2. Connect the personal brand to Si Math.
3. Overuse the portrait.
4. Treat red as a brand colour.
5. Promise a specific score.
6. Mix SAT and EST content — they are separate exams and separate programs.
7. Look like a generic tutoring template.
8. Ship a feature with no educational purpose.
