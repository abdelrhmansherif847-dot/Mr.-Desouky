'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { TURNSTILE_SCRIPT, TURNSTILE_SITE_KEY } from '@/lib/auth/captcha'
import { cn } from '@/lib/utils'

type TurnstileApi = {
  render: (el: HTMLElement, options: Record<string, unknown>) => string
  reset: (id: string) => void
  remove: (id: string) => void
}

declare global {
  interface Window {
    turnstile?: TurnstileApi
  }
}

/** One script for the whole page, however many widgets ask for it. */
let loading: Promise<TurnstileApi> | null = null

function loadTurnstile(): Promise<TurnstileApi> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (loading) return loading
  loading = new Promise<TurnstileApi>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SCRIPT
    script.async = true
    script.defer = true
    script.onload = () => (window.turnstile ? resolve(window.turnstile) : reject(new Error('unavailable')))
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new Error('unavailable'))
    }
    document.head.appendChild(script)
  })
  return loading
}

export type TurnstileHandle = {
  /** Tokens work once. Call after every request that used one. */
  reset: () => void
}

/**
 * Cloudflare Turnstile, drawn where it is placed and nowhere else.
 *
 * Reports a token when the check passes and null whenever there is no usable
 * token — expired, errored, or reset — so the form always knows whether it can
 * send. The token proves nothing here; Supabase verifies it (see
 * lib/auth/captcha).
 *
 * Sized to the card: the full widget is 300px wide, which does not fit the
 * card on the narrowest phones, so below that it uses Cloudflare's compact
 * form. The space is reserved before the script arrives, so nothing moves
 * when it does.
 */
export const Turnstile = forwardRef<
  TurnstileHandle,
  {
    /** Shown to Cloudflare's analytics only; lets one key serve several forms. */
    action: 'signup' | 'login' | 'magiclink' | 'recover'
    onToken: (token: string | null) => void
    className?: string
  }
>(function Turnstile({ action, onToken, className }, ref) {
  const container = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)
  const api = useRef<TurnstileApi | null>(null)
  const report = useRef(onToken)
  const [compact, setCompact] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    report.current = onToken
  }, [onToken])

  useImperativeHandle(ref, () => ({
    reset() {
      report.current(null)
      if (api.current && widget.current) api.current.reset(widget.current)
    },
  }))

  useEffect(() => {
    const el = container.current
    if (!el) return
    let cancelled = false
    const size = el.clientWidth < 300 ? 'compact' : 'normal'

    loadTurnstile()
      .then((turnstile) => {
        if (cancelled || !container.current) return
        api.current = turnstile
        setCompact(size === 'compact')
        widget.current = turnstile.render(container.current, {
          sitekey: TURNSTILE_SITE_KEY,
          action,
          theme: 'light',
          size,
          callback: (token: string) => report.current(token),
          'expired-callback': () => report.current(null),
          'timeout-callback': () => report.current(null),
          'error-callback': () => {
            report.current(null)
            // Returning nothing lets Turnstile retry on its own.
          },
        })
      })
      .catch(() => {
        if (!cancelled) setFailed(true)
      })

    return () => {
      cancelled = true
      if (api.current && widget.current) api.current.remove(widget.current)
      widget.current = null
    }
    // Rendered once per mount; `action` is fixed for a form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={className}>
      <p className="text-sm font-semibold text-deep-700">Security check</p>
      <div
        ref={container}
        className={cn('mt-2 flex w-full items-start', compact ? 'min-h-[140px]' : 'min-h-[65px]')}
      />
      {failed ? (
        <p role="alert" className="mt-1 text-xs leading-relaxed text-alert-600">
          The security check could not load. Check your connection, allow challenges.cloudflare.com
          if you use a content blocker, then reload the page.
        </p>
      ) : null}
    </div>
  )
})
