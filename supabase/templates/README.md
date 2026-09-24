# Auth email templates

The source of truth for the link inside each Supabase Auth email. Supabase
does not read these files — they are pasted into
**Dashboard → Authentication → Emails → Templates**. Keep the two in step:
if a template is edited in the Dashboard, copy it back here in the same
commit that depends on it. `npm test` renders each one and checks the link
it produces against the callback's rules.

| Dashboard template | File | Link type |
|---|---|---|
| Confirm signup   | `confirm-signup.html`  | `signup` |
| Reset Password   | `reset-password.html`  | `recovery` |
| Magic Link       | not changed here — already live and working | `magiclink` |

## Why the link is built this way

    {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=<type>

- **`token_hash`, not `{{ .ConfirmationURL }}`.** The default link carries a
  PKCE code, which can only be redeemed in the browser that asked for the
  email (its code verifier lives there). A token hash is redeemed with
  `verifyOtp`, which needs nothing from the original browser, so the link
  works when it opens in a mail app, on another device, or in another
  browser.
- **Nothing is redeemed by opening the link.** The token is spent by a
  POST from the callback page's JavaScript, not by the GET. Link scanners
  and previewers that fetch the URL cannot use it up.
- **`{{ .RedirectTo }}` already carries `?next=…`** (see `callbackUrl` and
  `recoveryUrl` in `src/lib/auth/destinations.ts`), which is why the
  template appends with `&`. Supabase only uses the requested address if
  it is on the Redirect URLs allowlist or on the Site URL's host;
  otherwise it substitutes the bare Site URL, and the link would be
  malformed. Every environment that sends email must therefore be
  allowlisted.
- **`type` is matched against an allowlist** in the callback
  (`LINK_TYPES`): magiclink, signup, recovery, email_change. Anything else
  is refused before `verifyOtp` is called, and Supabase binds each token
  to the type it was issued as.
