# Owner / admin access

## What the inspection found

There is **no authentication in this project.** Not partial, not stubbed —
none:

| Looked for | Result |
| --- | --- |
| Auth library in `package.json` | none (deps are `next`, `react`, `react-dom`) |
| User store, session, or token handling | none |
| Password or credential input anywhere | none |
| `/login/student`, `/login/parent` | honest "not open yet" screens; no form, no sign-in |
| `getViewer()` in `src/lib/portal/auth.ts` | returns `null` unconditionally |
| Portal data | clearly-labelled sample data |

So there is no existing login for an owner role to attach to. The role model
and the attachment point now exist (`src/lib/admin/auth.ts`), but nothing
authenticates yet.

## What can and cannot be secured on the current host

The site is `output: 'export'` on GitHub Pages: static files, **no server, no
request handler.** Nothing runs between a visitor and a file. That has one
absolute consequence:

> **No authorization of any kind can be enforced on this host.** Any check
> would run in the visitor's browser, in JavaScript they downloaded and can
> read and edit. A login screen here authenticates nothing.

This is why `getOwnerSession()` returns `null` rather than comparing an email
in the browser. A client-side `email === OWNER` check is worse than no check:
it enforces nothing *and* publishes the answer.

### What is genuinely protected today

**The admin routes are not published.** `.github/workflows/deploy-pages.yml`
deletes `out/admin` before uploading and fails the build if anything matching
`admin` survives. A file that was never deployed cannot be fetched, guessed,
or bypassed.

That is real, and different in kind from hiding a link. Previously
`out/admin/index.html` *was* deployed, so anyone who guessed the URL got it.

Consequence to be aware of: **`/admin` is now 404 on the live site.** Run it
locally with `npm run dev` → `http://localhost:3000/admin`.

### What is UI-level only

`<OwnerEntry />` renders the dashboard link only when `getOwnerSession()`
returns an owner. Because that is always `null` today, the markup is absent
from every visitor's HTML — including yours. It is the correct integration
point, not a working entry point, and it starts working by itself once auth
is wired up.

## Minimum infrastructure for real authorization

Three things, none optional:

1. **A host that runs server code** — Vercel, Netlify, Cloudflare Pages with
   Functions, or any Node server. Remove `output: 'export'` from
   `next.config.mjs`. Steps 2 and 3 cannot be enforced without this.
2. **An identity provider** issuing verifiable sessions — Auth.js (NextAuth),
   Supabase Auth, or Clerk. Sessions must be `httpOnly`, `Secure`,
   `SameSite=Lax`.
3. **A middleware guard** on `/admin/:path*`.

Then set `ADMIN_EMAIL` as a host environment variable — no `NEXT_PUBLIC_`
prefix, so Next.js cannot inline it into the browser bundle — and flip
`IS_ADMIN_AUTH_ENABLED` to `true`.

### The guard, ready to paste

Create `middleware.ts` at the repository root. This runs on the server for
every matching request, before any page renders:

```ts
import { NextResponse, type NextRequest } from 'next/server'
import { getOwnerSession } from '@/lib/admin/auth'

export async function middleware(request: NextRequest) {
  const owner = await getOwnerSession()

  // 404, not 403: a stranger should not learn that this area exists.
  if (!owner) {
    return NextResponse.rewrite(new URL('/404', request.url), { status: 404 })
  }
  return NextResponse.next()
}

export const config = { matcher: ['/admin/:path*'] }
```

Then delete the "Strip the internal admin area" step from the deploy workflow
— but **only after** the guard is verified working, because that step is the
only thing protecting the area until then.

### Verifying it actually works

Do not trust the UI. Check the wire:

```bash
curl -si https://<host>/admin/ | head -1        # expect 404 when signed out
curl -si https://<host>/admin/schedule/ | head -1
```

Sign in as a non-owner account and repeat. Both must still be 404. A guard
that only hides the link in the header is not a guard.

## Data

Anything committed to this repository is public while the repository is
public, regardless of any login. Real student records belong in a database
read through an authenticated API — never in `src/content`.

`src/content/schedule.ts` is anonymised (`مجموعة أ` … `مجموعة هـ`) and carries
a warning header. Keep it that way.

**Outstanding:** real student first names remain in the history of commit
`e7d7114`. Two options, and a history rewrite needs an explicit go-ahead:

- make the repository private, or
- purge with `git filter-repo` and force-push.
