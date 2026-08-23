# Brand assets — drop-in slots

Every file in this folder is a **placeholder**. The site reads these exact
paths, so replacing a file updates the whole site — no code changes needed.

| File | Used for | Replace with |
| --- | --- | --- |
| `logo-color.svg` | Header, footer, portals, favicon source | The **approved full-colour logo** |
| `logo-mono.svg` | Dark sections, print, single-colour contexts | The **approved black / monochrome logo** |
| `portrait.svg` | Home hero, About, mentoring, course intro | The **approved professional portrait** |
| `og-image.svg` | Link previews on WhatsApp / social | A 1200×630 share image using the approved logo |

## The logo rule

The approved logo (√ · π · Σ · X² with the central mathematical symbol and
crown) already exists and is final. **It was not redrawn, redesigned,
reinterpreted, or approximated anywhere in this codebase.** The two SVGs
shipped here are deliberately drawn as dashed empty boxes reading
"LOGO PLACEHOLDER" so that nobody can mistake them for the real mark and so
that an un-replaced asset is immediately obvious on screen.

Nothing in the site's design depends on the placeholder's shape: the layout
gives the mark a square slot and the wordmark is set in type beside it.

## How to replace

1. Export the approved logo as SVG (preferred) or a transparent PNG at
   512×512 or larger.
2. Overwrite `logo-color.svg` and `logo-mono.svg`, keeping the filenames.
   * Using PNG/JPG instead? Save as e.g. `logo-color.png`, then update
     `LOGO` in `src/content/site.ts` — change only the filename after
     `/brand/`, leaving the `${BASE_PATH}` prefix in place (it is what makes
     the asset resolve on GitHub Pages).
   * The monochrome version should use `fill="currentColor"` where possible
     so it inherits the surrounding text colour on dark sections.
3. Overwrite `portrait.svg` with the portrait (a `.jpg` around 1200×1500 is
   ideal — then update `PORTRAIT` in `src/content/site.ts`).
4. Replace `og-image.svg` with a 1200×630 share card.
5. Replace `/public/favicon.ico` and `/public/icon.svg` with icons generated
   from the approved logo.

## Sizing guidance

* Keep clear space around the mark equal to at least 25% of its height.
* Never stretch, recolour, rotate, add effects to, or place the mark on a
  busy background.
* On deep-blue sections use the monochrome version in white.
