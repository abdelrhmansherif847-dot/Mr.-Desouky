/**
 * CAPTCHA — Cloudflare Turnstile, verified by Supabase Auth itself.
 *
 * Where the check happens matters more than which widget is shown. Sign-up,
 * sign-in and password reset go from the browser straight to Supabase with
 * the public anon key, so a check in this application could simply be
 * skipped by calling the API directly. Instead the token travels with the
 * auth request (`options.captchaToken`) and Supabase verifies it against
 * Cloudflare before doing anything else — before it has looked up the email
 * address, so a failure says nothing about whether an account exists.
 *
 * Two keys, kept apart:
 *
 *   Site key    public by design; shipped in the browser to draw the widget.
 *               NEXT_PUBLIC_TURNSTILE_SITE_KEY, set in Vercel, never
 *               committed.
 *   Secret key  entered only in Supabase → Authentication → Bot and Abuse
 *               Protection. It is not in this codebase, in Vercel, or in any
 *               environment variable this application reads.
 *
 * Enabling it in Supabase applies to every one of those endpoints at once,
 * including the owner's magic link — so every form that calls them sends a
 * token whenever a site key is configured. See docs/ADMIN.md for the order
 * of switching it on.
 */
export const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

/** A site key is configured, so the widget is shown and its token sent. */
export const IS_CAPTCHA_CONFIGURED = TURNSTILE_SITE_KEY.length > 0

/** Cloudflare's script, rendered explicitly so React decides where and when. */
export const TURNSTILE_SCRIPT = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

/**
 * Whether a registration may be sent at all.
 *
 * Registration is the one form that is never sent without a CAPTCHA result:
 * with no site key configured it is refused here, before Supabase is called,
 * rather than relying on the dashboard setting alone. Sign-in and reset are
 * not gated this way, so the owner's existing sign-in keeps working on any
 * deployment that has no key yet.
 */
/** The prompt shown until a token exists; a new token clears only this. */
export const CAPTCHA_PROMPT = 'Please complete the security check.'

export function signUpCaptchaProblem(configured: boolean, token: string | null): string | null {
  if (!configured) return 'Registration is not open yet. Please check back soon.'
  if (!token) return CAPTCHA_PROMPT
  return null
}

/** For sign-in and reset: only required when the widget is on the page. */
export function captchaProblem(configured: boolean, token: string | null): string | null {
  if (configured && !token) return CAPTCHA_PROMPT
  return null
}
