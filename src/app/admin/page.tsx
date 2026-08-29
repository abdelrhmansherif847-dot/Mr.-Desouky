import Link from 'next/link'
import { AdminShell } from '@/components/admin/AdminShell'
import { AccessNotice } from '@/components/admin/AccessNotice'
import { ArrowRight } from '@/components/ui/Button'
import { SCHEDULE_DAYS, studentGroups, weeklyLessonCount } from '@/content/schedule'

/** Tools that exist today, and the ones this area is shaped to grow into. */
const TOOLS = [
  {
    href: '/admin/schedule',
    title: 'Weekly schedule',
    body: 'The teaching week — sessions, breaks and open slots across the four days.',
    ready: true,
  },
  { href: null, title: 'Students', body: 'Groups, contact details and enrolment.', ready: false },
  { href: null, title: 'Attendance', body: 'Who attended, per session.', ready: false },
  { href: null, title: 'Payments', body: 'Fees due, paid and outstanding.', ready: false },
]

export default function AdminOverviewPage() {
  const lessons = weeklyLessonCount()
  const groups = studentGroups().length

  const stats = [
    { label: 'Teaching days', value: SCHEDULE_DAYS.length },
    { label: 'Sessions a week', value: lessons },
    { label: 'Student groups', value: groups },
  ]

  return (
    <AdminShell title="Overview" subtitle="Operational tools for running the teaching week.">
      <div className="space-y-6">
        <AccessNotice />

        <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-card border border-deep-100 bg-deep-100">
          {stats.map((s) => (
            <div key={s.label} className="bg-white p-4 sm:p-5">
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                {s.label}
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-deep-700">
                {s.value}
              </dd>
            </div>
          ))}
        </dl>

        <ul className="grid gap-3 sm:grid-cols-2">
          {TOOLS.map((tool) =>
            tool.ready && tool.href ? (
              <li key={tool.title}>
                <Link
                  href={tool.href}
                  className="group flex h-full flex-col rounded-card border border-deep-100 bg-white p-5 transition-[transform,box-shadow,border-color] duration-300 ease-calm hover:-translate-y-1 hover:border-sky-200 hover:shadow-card motion-reduce:hover:translate-y-0"
                >
                  <h2 className="font-display text-lg font-bold text-deep-700 group-hover:text-sky-600">
                    {tool.title}
                  </h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-deep-500">{tool.body}</p>
                  <span className="mt-4 inline-flex items-center gap-2 py-1 font-display text-sm font-semibold text-sky-600">
                    Open
                    <ArrowRight />
                  </span>
                </Link>
              </li>
            ) : (
              <li
                key={tool.title}
                className="flex h-full flex-col rounded-card border border-dashed border-deep-200 bg-white/60 p-5"
              >
                <h2 className="font-display text-lg font-bold text-deep-600">{tool.title}</h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-deep-400">{tool.body}</p>
                <span className="mt-4 font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                  Not built yet
                </span>
              </li>
            ),
          )}
        </ul>
      </div>
    </AdminShell>
  )
}
