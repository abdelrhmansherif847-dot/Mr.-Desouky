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
readable by anyone, whether or not a route is linked — and that includes every
past commit.

Group names in `src/content/schedule.ts` are therefore anonymised
(`مجموعة أ` … `مجموعة هـ`). Keep them that way: a static export bakes whatever
is in that file into the published HTML, so there is nowhere in this project
where a real name could sit and stay private.

⚠️ **Real first names are still in commit `e7d7114`.** Removing them from the
current file does not remove them from history. Two ways to deal with that:

* **Make the repository private.** Fastest, and the right move if the site
  will move to a private host anyway. It limits future exposure rather than
  undoing past exposure.
* **Purge them from history** with `git filter-repo` (or BFG) and force-push.
  This rewrites every commit after that point, so anyone else with a clone
  must re-clone. Say the word and I will do it.

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

The admin area is a foundation for a later phase, not a product being built
now. It holds the schedule view and nothing speculative; new tools get added
when they are actually built.

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
