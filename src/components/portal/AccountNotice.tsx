import Link from 'next/link'
import { ButtonLink } from '@/components/ui/Button'
import { AccountPath } from './AccountPath'
import { AuthCard, CardFoot, CardHeading, ContactLine } from './AuthCard'
import { AuthStage, StageIntro } from './AuthStage'

/**
 * The screen an account sees when it is signed in but not allowed into a
 * portal. It states the account's position and nothing else — no reason, no
 * internal detail, no hint of what anyone else can reach — because the only
 * useful next step is the same in every case: talk to Mr. Desouky.
 *
 * Pending shows where the account is on its path, so "waiting" reads as a
 * step in progress rather than a dead end. Suspended is the one place on the
 * account screens that uses the alert colour, and only as a small mark: it
 * needs attention, it is not an emergency.
 */
export function AccountNotice({
  state,
  eyebrow,
  title,
  body,
}: {
  state: 'pending' | 'suspended'
  eyebrow: string
  title: string
  body: string
}) {
  return (
    <AuthStage intro={<StageIntro eyebrow={eyebrow} title={title} lead={body} />}>
      <AuthCard>
        {state === 'pending' ? (
          <>
            <CardHeading
              eyebrow="Where your account is"
              title="Waiting for approval"
              lead="Nothing more to do on your side. You will be able to sign in as soon as it is approved."
            />
            <div className="mt-6">
              <AccountPath current={2} tone="light" from={2} />
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3.5">
              <span
                aria-hidden="true"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-alert-50 ring-1 ring-inset ring-alert-200"
              >
                <svg viewBox="0 0 16 16" className="h-4 w-4 text-alert-600">
                  <path d="M5.5 4.5v7M10.5 4.5v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <div>
                <CardHeading title="Access is paused" />
                <p className="mt-2 text-sm leading-relaxed text-deep-600">
                  Your account and its history are kept. Mr. Desouky can restore access.
                </p>
              </div>
            </div>
          </>
        )}

        <ButtonLink href="/contact" size="lg" className="mt-7 w-full bg-sky-600 hover:bg-sky-700 active:bg-sky-800">
          Contact Mr. Desouky
        </ButtonLink>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/" className="link-underline font-semibold text-deep-600">
            Back to the website
          </Link>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="link-underline font-semibold text-deep-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2"
            >
              Sign out
            </button>
          </form>
        </div>

        <CardFoot>
          <ContactLine lead="Quicker on WhatsApp? Message" />
        </CardFoot>
      </AuthCard>
    </AuthStage>
  )
}
