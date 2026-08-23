# Eng. Abdelrhman Desouky — Educational System

The digital home of the **Eng. Abdelrhman Desouky** SAT & EST Math educational
system. Not a tutor's brochure site: a public site plus student and parent
portals, built around one visible system — philosophy → teaching → practice →
assessment → feedback → student success → parent visibility → exam readiness.

> **Try. Learn. Rise.**

---

## Read this first

Three things need your input before this can go live. They are all isolated
and none of them require touching component code.

| # | What | Where |
| --- | --- | --- |
| 1 | **Drop in the approved logo and portrait** | [`public/brand/README.md`](public/brand/README.md) |
| 2 | **Confirm the placeholder facts** (phone, email, domain, durations, session counts) | [`docs/CONTENT-CHECKLIST.md`](docs/CONTENT-CHECKLIST.md) |
| 3 | **Connect the contact form** (optional — it degrades honestly without it) | [`src/lib/contact/deliver.ts`](src/lib/contact/deliver.ts) |

### About the logo

The approved logo (√ · π · Σ · X² with the central mathematical symbol and
crown) **was not redesigned, redrawn, reinterpreted, or approximated anywhere
in this codebase.** No logo file was invented.

What ships instead is a *slot*: `public/brand/logo-color.svg` and
`logo-mono.svg` are deliberately drawn as dashed boxes reading
"LOGO PLACEHOLDER", so an un-replaced asset is obvious on screen and can never
be mistaken for the real mark. Replace those two files and the whole site
updates — header, footer, portals, share cards. Nothing in the layout depends
on the placeholder's shape.

The same applies to the portrait (`public/brand/portrait.svg`).

---

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
```

```bash
npm run build      # production build
npm start          # serve the build
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
```

Node 20+ required. No environment variables are needed to run the site — the
only optional ones are for contact-form delivery (below).

---

## What is here

### Public pages

| Route | Purpose |
| --- | --- |
| `/` | Who, what, how the system works, why to trust it |
| `/programs` | All four programs, compared side by side |
| `/programs/[slug]` | SAT Basic · SAT Advanced · EST Basic · EST Advanced |
| `/method` | The Desouky Method — READ · ANALYZE · PLAN · SOLVE · CHECK |
| `/journey` | The seven-stage student journey |
| `/how-it-works` | The educational system, stage by stage |
| `/about` | The person, vision, mission, values, principles, success |
| `/mentoring` | Mentoring, advising and parent visibility |
| `/resources` | Practice sheets, workbooks, guides, videos |
| `/contact` | WhatsApp, email, and a working contact form |

### Portals

| Route | State |
| --- | --- |
| `/login/student`, `/login/parent` | Honest "not open yet" screens — see below |
| `/student`, `/student/journey\|sessions\|homework\|quizzes\|mocks` | Full UI on sample data |
| `/parent`, `/parent/reports` | Full UI on sample data |

The portals are **complete interfaces running on sample data**, marked with a
persistent preview banner on every screen. There is no authentication and no
login form, because a login that authenticates nothing would be misleading.
Both seams are documented and ready:

* **Data** — [`src/lib/portal/data.ts`](src/lib/portal/data.ts). Every portal
  screen reads through `getStudentRecord()` and `getParentRecord()`. Swap
  their bodies for real queries, keep the return types, and no component
  changes.
* **Auth** — [`src/lib/portal/auth.ts`](src/lib/portal/auth.ts). Documents
  exactly where a provider, route guards, and per-viewer scoping plug in.

Portals are `noindex` and excluded from the sitemap.

---

## Project structure

```
src/
├── app/                      routes (Next.js App Router)
│   ├── layout.tsx            fonts, metadata, header/footer, JSON-LD
│   ├── page.tsx              home
│   ├── contact/actions.ts    contact form server action + validation
│   ├── sitemap.ts robots.ts  SEO
│   ├── student/  parent/     portals (own layout + nav)
│   └── login/                portal entry screens
├── components/
│   ├── brand/                Logo, Portrait, MathTexture  ← brand rules live here
│   ├── layout/               SiteHeader, SiteFooter, WhatsAppButton
│   ├── ui/                   Button, Section, Card, Badge, Progress
│   ├── sections/             Hero, SystemFlow, MethodStrip, JourneyTimeline, …
│   ├── contact/              ContactForm
│   └── portal/               PortalShell, widgets, PreviewNotice, LoginPanel
├── content/                  ← ALL COPY LIVES HERE, as typed data
│   ├── site.ts               brand constants, nav, contact details
│   ├── philosophy.ts         vision, mission, values, principles, success
│   ├── system.ts             the seven-stage educational system
│   ├── method.ts             the five method steps
│   ├── journey.ts            the seven journey stages, mentoring, advising
│   ├── programs.ts           the four programs
│   ├── resources.ts  faq.ts  about.ts
└── lib/
    ├── portal/               portal types, data seam, auth seam
    ├── contact/              delivery seam
    ├── seo.tsx               metadata helpers + JSON-LD
    ├── hooks.ts  utils.ts
```

**Editing copy never means editing components.** Everything a non-developer
would want to change — a program's duration, a value statement, a FAQ answer,
the WhatsApp number — lives in `src/content/`.

---

## Design system

Tokens are defined once in [`tailwind.config.ts`](tailwind.config.ts). The
colours carry meaning and are not interchangeable:

| Token | Hex | Meaning | Used for |
| --- | --- | --- | --- |
| `sky-500` | `#1597D4` | **Learn** | Primary buttons, links, interactive accents |
| `deep-700` | `#123B5D` | **Trust** | Headings, navigation, dark sections, footer |
| `growth-300` | `#7BCB8B` | **Progress** | Progress bars, success states, achievements |
| `olive-500` | `#6F7F32` | **Identity** | Secondary accents, badges — sparingly |
| `alert-500` | `#D64545` | **Attention** | Errors, warnings, missed work, real weaknesses |
| `paper` / `mist` | `#FFFFFF` / `#F4F6F7` | **Clarity** | Backgrounds, used heavily |

Target balance per page: ~50% white/soft-gray · ~25% deep blue · ~15% sky blue
· ~7% green + olive · ~3% red.

**Red is never decorative.** It appears only where something genuinely needs
attention: the "Common mistake" callouts, missed homework, the parent portal's
attention band, weak topics, and form errors.

Typography: Plus Jakarta Sans (display) · Inter (body) · IBM Plex Mono
(eyebrows, numerals, mathematical detail) — all self-hosted via `next/font`,
so no external font requests at runtime.

Decorative mathematical glyphs (`MathTexture`, `GlyphMark`) are typographic
only and always low-contrast. They are **not** a reinterpretation of the brand
mark and are never placed near the logo.

---

## Brand rules encoded in the build

1. The logo is used **as-is** from `public/brand`. `Logo.tsx` only positions it.
2. The portrait appears on the home hero, About, program intros and mentoring —
   and deliberately nowhere in dashboards, worksheets or content blocks.
3. No connection to Si Math anywhere.
4. No guaranteed-score claims. The site says so explicitly on `/about`, on each
   program page, in the FAQ and in the footer.
5. Every feature has a stated educational purpose.

---

## SEO

* Per-page titles, descriptions, canonicals, Open Graph and Twitter cards.
* JSON-LD: `EducationalOrganization`, `Person`, `Course` (per program),
  `FAQPage`, `BreadcrumbList`.
* `sitemap.xml` (public pages only) and `robots.txt` (portals disallowed).
* Keywords are worked into real sentences — SAT Math Egypt, EST Math teacher,
  SAT Math Basic/Advanced — never stuffed.

Set the live domain in `SITE.url` (`src/content/site.ts`) before launch;
canonicals, the sitemap and structured data all derive from it.

---

## Contact form

Fully built: server-side validation, field-level errors, preserved input on
error, a honeypot, and an accessible success state.

Delivery is pluggable. With no provider configured the form still validates and
responds — it tells the visitor it could not send and points them at WhatsApp
and email. It never pretends a message was delivered.

To turn delivery on:

```bash
CONTACT_PROVIDER=resend
RESEND_API_KEY=re_...
CONTACT_TO=info@desoukymath.com
CONTACT_FROM=site@yourdomain.com   # a verified sender
```

For SMTP, a CRM or a database instead, replace the body of `deliverEnquiry` in
`src/lib/contact/deliver.ts`. Nothing else changes.

---

## Accessibility & responsiveness

* Mobile-first, designed at 390px rather than compressed from desktop —
  the navigation, hero, cards and portal tables each have their own mobile
  treatment.
* Verified across every route at 390px and 1440px: one `<h1>` per page, no
  heading-level jumps, no horizontal overflow, no missing `alt`, no duplicate
  IDs, no unlabelled links.
* Visible focus rings, a skip link, `aria-current` on navigation, labelled form
  fields with `aria-invalid` and `role="alert"` errors.
* `prefers-reduced-motion` disables all animation and smooth scrolling.

---

## Deployment

Any Node host works; Vercel is the path of least resistance for Next.js.

1. Push the branch and import the repository.
2. Add the contact-form environment variables if you want delivery.
3. Point the domain, then set `SITE.url` in `src/content/site.ts` to match.

Baseline security headers (`X-Content-Type-Options`, `X-Frame-Options`,
`Referrer-Policy`, `Permissions-Policy`) are set in `next.config.mjs`. Add a
Content-Security-Policy once the final host and any embeds are known.

---

## Stack

Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS 3.4.
Every page is statically prerendered. `npm audit` reports zero vulnerabilities.
