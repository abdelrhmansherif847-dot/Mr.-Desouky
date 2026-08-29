import { Section, SectionHeading } from '@/components/ui/Section'
import { CtaBand } from '@/components/sections/CtaBand'
import { Badge } from '@/components/ui/Card'
import { Reveal } from '@/components/motion/Reveal'
import { WeeklySchedule } from '@/components/schedule/WeeklySchedule'
import { ScheduleLegend, ScheduleNotes } from '@/components/schedule/ScheduleNotes'
import {
  SCHEDULE_DAYS,
  SCHEDULE_RANGE,
  studentGroups,
  weeklyLessonCount,
} from '@/content/schedule'
import { JsonLd, breadcrumbJsonLd, pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Weekly Schedule',
  description:
    'The weekly teaching timetable — lesson times, groups, breaks and open slots across Sunday, Tuesday, Wednesday and Saturday.',
  path: '/schedule',
  keywords: ['SAT Math lesson times', 'EST Math schedule', 'Math tutoring timetable Egypt'],
})

export default function SchedulePage() {
  const lessons = weeklyLessonCount()
  const groups = studentGroups().length

  const facts = [
    { label: 'Teaching days', value: `${SCHEDULE_DAYS.length}`, note: 'Sun · Tue · Wed · Sat' },
    { label: 'Sessions a week', value: `${lessons}`, note: 'Two hours each' },
    { label: 'Student groups', value: `${groups}`, note: 'Across the week' },
    { label: 'Daily window', value: '10—11', note: `${SCHEDULE_RANGE.first} → ${SCHEDULE_RANGE.last}` },
  ]

  return (
    <>
      {/* ---------- Header ---------- */}
      <Section tone="paper" grid containerClassName="pb-10 pt-14 sm:pt-16 lg:pb-12 lg:pt-20">
        <Badge tone="sky">Weekly schedule</Badge>
        <SectionHeading
          as="h1"
          className="mt-5"
          title="The teaching week, at a glance"
          lead="Every session, break and open slot across the four teaching days. Times are shown exactly as they run — a two-hour session reads twice as tall as a one-hour break, so the shape of each day is visible before you read a word."
        />

        {/* Arabic title for the schedule itself — this is the primary label */}
        <Reveal variant="up" delay={80} className="mt-8">
          <div dir="rtl" lang="ar" className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-2xl font-bold text-deep-700 sm:text-3xl">جدول المواعيد الأسبوعي</h2>
            <p className="text-sm text-deep-400">م. عبدالرحمن دسوقي</p>
          </div>
        </Reveal>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-deep-100 bg-deep-100 lg:grid-cols-4">
          {facts.map((fact, i) => (
            <Reveal key={fact.label} index={i} variant="scale" className="bg-white p-4 sm:p-5">
              <dt className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-deep-300">
                {fact.label}
              </dt>
              <dd className="mt-1.5 font-display text-2xl font-bold tabular-nums text-deep-700">
                {fact.value}
              </dd>
              <dd className="mt-1 text-xs text-deep-400">{fact.note}</dd>
            </Reveal>
          ))}
        </dl>
      </Section>

      {/* ---------- The schedule ---------- */}
      <Section tone="mist" containerClassName="py-10 sm:py-12 lg:py-14">
        <WeeklySchedule />
      </Section>

      {/* ---------- Legend ---------- */}
      <Section tone="paper" containerClassName="py-12 sm:py-14">
        <SectionHeading
          eyebrow="Reading the schedule"
          title="Four kinds of slot"
          lead="Session types are told apart by weight and surface first, with colour only reinforcing it — so the timetable stays readable in a glance, in print, and for anyone who does not distinguish colours easily."
        />
        <div className="mt-10">
          <ScheduleLegend />
        </div>
      </Section>

      {/* ---------- Notes ---------- */}
      <Section tone="mist" containerClassName="py-12 sm:py-14">
        <SectionHeading eyebrow="Before you attend" title="Notes and recent changes" />
        <div className="mt-10">
          <ScheduleNotes />
        </div>
      </Section>

      <CtaBand
        eyebrow="Booking"
        title="Need a different time?"
        body="Open slots can be booked, and existing times can be moved with enough notice. Message on WhatsApp and it will be arranged."
        primary={{ label: 'Contact Mr. Desouky', href: '/contact' }}
        whatsapp
      />

      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Home', path: '/' },
          { name: 'Weekly Schedule', path: '/schedule' },
        ])}
      />
    </>
  )
}
