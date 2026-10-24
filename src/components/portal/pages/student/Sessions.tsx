import { PreviewNotice } from '@/components/portal/PreviewNotice'
import type { StudentPageProps } from '@/components/portal/pages/props'
import { Panel, StatTile, StatusPill, DateChip, EmptyPanel, EmptyState } from '@/components/portal/widgets'
import { attendanceRate } from '@/lib/portal/insights'
import { formatLongDate } from '@/lib/utils'

export default async function StudentSessionsPage({ record, preview }: StudentPageProps) {
  const attendance = attendanceRate(record)
  const upcoming = record.sessions.filter((s) => s.status === 'upcoming')
  const past = record.sessions.filter((s) => s.status !== 'upcoming').reverse()

  if (record.sessions.length === 0) {
    return (
      <div className="space-y-5">
        {preview ? <PreviewNotice audience="student" /> : null}
        <EmptyPanel title="No sessions yet" icon="M7 3v3m10-3v3M4 9h16M5 6h14a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1Z">
          Your sessions appear here once Mr. Desouky schedules them — with the date, the topic,
          and anything to prepare beforehand. Attendance is recorded after each one.
        </EmptyPanel>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {preview ? <PreviewNotice audience="student" /> : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Attendance"
          value={`${attendance.rate}%`}
          hint={`${attendance.attended} of ${attendance.held}`}
          tone={attendance.rate >= 80 ? 'growth' : 'alert'}
        />
        <StatTile label="Sessions held" value={attendance.held} />
        <StatTile label="Upcoming" value={upcoming.length} tone="sky" />
        <StatTile
          label="Missed"
          value={record.sessions.filter((s) => s.status === 'missed').length}
          tone={record.sessions.some((s) => s.status === 'missed') ? 'alert' : 'neutral'}
        />
      </div>

      <Panel title="Upcoming" description="Dates, topics and what to prepare">
        {upcoming.length === 0 ? <EmptyState>Nothing scheduled right now.</EmptyState> : null}
        <ul className="space-y-3">
          {upcoming.map((session) => (
            <li key={session.id} className="flex items-start gap-4 rounded-card bg-mist p-4">
              <DateChip iso={session.date} tone="sky" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-bold text-deep-700">{session.topic}</p>
                  <StatusPill status={session.status} />
                </div>
                <p className="mt-1 text-xs text-deep-500">
                  {[formatLongDate(session.date), session.time, session.stage].filter(Boolean).join(' · ')}
                </p>
                {session.prepare ? (
                  <p className="mt-2 rounded-lg bg-white px-3 py-2 text-xs leading-relaxed text-deep-600">
                    {session.prepare}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Session history" description="Every session, recorded">
        {past.length === 0 ? <EmptyState>Your first session will be recorded here.</EmptyState> : null}
        <ul className="divide-y divide-deep-100">
          {past.map((session) => (
            <li key={session.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <DateChip iso={session.date} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-deep-700">
                  {session.topic}
                </p>
                <p className="mt-0.5 text-xs text-deep-500">
                  {[session.stage, session.time].filter(Boolean).join(' · ')}
                </p>
              </div>
              <StatusPill status={session.status} />
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
