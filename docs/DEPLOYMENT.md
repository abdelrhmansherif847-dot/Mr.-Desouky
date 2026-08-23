# Deployment

## Live URL

```
https://abdelrhmansherif847-dot.github.io/Mr.-Desouky/
```

---

## Why the site did not appear at first

GitHub Pages was set to **Deploy from a branch → `/ (root)`**. That option
publishes the repository's files exactly as they are, through Jekyll. It never
runs `npm install` or `next build`.

The branch root holds source code — `src/`, `package.json`, `next.config.mjs` —
and no `index.html`. So Pages had nothing to serve: with no index file, Jekyll
falls back to rendering `README.md`, and every real route returns 404.

The Pages job reported **success**, which is what made this confusing. It
succeeded at publishing the source tree. It was never asked to build a website.

Four things had to change:

| # | Problem | Fix |
| --- | --- | --- |
| 1 | Pages never ran a build | `.github/workflows/deploy-pages.yml` builds and uploads the site |
| 2 | Next.js was configured for a Node server | `output: 'export'` — plain HTML/CSS/JS |
| 3 | A project site is served from `/Mr.-Desouky/`, not `/` | `basePath` + `assetPrefix`, so CSS, JS and images resolve |
| 4 | The contact form used a Server Action | Reworked to run in the browser |

---

## How it deploys now

Every push to `claude/desouky-educational-website-c80uf9` triggers
`.github/workflows/deploy-pages.yml`, which:

1. installs dependencies with `npm ci`,
2. asks `actions/configure-pages` for the correct base path,
3. runs `npm run build` → a static export in `out/`,
4. checks `index.html` and `404.html` exist and writes `.nojekyll`,
5. uploads `out/` and deploys it to Pages.

**Required setting:** Settings → Pages → **Source = "GitHub Actions"**.
The workflow attempts to set this itself via `configure-pages` with
`enablement: true`, but repository permissions may not allow it — if the site
does not update, set it by hand. It is a one-time change.

---

## Building locally

```bash
npm run build                 # exports to out/ at the domain root
npx serve out                 # preview
```

To reproduce the deployed sub-path exactly:

```bash
NEXT_PUBLIC_BASE_PATH=/Mr.-Desouky \
NEXT_PUBLIC_SITE_URL=https://abdelrhmansherif847-dot.github.io/Mr.-Desouky \
npm run build
```

Then serve `out/` under a `/Mr.-Desouky/` prefix — opening `out/index.html`
directly will show an unstyled page, because every asset URL begins with the
sub-path.

---

## Environment variables

| Variable | Set by | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_BASE_PATH` | the workflow | Sub-path the site is served from. Empty at a domain root. |
| `NEXT_PUBLIC_SITE_URL` | the workflow | Absolute URL for canonicals, sitemap, Open Graph, JSON-LD. |
| `NEXT_PUBLIC_CONTACT_ENDPOINT` | you (optional) | Form endpoint for the contact form. |

`NEXT_PUBLIC_CONTACT_ENDPOINT` is set as a **repository variable**
(Settings → Secrets and variables → Actions → Variables), not a secret — it
ships in the browser bundle by design.

---

## Contact form on a static host

There is no server, so the form submits from the browser.

* **With `NEXT_PUBLIC_CONTACT_ENDPOINT` set** — the enquiry is POSTed as JSON to
  that endpoint. Formspree, Web3Forms, Getform and Basin all accept this shape
  and forward it by email.
* **With nothing set** — the form still validates, keeps everything typed, and
  hands the completed enquiry to WhatsApp with every field filled in. It never
  claims a message was delivered when it was not.

Server-side delivery through Resend was removed: it requires a server, and
keeping it would have been dead code that silently did nothing. On a server
host it is the better option — the enquiry shape in `src/lib/contact/types.ts`
is unchanged, so it can be reinstated behind an API route.

---

## Custom domain

1. Add the domain in Settings → Pages → Custom domain.
2. Add a `public/CNAME` file containing the domain.
3. A custom domain serves from the root, so `configure-pages` will report an
   empty base path automatically — no code change needed.

---

## Security headers

`next.config.mjs` previously set these via `headers()`. Next.js cannot apply
them in a static export, and **GitHub Pages does not support custom response
headers at all**, so they were removed rather than left as config that does
nothing.

They are recorded here to reapply behind any host that supports them — Vercel,
Netlify, Cloudflare Pages, or a CDN in front of Pages:

```js
{
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
}
```

Add a Content-Security-Policy at the same time.

---

## A note on `robots.txt`

Crawlers only read `robots.txt` from a **domain root**. On a project site that
root is `https://abdelrhmansherif847-dot.github.io/robots.txt`, which belongs to
the account, not this repository — so the generated
`/Mr.-Desouky/robots.txt` is advisory only.

The portals do not rely on it: `/student/*` and `/parent/*` each carry
`<meta name="robots" content="noindex, nofollow">`, which works regardless of
where the site is served from. A custom domain would make `robots.txt`
authoritative again.

---

## Moving to a server host later

Nothing here is a dead end. To run on Vercel instead:

1. Remove `output: 'export'`, `basePath`, `assetPrefix` and `images.unoptimized`
   from `next.config.mjs`.
2. Restore the security headers above.
3. Optionally reinstate server-side email delivery.

Everything else — routes, components, content, the portal data and auth seams —
is unchanged either way.
