import Link from 'next/link'
import { Reveal } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'
import type { StudentBase } from '@/components/portal/base'

/**
 * The doors out of the dashboard.
 *
 * Two kinds of card, and the difference is deliberate and visible: a door that
 * opens, and a door that is not built yet. The second kind is not a link, is
 * not focusable, and says so on its face. A disabled-looking button that
 * silently does nothing is worse than an honest "planned" label — the student
 * tries it, nothing happens, and they assume the product is broken rather than
 * unfinished.
 */

type Destination = {
  label: string
  description: string
  icon: keyof typeof ICONS
  /** Absent while the destination does not exist yet. */
  href?: string
}

const ICONS = {
  journey: 'M5 19V5m0 0 4 3-4 3m14 8V5m0 0-4 3 4 3M9 19h6',
  sessions: 'M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z',
  homework: 'M6 4h9l4 4v12H6V4Zm9 0v4h4M9 13h7M9 17h5',
  quizzes: 'M9 11l2 2 4-4m-9 9h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1Z',
  mocks: 'M4 19V9m5 10V5m5 14v-7m5 7V7',
  results: 'M4 20h16M7 16V9m5 7V5m5 11v-4',
  transcript: 'M5 4h14v16H5V4Zm4 5h6M9 13h6M9 17h3',
  support: 'M12 18h.01M9.1 9a3 3 0 1 1 4.2 2.7c-.8.4-1.3 1.2-1.3 2.1',
  notifications: 'M12 4a5 5 0 0 0-5 5v3l-1.5 3h13L17 12V9a5 5 0 0 0-5-5Zm-2 14a2 2 0 0 0 4 0',
} as const

const destinations = (base: StudentBase): Destination[] => [
  { label: 'My Journey', description: 'The seven stages, and where you are', icon: 'journey', href: `${base}/journey` },
  { label: 'Sessions', description: 'Every session, attended and ahead', icon: 'sessions', href: `${base}/sessions` },
  { label: 'Homework', description: 'What is set, done and due', icon: 'homework', href: `${base}/homework` },
  { label: 'Quizzes & Reviews', description: 'Scores, and the reason behind each', icon: 'quizzes', href: `${base}/quizzes` },
  { label: 'Mock Exams', description: 'Full papers under real timing', icon: 'mocks', href: `${base}/mocks` },
  { label: 'Results', description: 'A single record of every score', icon: 'results' },
  { label: 'Transcript', description: 'Your formal progress summary', icon: 'transcript' },
  { label: 'Notifications', description: 'Announcements and reminders', icon: 'notifications' },
]

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path
        d={ICONS[name]}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function QuickAccess({ base }: { base: StudentBase }) {
  return (
    <section aria-labelledby="quick-access-heading">
      <div className="mb-3.5 flex items-baseline justify-between gap-4">
        <h2 id="quick-access-heading" className="font-display text-base font-bold text-deep-700">
          Everything else
        </h2>
        <p className="text-xs text-deep-500">Some of these are still being built</p>
      </div>

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {destinations(base).map((item, index) => {
          const body = (
            <>
              <span
                className={cn(
                  'inline-flex h-9 w-9 items-center justify-center rounded-xl',
                  item.href
                    ? 'bg-sky-50 text-sky-600 transition-colors duration-200 ease-smooth group-hover:bg-sky-100'
                    : 'bg-mist text-deep-300',
                )}
              >
                <Icon name={item.icon} />
              </span>
              <span className="mt-3 block font-display text-sm font-bold text-deep-700">
                {item.label}
              </span>
              <span className="mt-1 block text-xs leading-snug text-deep-500">
                {item.description}
              </span>
            </>
          )

          return (
            <Reveal as="li" variant="scale" index={index} key={item.label}>
              {item.href ? (
                <Link
                  href={item.href}
                  className={cn(
                    'group block h-full rounded-card border border-deep-100 bg-white p-4',
                    'shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-calm',
                    'hover:-translate-y-1 hover:border-sky-200 hover:shadow-lift',
                    'active:translate-y-0 active:shadow-card active:duration-[120ms]',
                    'motion-reduce:hover:translate-y-0 motion-reduce:active:translate-y-0',
                  )}
                >
                  {body}
                </Link>
              ) : (
                <div className="relative h-full rounded-card border border-dashed border-deep-200 bg-mist/50 p-4">
                  {body}
                  <span className="mt-3 inline-block rounded-full bg-white px-2.5 py-1 font-mono text-[0.55rem] font-semibold uppercase tracking-[0.1em] text-deep-500 ring-1 ring-inset ring-deep-200/60">
                    Planned
                  </span>
                </div>
              )}
            </Reveal>
          )
        })}
      </ul>
    </section>
  )
}
