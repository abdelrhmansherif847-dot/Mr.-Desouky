import { PreviewNotice } from '@/components/portal/PreviewNotice'
import { Panel, StatTile, StatusPill, DateChip } from '@/components/portal/widgets'
import { attendanceRate, getStudentRecord } from '@/lib/portal/data'
import { formatLongDate } from '@/lib/utils'

export default async function StudentSessionsPage() {
  const record = await getStudentRecord()
  const attendance = attendanceRate(record)
  const upcoming = record.sessions.filter((s) => s.status === 'upcoming')
  const past = record.sessions.filter((s) => s.status !== 'upcoming').reverse()

  return (
    <div className="space-y-5">
      <PreviewNotice audience="student" />

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
        <ul className="space-y-3">
          {upcoming.map((session) => (
            <li key={session.id} className="flex items-start gap-4 rounded-card bg-mist p-4">
              <DateChip iso={session.date} tone="sky" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-bold text-deep-700">{session.topic}</p>
                  <StatusPill status={session.status} />
                </div>
                <p className="mt-1 text-xs text-deep-400">
                  {formatLongDate(session.date)} · {session.time} · {session.stage}
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
        <ul className="divide-y divide-deep-100">
          {past.map((session) => (
            <li key={session.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <DateChip iso={session.date} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-semibold text-deep-700">
                  {session.topic}
                </p>
                <p className="mt-0.5 text-xs text-deep-400">
                  {session.stage} · {session.time}
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
