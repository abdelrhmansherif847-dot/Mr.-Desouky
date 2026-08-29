# Authentication and the owner/admin area

## Architecture

**Next.js on Vercel · Supabase Auth (magic link) · Postgres with row-level
security.**

Chosen because the whole growth path — students, schedules, attendance,
payments, progress — needs auth *and* a database *and* per-row access rules,
and Supabase provides all three in one service with Postgres underneath rather
than a proprietary store. Vercel runs Next.js middleware natively, which is
what makes a route guard possible at all. Magic links mean no password to
phish, reuse or reset, which suits a single owner account.

### Why access is a database property, not a login

Two independent checks, both server-side:

1. **Authentication** — `supabase.auth.getUser()` asks the auth server to
   verify the token on every call. Used deliberately instead of
   `getSession()`, which only decodes the cookie and so trusts data the client
   can forge.
2. **Authorization** — the verified user id must have `role = 'owner'` in
   `public.profiles`. No client-side key can write that column: the RLS policy
   permits updating your own row only while `role` is unchanged, and there is
   no INSERT or DELETE policy at all. Rows appear solely through a trigger,
   always as `student`.

So signing in is not getting in. Anyone can request a magic link for their own
address and receive a valid session; they still have no owner row, so `/admin`
stays 404 for them.

### Two build modes, one codebase

| | `STATIC_EXPORT=true` → GitHub Pages | default → Vercel |
| --- | --- | --- |
| Contains | public marketing site only | full application |
| Admin routes | deleted before the build | present |
| Middleware | deleted before the build | **runs — this is the guard** |
| Protection | not published at all | server-enforced 404 |

The Pages workflow runs `rm -rf src/app/admin src/app/auth middleware.ts`
*before* building, then fails the build if anything admin- or auth-shaped
appears in `out/`. Deleting before rather than stripping after means no admin
route, chunk, or unenforceable guard ever reaches that bundle. Verified: 0
chunks in the public build mention Supabase.

This is why your live site does not go dark during the move.

## Setting it up

### 1. Supabase project

Create one, then **Project Settings → API** for the URL and the publishable
`anon` key. Never copy the `service_role` key anywhere — it bypasses RLS.

### 2. Schema

Run `supabase/migrations/0001_profiles_and_roles.sql` in the SQL editor.

### 3. Auth settings

- **Authentication → Providers → Email**: enable, and turn *Confirm email* on.
- **Authentication → URL Configuration**: set Site URL to your deployment and
  add `https://<your-domain>/auth/callback` to the redirect allow-list. A
  redirect not on that list is refused, which is what stops a link being
  redirected to an attacker's site.
- Consider disabling public sign-ups once your own account exists. Not
  security-critical — a signed-up stranger gets `student` and sees nothing —
  but it keeps the user table clean.

### 4. Deploy to Vercel

Import the repository. Set, for Production and Preview:

```
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
```

Do **not** set `STATIC_EXPORT` there.

### 5. Promote yourself — once, by hand

Sign in at `/admin/login` so the row exists, then in the SQL editor:

```sql
update public.profiles set role = 'owner' where email = 'your-address@example.com';
select email, role from public.profiles where role = 'owner';   -- expect 1 row
```

By hand, deliberately. An application that can grant `owner` is an application
that can be tricked into granting it.

## Verify it on the wire

Do not trust the UI. Check the responses:

```bash
# Signed out — both must be 404
curl -s -o /dev/null -w '%{http_code}\n' -L https://<host>/admin/
curl -s -o /dev/null -w '%{http_code}\n' -L https://<host>/admin/schedule/

# Signed in as a NON-owner account — must still be 404
# Signed in as the owner — 200
```

A guard that only hides a link in the header is not a guard.

## What is enforced today, precisely

| | Status |
| --- | --- |
| `/admin` on GitHub Pages | **Not published.** Cannot be fetched |
| `/admin` on Vercel, signed out | **404** — server-enforced, verified |
| `/admin` with Supabase unconfigured | **404** — fails closed, verified |
| `/admin` signed in as non-owner | **404** — enforced by the role check |
| `role` escalation by a client | **Impossible** — no RLS policy permits it |
| Owner email in the browser bundle | **Never** — it lives only in the database |
| Public pages made dynamic by this | **None** — all 26 stay static |

## Where the owner's entry point lives

At `/admin`. Bookmark it. Once signed in, the admin shell shows who you are
and offers Sign out; signed out, it is a 404 like it is for everyone else.

There is deliberately no owner button on the public site. An earlier version
rendered one from the session in the public layout, which was measured and
rejected: reading the session calls `cookies()` in a shared layout, and that
opts the entire subtree into dynamic rendering. With Supabase configured it
turned **15 static marketing pages into server-rendered ones**, adding a
Supabase round-trip to every visit by every student and parent — a permanent
cost on the public site so that one person might see a floating button.

The public site is now verified to stay fully static with Supabase configured:
0 dynamic public routes. Only `/admin`, `/admin/signout` and `/auth/callback`
render on demand.

If you do want the floating button, the version that does not cost anything is
a small client-side check that runs only when an auth cookie is already
present. Ask and I will add it — the guard is unaffected either way, since the
button is only a link and `/admin` is protected server-side regardless.

## Data

Anything committed to this repository is public while the repository is
public, regardless of any login. Real student records belong in Postgres
behind RLS — never in `src/content`.

`src/content/schedule.ts` is anonymised (`مجموعة أ` … `مجموعة هـ`). Keep it so
until the tables exist.

**Outstanding:** real student first names remain in the history of commit
`e7d7114`. Either make the repository private, or purge with `git filter-repo`
and force-push. A history rewrite needs an explicit go-ahead.
