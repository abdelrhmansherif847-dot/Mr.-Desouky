import { Reveal } from '@/components/motion/Reveal'
import { SCHEDULE_RULES, SCHEDULE_UPDATES } from '@/content/schedule'
import { cn } from '@/lib/utils'

/**
 * Legend and notes.
 *
 * The notes divide into two genuinely different things, so they are shown as
 * two things: standing rules that always apply, and recent changes that stop
 * anyone working from an old copy of the timetable.
 */

function Swatch({ kind }: { kind: 'lesson' | 'break' | 'open' | 'additional' }) {
  const styles = {
    lesson: 'bg-white border-deep-100 border-s-[3px] border-s-sky-400 shadow-card',
    break: 'bg-mist/70 border-deep-100/70 border-s-[3px] border-s-deep-200',
    open: 'bg-sky-50/40 border-dashed border-sky-200 border-s-[3px] border-s-sky-200',
    additional: 'bg-white border-deep-100 border-s-[3px] border-s-olive-400 shadow-card',
  }
  return <span aria-hidden="true" className={cn('block h-8 w-10 shrink-0 rounded-md border', styles[kind])} />
}

const LEGEND = [
  { kind: 'lesson' as const, title: 'محاضرة', body: 'حصة بمجموعة طلاب، مدتها ساعتان.' },
  { kind: 'additional' as const, title: 'معاد إضافي', body: 'حصة مضافة خارج الجدول المعتاد.' },
  { kind: 'break' as const, title: 'بريك', body: 'راحة ساعة كاملة بين الحصص.' },
  { kind: 'open' as const, title: 'وقت مفتوح', body: 'وقت متاح للحجز بالتنسيق المسبق.' },
]

function NotePanel({
  title,
  eyebrow,
  notes,
  tone,
  icon,
}: {
  title: string
  eyebrow: string
  notes: { text: string }[]
  tone: 'deep' | 'olive'
  icon: 'rule' | 'update'
}) {
  const paths = {
    rule: 'M4 4.5h8M4 8h8M4 11.5h5',
    update: 'M13 8A5 5 0 1 1 8 3m0 0 2.5-1.5M8 3l2.2 1.9',
  }

  return (
    <div className="rounded-panel border border-deep-100 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg',
            tone === 'deep' ? 'bg-deep-50 text-deep-600' : 'bg-olive-50 text-olive-600',
          )}
        >
          <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4">
            <path
              d={paths[icon]}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div>
          <p
            className={cn(
              'font-mono text-[0.58rem] font-semibold uppercase tracking-[0.14em]',
              tone === 'deep' ? 'text-deep-400' : 'text-olive-600',
            )}
          >
            {eyebrow}
          </p>
          <h3 className="text-base font-bold text-deep-700">{title}</h3>
        </div>
      </div>

      <ul className="mt-5 space-y-3">
        {notes.map((note) => (
          <li key={note.text} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={cn(
                'mt-2 h-1.5 w-1.5 shrink-0 rounded-full',
                tone === 'deep' ? 'bg-sky-400' : 'bg-olive-400',
              )}
            />
            <span className="text-[0.95rem] leading-relaxed text-deep-600">{note.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function ScheduleLegend() {
  return (
    <div dir="rtl" lang="ar">
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LEGEND.map((item, i) => (
          <Reveal
            as="li"
            key={item.kind}
            index={i}
            variant="up"
            className="flex items-start gap-3 rounded-card border border-deep-100 bg-white p-4"
          >
            <Swatch kind={item.kind} />
            <div className="min-w-0">
              <p className="text-sm font-bold text-deep-700">{item.title}</p>
              <p className="mt-1 text-xs leading-relaxed text-deep-500">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

export function ScheduleNotes() {
  return (
    <div dir="rtl" lang="ar" className="grid gap-4 lg:grid-cols-2">
      <Reveal variant="up">
        <NotePanel
          eyebrow="قواعد ثابتة"
          title="ملاحظات الجدول"
          notes={SCHEDULE_RULES}
          tone="deep"
          icon="rule"
        />
      </Reveal>
      <Reveal variant="up" delay={90}>
        <NotePanel
          eyebrow="آخر التعديلات"
          title="تحديثات على المواعيد"
          notes={SCHEDULE_UPDATES}
          tone="olive"
          icon="update"
        />
      </Reveal>
    </div>
  )
}
