# Admin area

Internal tools for running the teaching practice. Deliberately separate from
the public website: not in the navigation, not in the sitemap, not indexed.

```
/admin            overview
/admin/schedule   the weekly timetable
```

---

## ⚠️ It is not protected, and on this hosting it cannot be

Read this before putting anything real here.

The site is a **static export served by GitHub Pages**. There is no server, so
there is nothing to check a login. A sign-in screen on a static site is
decoration — it hides nothing. Anyone who types `/admin` sees the page, and
everything in the JavaScript bundle can be downloaded.

**Separately: this repository is public.** Everything committed to it is
readable by anyone, whether or not a route is linked. That includes
`src/content/schedule.ts` and the student names in it — and it includes every
past commit, so deleting the file later does not unpublish it.

What is in place today is *privacy by intent*, which is worth having but is
not security:

| Measure | Effect |
| --- | --- |
| Absent from all public navigation | Visitors do not stumble into it |
| `robots: noindex, nofollow` on every admin page | Kept out of search results |
| `Disallow: /admin/` in `robots.txt` | Well-behaved crawlers skip it |
| Excluded from `sitemap.xml` | Not advertised |

None of that stops someone who knows the URL.

---

## Making it genuinely private

Two things are needed, and both matter — either alone is not enough.

**1. A server to enforce a session.**
Move off static export to a Node host (Vercel is the least friction for
Next.js), then:

* add a provider — Auth.js, Supabase Auth or Clerk;
* implement `getAdminViewer()` in [`src/lib/admin/auth.ts`](../src/lib/admin/auth.ts);
* guard `/admin/:path*` in `middleware.ts`, not in the component — a check
  inside a page still ships the page;
* set `IS_ADMIN_AUTH_ENABLED = true` and remove `<AccessNotice />`.

**2. The data behind that server.**
Real student records belong in a database read through an authenticated API,
not in `src/content`. Until then, treat everything in this repository as
public.

If you want the current timetable private *now*, the quickest route is to make
the repository private — but note the names are already in the published
history, so that limits future exposure rather than undoing past exposure.

---

## Architecture

The public site and the admin area are siblings, not parent and child:

```
src/app/
├── layout.tsx        document shell only — fonts, metadata, global styles
├── (site)/
│   ├── layout.tsx    public chrome: SiteHeader, PageTransition, SiteFooter, WhatsApp
│   └── …             every public page and both portals
└── admin/
    ├── layout.tsx    noindex; inherits no public chrome
    ├── page.tsx      overview
    └── schedule/     the weekly timetable
```

`(site)` is a route group, so it does not appear in any URL — every public page
still lives exactly where it did. The split exists so `/admin` can render its
own chrome instead of the marketing header and footer.

**Design language is shared, product identity is not.** The admin area uses the
same tokens, type, spacing and motion system as the site, but reads as a
different product: a deep header, an "Internal" marker, a denser working
surface and no marketing links.

---

## Adding a tool

1. Put its data in `src/content/` (or, later, behind the API).
2. Create `src/app/admin/<tool>/page.tsx` and wrap it in `<AdminShell>`.
3. Add it to `ADMIN_NAV` in
   [`src/components/admin/AdminShell.tsx`](../src/components/admin/AdminShell.tsx).
4. Leave `<AccessNotice />` in place until auth is real.

The overview page lists Students, Attendance and Payments as the next tools;
they are placeholders marked "Not built yet" rather than dead links.

---

## The weekly schedule

Lives at `/admin/schedule`, built from
[`src/content/schedule.ts`](../src/content/schedule.ts) — days, time slots,
groups, session types and notes. Editing that one file updates both the
desktop timeline and the mobile day view.

It was briefly a public page at `/schedule`. It is not any more: a timetable
with student first names is an operational tool, not marketing, and the public
site is better without it.
