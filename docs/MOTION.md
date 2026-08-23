# Motion system

Motion here communicates **progress, clarity and confidence**. A student moves
forward and improves, so the motion moves forward too: one direction, always
settling, never bouncing or looping for decoration.

Every animation has a purpose. If a value is not in the system, it does not
get used.

---

## Where the values live

Three files, kept in sync — change all three or none:

| File | Holds |
| --- | --- |
| [`src/lib/motion.ts`](../src/lib/motion.ts) | Durations, easings, distances, stagger — for JS-driven motion |
| `:root` in [`globals.css`](../src/app/globals.css) | The same values as CSS custom properties |
| [`tailwind.config.ts`](../tailwind.config.ts) | Keyframes and the `ease-calm` / `ease-smooth` utilities |

### Durations

| Token | Value | Used for |
| --- | --- | --- |
| `instant` | 120ms | Press feedback |
| `fast` | 200ms | Hover states |
| `base` | 320ms | Default interactive transitions |
| `slow` | 420ms | Page transitions |
| `entrance` | 620ms | Scroll reveals |
| `progress` | 900ms | Progress bars and rings filling |
| `count` | 1100ms | Number count-ups |

### Easing

* **`calm`** — `cubic-bezier(0.16, 1, 0.3, 1)`. Expo-out: quick to commit, long
  to settle. This curve is what makes the motion read as confident rather than
  eager. Used for every entrance.
* **`smooth`** — `cubic-bezier(0.4, 0, 0.2, 1)`. For reversible states like
  hover, where a curve that decelerates hard would feel sticky.

### Distance and stagger

Travel is 8 / 14 / 22px — deliberately small, so motion is felt rather than
watched. Staggered siblings are 70ms apart, capped at 6 steps so a long grid
never crawls.

---

## What moves, and why

| Element | Motion | Purpose |
| --- | --- | --- |
| Page | 420ms fade + 8px rise, keyed on route | Marks arrival without delaying it |
| Section headings | Reveal on scroll | One rhythm on every page — set once in `SectionHeading` |
| Card grids | Staggered reveal | Reading order made visible |
| Journey stages | Reveal from the left, in order | The sequence *is* the content |
| Programs | The two tracks arrive from their own sides | They are separate, and the motion says so |
| Progress bars / rings | Fill on entering view | The literal shape of progress |
| Dashboard figures | Count up on entering view | Only for measured progress — never plain counts |
| Mock trend line | Draws left to right | The line is the improvement |
| Hero stage strip | Four of seven segments fill in order | The system, stated in motion |
| Hero background | 22–32s drift, 10px amplitude | Quiet momentum in peripheral vision |
| Buttons | 200ms hover, 120ms press at 0.97 scale | Physical feedback |
| Nav | Active underline draws in; hover underline grows | Where you are, and where you could go |

### What deliberately does *not* move

Dates, counts of things, body copy, the logo, and anything in the portals that
is a fact rather than a measurement. Watching those animate would be noise.

---

## Implementation

**No animation library.** The whole system is CSS transitions plus one shared
`IntersectionObserver`. Total cost measured against the previous build:

```
JS  +1.1 KB gzipped
CSS +0.9 KB gzipped
```

For comparison, the smallest common React animation library is ~34 KB gzipped.

* **Reveals** — [`Reveal`](../src/components/motion/Reveal.tsx) toggles a
  `data-revealed` attribute; the visual states live in CSS. The work stays on
  the compositor and off the main thread.
* **Observers** — [`useInView`](../src/lib/useInView.ts) shares one observer per
  configuration across every element, rather than one observer each.
* **Counting** — [`useCountUp`](../src/lib/useCountUp.ts) is shared by `CountUp`
  and `ProgressRing`, so a ring and the figure inside it run off one trigger
  and cannot drift apart.

### Only opacity and transform

Nothing animates a property that triggers layout. Measured **CLS of 0.0000** on
every page, at 1440px and 390px. Count-ups reserve their final width up front so
growing digits never reflow the line.

### The `rootMargin` trap

Reveals hold until the element is 40px inside the viewport — **a fixed pixel
value, never a percentage**. A percentage grows with the viewport, creating a
band at the bottom of tall screens where content sits fully visible but never
triggers, and stays invisible forever if the page is too short to scroll. This
was caught in testing on a 1600px-tall viewport.

Thresholds are kept low (0.08 default) for the same class of reason: the
intersection ratio is visible-area over element-area, so a high threshold is
unreachable for an element taller than the viewport, and it would never reveal.

---

## Accessibility

* **`prefers-reduced-motion`** removes animation rather than shortening it.
  Revealed content is forced visible, ambient loops are set to `animation: none`,
  and count-ups jump straight to the final figure. Verified: reveal transition
  reports `1e-06s`, ambient reports `none`.
* **Without JavaScript**, a `<noscript>` rule in the layout shows every revealed
  block. Verified: 27 of 27 visible with scripting disabled.
* **Count-ups** expose the final figure to assistive technology via `sr-only`
  and hide the animating digits with `aria-hidden`, so nothing announces a
  stream of changing numbers.
* **Navigation is never blocked.** The page transition is an entrance for
  content that has already arrived. Measured 52–229ms from click to interactive.

---

## Performance

Measured on the exported build served under the deployed sub-path:

| Check | Result |
| --- | --- |
| CLS, desktop and mobile | **0.0000** |
| Scroll frame rate, mobile at 4× CPU throttle | **49.9 fps** |
| Added payload | **~2 KB gzipped** |
| Animation libraries added | **none** |

---

## Adding new motion

1. Use an existing duration and easing. Do not introduce a one-off value.
2. Animate only `opacity` and `transform`.
3. Ask what the motion is *saying*. If the answer is "it looks nice", leave it
   static.
4. Check it under `prefers-reduced-motion` and with JavaScript disabled.
