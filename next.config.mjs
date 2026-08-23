/**
 * Static export configuration for GitHub Pages.
 *
 * GitHub Pages serves files — it never runs Node — so the site is exported to
 * plain HTML/CSS/JS with `output: 'export'`.
 *
 * A GitHub *project* site is served from a sub-path, not the domain root:
 *
 *     https://<user>.github.io/<repo>/
 *
 * Without `basePath`, every stylesheet, script and image would be requested
 * from the domain root and 404 — the classic "page loads but has no styling"
 * symptom. The workflow passes the repository name in as NEXT_PUBLIC_BASE_PATH.
 * Left unset (local dev, or a custom domain served from the root) the site
 * builds at "/" exactly as before.
 */

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? ''

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  reactStrictMode: true,
  poweredByHeader: false,

  basePath,
  assetPrefix: basePath || undefined,

  // Emit /about/index.html rather than /about.html, so directory-style URLs
  // resolve correctly on GitHub Pages with or without a trailing slash.
  trailingSlash: true,

  // The Next.js image optimizer is a server feature. Static export ships the
  // original files instead; every image here is already an optimised SVG.
  images: { unoptimized: true },
}

export default nextConfig

/**
 * NOTE — security headers.
 *
 * This project previously set X-Content-Type-Options, X-Frame-Options,
 * Referrer-Policy and Permissions-Policy via `headers()`. Next.js cannot apply
 * those in a static export, and GitHub Pages does not allow custom response
 * headers at all, so they have been removed rather than left as dead config
 * that silently does nothing.
 *
 * They are not lost: docs/DEPLOYMENT.md records the exact header set, ready to
 * reapply behind a host that supports it (Vercel, Netlify, Cloudflare Pages, or
 * any CDN in front of Pages).
 */
