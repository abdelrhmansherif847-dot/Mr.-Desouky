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

## Creating accounts: use the Admin API, not raw SQL

Creating a user with `insert into auth.users (...)` leaves several columns
NULL that GoTrue scans into Go strings, which cannot hold NULL. Every
subsequent sign-in attempt then fails with a 500 and this in the auth logs:

    error finding user: sql: Scan error on column index 3,
    name "confirmation_token": converting NULL to string is unsupported

The owner account was created this way and hit exactly that. If you ever add
an account by SQL again, set these to empty strings in the same statement:

```sql
update auth.users
   set confirmation_token         = coalesce(confirmation_token, ''),
       recovery_token             = coalesce(recovery_token, ''),
       email_change               = coalesce(email_change, ''),
       email_change_token_new     = coalesce(email_change_token_new, ''),
       email_change_token_current = coalesce(email_change_token_current, ''),
       phone_change               = coalesce(phone_change, ''),
       phone_change_token         = coalesce(phone_change_token, ''),
       reauthentication_token     = coalesce(reauthentication_token, '')
 where id = '<the new user>';
```

Prefer the dashboard's Add User, or the Admin API, which set them correctly.
Note that both are refused while sign-ups are closed (migration 0003), so
re-open, create, then close again.

## Email sending, and its limit

Supabase's built-in email sender allows only a few messages per hour and is
documented as being for testing, not production. Exceeding it returns:

    429  over_email_send_rate_limit  "email rate limit exceeded"

There is a second, shorter limit too — "you can only request this after 22
seconds" — which is a per-request cooldown rather than the hourly quota.
Waiting a minute clears that one; only time clears the quota.

This bit during setup: several sign-in attempts in quick succession exhausted
the hour, and the screen reported a generic failure, so it looked like a fault
in the code. The form now shows the real message.

**Before real use, attach your own SMTP sender** — Supabase → Project Settings
→ Authentication → SMTP Settings. Resend, Postmark, SES or any provider works.
The quota then becomes theirs rather than Supabase's shared test allowance,
and messages stop landing in spam, which the default sender frequently does.

## The magic link must use token_hash, not the default URL

**Supabase → Authentication → Email Templates → Magic Link** must build the
link like this:

    {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=magiclink

not the default `{{ .ConfirmationURL }}`. This is not cosmetic. It is the
difference between sign-in working and sign-in never working at all.

The default `{{ .ConfirmationURL }}` sends the visitor to Supabase's own
`/auth/v1/verify`, which redirects back with `?code=`. That code belongs to a
PKCE flow, and PKCE's code verifier is stored in a cookie belonging to the
browser that *requested* the link. A magic link is opened in whatever browser
the mail client picks — on a phone, the mail app's own in-app browser, which
has a different cookie jar. The verifier is therefore missing,
`exchangeCodeForSession` throws `AuthPKCECodeVerifierMissingError` before it
even reaches the network, and no session is created. `@supabase/ssr`'s
`createBrowserClient` hardcodes `flowType: "pkce"` and will not let you turn
this off, so the template is where it has to be solved.

`{{ .TokenHash }}` instead lands the visitor straight on `/auth/callback`,
which redeems it with `verifyOtp` over a POST. No verifier is involved, so any
browser on any device works, and nothing secret is ever in the URL — the
session comes back in the response body.

**Both sign-in forms must send an `emailRedirectTo` that already has a query
string**, because the template appends with `&`. `/auth/callback` on its own
would become `/auth/callback&token_hash=…`, where the token is part of the
path and the link is dead. `callbackUrl()` in `src/lib/auth/destinations.ts`
is the single place that builds it, for exactly this reason — do not hand
`signInWithOtp` a redirect URL built by hand.

How to tell this is wrong from the logs: `GET /auth/v1/verify` returning 303
with `action: login` and no error, followed by **no** `POST /auth/v1/token`
request at all, and `select count(*) from auth.sessions` returning 0.

## Reading the real error

The site deliberately shows the same neutral message whatever goes wrong, so
it cannot be used to probe. The actual reason is in the auth logs:

```sql
select timestamp, event_message from logs
 where source = 'auth_logs' order by timestamp desc limit 25
```

That is how the NULL-column failure above was identified — the UI only said
"That could not be sent just now."

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

## Accounts, approval and the portals

Signing in is not getting in. A student or parent portal renders only when all
four hold:

1. the session verifies with the auth server (`getUser()`, never `getSession()`),
2. a `public.profiles` row exists for that user,
3. `profiles.status` is `approved`,
4. `profiles.role` matches the portal — `student` for `/student`, `parent` for
   `/parent`.

`middleware.ts` enforces this before any portal page renders, and the portal
layouts check it a second time through `getViewer()` in
`src/lib/portal/auth.ts`, so neither is the only line of defence.

| Who | `/student`, `/parent` | `/admin` |
| --- | --- | --- |
| Anonymous | redirected to that portal's login | 404 |
| Signed in, `pending` | `/account/pending` | 404 |
| Signed in, `suspended` | `/account/suspended` | 404 |
| Approved student on `/parent` (or parent on `/student`) | sent to their own portal | 404 |
| Owner | sent to `/admin` | allowed |

`/admin` still answers 404 to everyone but the owner, exactly as before. The
portals redirect instead, because they are advertised product surfaces.

The public sample-data preview lives at `/preview/student` and
`/preview/parent`. It renders only the fictional sample record, reads no
session, queries nothing, is `noindex`, and is published on GitHub Pages
while the real portals are stripped from that build.

### Account states

`public.profiles.status` is one of `pending`, `approved`, `suspended`
(migration 0004). A new account starts `pending`. Nobody can change their own
status, role or email: migration 0004 limits the `UPDATE` privilege for
signed-in users to `full_name` and `phone`, and the
`private.enforce_role_immutable` trigger refuses the rest again.

Verified on the live project after 0004, as `authenticated` holding the
owner's own identity, inside a block that always aborts:

| Attempt | Result |
| --- | --- |
| `set status = …` | **refused** — permission denied |
| `set role = …` | **refused** — permission denied |
| `set email = …` | **refused** — permission denied |
| `set full_name = …` | allowed, own row only |
| `set phone = …` | allowed, own row only |

### Approving, suspending and correcting accounts

Approval is manual for now and happens in the Supabase **SQL editor**, which
runs as `postgres` and so is not bound by the limits above. There is
deliberately no approval endpoint in the application yet: one would need a
privileged database function, which is exactly the kind of RPC migration 0002
removed.

```sql
-- Who is waiting
select email, full_name, phone, role, created_at
  from public.profiles
 where status = 'pending'
 order by created_at;

-- Approve
update public.profiles set status = 'approved' where email = 'someone@example.com';

-- Suspend, and reinstate
update public.profiles set status = 'suspended' where email = 'someone@example.com';
update public.profiles set status = 'approved'  where email = 'someone@example.com';

-- Correct the role chosen at sign-up
update public.profiles set role = 'parent' where email = 'someone@example.com';

-- Check the result: expect exactly one row
select email, role, status from public.profiles where email = 'someone@example.com';
```

Never set `role = 'owner'` from these commands. There is one owner.

## What is enforced today, precisely

Verified against the live project with two temporary accounts (one student,
one owner), since deleted. The database is back to 0 users, 0 profiles.

| Check | Result |
| --- | --- |
| Supabase security advisors | **0 issues** |
| Rows a student can read | **1** — their own only |
| Rows an owner can read | **all** |
| `is_owner()` for a student / owner | **false / true** |
| Student promoting themselves to owner | **refused** — `role is not user-modifiable` |
| Student editing another person's row | **0 rows** — RLS matched nothing |
| Student renaming themselves | **allowed** — the lock is not over-broad |
| Student INSERT into profiles | **refused** — `permission denied` |
| Anonymous SELECT from profiles | **refused** — `permission denied` |
| `/admin` with Supabase unconfigured | **404** — fails closed |
| `/admin` on GitHub Pages | **Not published.** Cannot be fetched |
| Owner email in the browser bundle | **Never** — it lives only in the database |
| Public pages made dynamic by this | **None** — all 26 stay static |

Two of those matter more than the rest. A student INSERT is refused by
*privileges*, before RLS is even consulted; and the escalation is refused by a
*trigger*, not by a policy — so neither depends on a policy expression being
written correctly.

**Not yet verified end to end:** a real browser sign-in against
`/admin`, because this sandbox's egress policy blocks `*.supabase.co`. The
authorization logic is proven at the database layer above, and the middleware
is proven to fail closed. The one untested link is the session cookie round
trip, which the curl checks below confirm after deployment.

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
