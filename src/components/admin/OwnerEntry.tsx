import Link from 'next/link'
import { getOwnerSession } from '@/lib/admin/auth'

/**
 * The owner's way into the admin area.
 *
 * A server component, deliberately. It asks the session who is viewing and
 * renders nothing at all for everyone else — so for a student, a parent, or
 * an anonymous visitor this markup is absent from the HTML they receive,
 * rather than present and hidden with CSS.
 *
 * Today `getOwnerSession()` is null on every request, so this renders nothing
 * for everybody, including the owner. That is correct and not a placeholder
 * to be "fixed" by checking an email in the browser: until a server verifies
 * the session there is no trustworthy answer to "who is this?", and inventing
 * one client-side would put the answer in the public bundle.
 *
 * When auth is wired up (see src/lib/admin/auth.ts) this starts working with
 * no change here.
 */
export async function OwnerEntry() {
  const owner = await getOwnerSession()
  if (!owner) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 print:hidden">
      <Link
        href="/admin"
        className="group inline-flex items-center gap-2.5 rounded-full border border-deep-100 bg-white/95 py-2 pl-2 pr-4 shadow-lift backdrop-blur-sm transition-[transform,box-shadow] duration-300 ease-calm hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
      >
        <span
          aria-hidden="true"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-deep-700 font-display text-xs font-bold text-white"
        >
          {owner.name.trim().charAt(0).toUpperCase()}
        </span>
        <span className="flex flex-col leading-none">
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.14em] text-deep-400">
            Owner
          </span>
          <span className="mt-1 font-display text-[0.82rem] font-semibold text-deep-700 group-hover:text-sky-600">
            Dashboard
          </span>
        </span>
      </Link>
    </div>
  )
}
