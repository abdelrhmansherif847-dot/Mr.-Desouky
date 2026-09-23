import Link from 'next/link'
import { LogoMark } from '@/components/brand/Logo'

/**
 * The screen an account sees when it is signed in but not allowed into a
 * portal. It states the account's position and nothing else — no reason, no
 * internal detail, no hint of what anyone else can reach — because the only
 * useful next step is the same in every case: talk to Mr. Desouky.
 */
export function AccountNotice({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <section className="bg-mist">
      <div className="container-page flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-16">
        <div className="w-full max-w-md rounded-panel border border-deep-100 bg-white p-7 shadow-card sm:p-9">
          <LogoMark size="md" />
          <p className="eyebrow mt-6 text-sky-600">{eyebrow}</p>
          <h1 className="mt-2 font-display text-xl font-bold text-deep-700">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-deep-600">{body}</p>
          <div className="mt-7 flex flex-wrap gap-x-6 gap-y-2 border-t border-deep-100 pt-5 text-sm">
            <Link href="/contact" className="link-underline font-semibold text-sky-600">
              Contact Mr. Desouky
            </Link>
            <Link href="/" className="link-underline font-semibold text-deep-500">
              Back to the website
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
