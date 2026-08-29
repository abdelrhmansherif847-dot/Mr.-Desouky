import { AdminShell } from '@/components/admin/AdminShell'
import { AccessNotice } from '@/components/admin/AccessNotice'
import { WeeklySchedule } from '@/components/schedule/WeeklySchedule'
import { ScheduleLegend, ScheduleNotes } from '@/components/schedule/ScheduleNotes'
import { SCHEDULE_RANGE, SCHEDULE_DAYS, studentGroups, weeklyLessonCount } from '@/content/schedule'

export default function AdminSchedulePage() {
  const facts = [
    { label: 'Teaching days', value: `${SCHEDULE_DAYS.length}`, note: 'Sun · Tue · Wed · Sat' },
    { label: 'Sessions a week', value: `${weeklyLessonCount()}`, note: 'Two hours each' },
    { label: 'Student groups', value: `${studentGroups().length}`, note: 'Across the week' },
    {
      label: 'Daily window',
      value: '10—11',
      note: `${SCHEDULE_RANGE.first} → ${SCHEDULE_RANGE.last}`,
    },
  ]

  return (
    <AdminShell
      title="Weekly schedule"
      subtitle="Row heights follow real duration, so the shape of each day reads before the text does."
    >
      <div className="space-y-6">
        <AccessNotice />

        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-deep-100 bg-deep-100 lg:grid-cols-4">
          {facts.map((fact) => (
            <div key={fact.label} className="bg-white p-4 sm:p-5">
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                {fact.label}
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-deep-700">
                {fact.value}
              </dd>
              <dd className="mt-1 text-xs text-deep-400">{fact.note}</dd>
            </div>
          ))}
        </dl>

        <WeeklySchedule />

        <section>
          <h2 className="font-display text-lg font-bold text-deep-700">Reading the schedule</h2>
          <div className="mt-4">
            <ScheduleLegend />
          </div>
        </section>

        <section>
          <h2 className="font-display text-lg font-bold text-deep-700">Notes and recent changes</h2>
          <div className="mt-4">
            <ScheduleNotes />
          </div>
        </section>

        <p className="rounded-card border border-deep-100 bg-white px-5 py-4 text-sm leading-relaxed text-deep-500">
          The timetable is edited in{' '}
          <code className="rounded bg-mist px-1.5 py-0.5 font-mono text-xs text-deep-600">
            src/content/schedule.ts
          </code>
          . Days, slots, groups, session types and notes all live there — changing that one file
          updates this view.
        </p>
      </div>
    </AdminShell>
  )
}
