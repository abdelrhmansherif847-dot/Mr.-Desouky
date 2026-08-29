/**
 * WEEKLY TEACHING SCHEDULE
 * =======================
 * The single source of truth for the schedule. Every component reads from
 * here — nothing about days, times, names or session types is hardcoded in
 * the UI, so updating the timetable means editing this file and nothing else.
 *
 * The content is Arabic and the schedule renders right-to-left. English day
 * names are carried alongside for scanning, not for translation.
 */

export type SessionKind =
  /** A teaching session with a named group. The primary element. */
  | 'lesson'
  /** A full-hour break between sessions. Deliberately quiet. */
  | 'break'
  /** Unbooked and available. Calm, not attention-seeking. */
  | 'open'
  /** A long stretch with no teaching — Tuesday morning. */
  | 'clear'

export type TimeSlot = {
  id: string
  /** Arabic start and end, exactly as they appear on the printed timetable. */
  start: string
  end: string
  /** Minutes — drives the proportional height of the desktop timeline. */
  minutes: number
  /** 24h start, used only to work out which slot is running right now. */
  startHour: number
  endHour: number
}

export type Session = {
  slotId: string
  kind: SessionKind
  /** The student group, e.g. "يوسف + صحابه". Absent for breaks and open time. */
  group?: string
  /** Marks a session added on top of the usual week. */
  additional?: boolean
  /** Shown inside the card, e.g. the explanation on Tuesday morning. */
  note?: string
  /** Number of consecutive slots this session covers. Defaults to 1. */
  span?: number
}

export type ScheduleDay = {
  id: string
  /** Arabic name — the primary label. */
  name: string
  /** English name, shown small beneath for quick scanning. */
  english: string
  /** JS day index (0 = Sunday), used to mark today. */
  weekday: number
  sessions: Session[]
}

/* ------------------------------- time rail ------------------------------ */

export const TIME_SLOTS: TimeSlot[] = [
  { id: 't1', start: '10:00 ص', end: '12:00 ظ', minutes: 120, startHour: 10, endHour: 12 },
  { id: 't2', start: '12:00 ظ', end: '1:00 م', minutes: 60, startHour: 12, endHour: 13 },
  { id: 't3', start: '1:00 م', end: '3:00 م', minutes: 120, startHour: 13, endHour: 15 },
  { id: 't4', start: '3:00 م', end: '4:00 م', minutes: 60, startHour: 15, endHour: 16 },
  { id: 't5', start: '4:00 م', end: '6:00 م', minutes: 120, startHour: 16, endHour: 18 },
  { id: 't6', start: '6:00 م', end: '7:00 م', minutes: 60, startHour: 18, endHour: 19 },
  { id: 't7', start: '7:00 م', end: '9:00 م', minutes: 120, startHour: 19, endHour: 21 },
  { id: 't8', start: '9:00 م', end: '11:00 م', minutes: 120, startHour: 21, endHour: 23 },
]

/* --------------------------------- days --------------------------------- */

export const SCHEDULE_DAYS: ScheduleDay[] = [
  {
    id: 'sunday',
    name: 'الأحد',
    english: 'Sunday',
    weekday: 0,
    sessions: [
      { slotId: 't1', kind: 'lesson', group: 'يوسف + صحابه' },
      { slotId: 't2', kind: 'break' },
      { slotId: 't3', kind: 'lesson', group: 'مصطفى' },
      { slotId: 't4', kind: 'break' },
      { slotId: 't5', kind: 'lesson', group: 'ريم + ياسين + رويا' },
      { slotId: 't6', kind: 'break' },
      { slotId: 't7', kind: 'open' },
      { slotId: 't8', kind: 'lesson', group: 'رقية + زينب + أسماء' },
    ],
  },
  {
    id: 'tuesday',
    name: 'الثلاثاء',
    english: 'Tuesday',
    weekday: 2,
    sessions: [
      // One block across the whole morning — a lighter day by design.
      {
        slotId: 't1',
        kind: 'clear',
        span: 4,
        note: 'أول محاضرة الساعة 4:00 م',
      },
      { slotId: 't5', kind: 'lesson', group: 'أحمد + أسر' },
      { slotId: 't6', kind: 'break' },
      { slotId: 't7', kind: 'open' },
      { slotId: 't8', kind: 'open' },
    ],
  },
  {
    id: 'wednesday',
    name: 'الأربعاء',
    english: 'Wednesday',
    weekday: 3,
    sessions: [
      { slotId: 't1', kind: 'lesson', group: 'يوسف + صحابه' },
      { slotId: 't2', kind: 'break' },
      { slotId: 't3', kind: 'lesson', group: 'مصطفى' },
      { slotId: 't4', kind: 'break' },
      { slotId: 't5', kind: 'lesson', group: 'أحمد + أسر' },
      { slotId: 't6', kind: 'break' },
      { slotId: 't7', kind: 'lesson', group: 'أحمد + أسر', additional: true },
      { slotId: 't8', kind: 'lesson', group: 'رقية + زينب + أسماء' },
    ],
  },
  {
    id: 'saturday',
    name: 'السبت',
    english: 'Saturday',
    weekday: 6,
    sessions: [
      { slotId: 't1', kind: 'lesson', group: 'يوسف + صحابه' },
      { slotId: 't2', kind: 'break' },
      { slotId: 't3', kind: 'lesson', group: 'مصطفى' },
      { slotId: 't4', kind: 'break' },
      { slotId: 't5', kind: 'lesson', group: 'أحمد + أسر' },
      { slotId: 't6', kind: 'break' },
      { slotId: 't7', kind: 'lesson', group: 'أحمد + أسر' },
      { slotId: 't8', kind: 'lesson', group: 'رقية + زينب + أسماء' },
    ],
  },
]

/* -------------------------------- labels -------------------------------- */

/** Arabic wording for each session type, used in cards and the legend. */
export const KIND_LABELS: Record<SessionKind, { title: string; legend: string }> = {
  lesson: { title: 'محاضرة', legend: 'محاضرة' },
  break: { title: 'بريك', legend: 'بريك' },
  open: { title: 'وقت مفتوح', legend: 'وقت مفتوح' },
  clear: { title: 'لا توجد محاضرات', legend: 'يوم أخف' },
}

export const ADDITIONAL_LABEL = 'معاد إضافي'

/* --------------------------------- notes -------------------------------- */

export type ScheduleNote = { text: string }

/** Standing rules — these do not change week to week. */
export const SCHEDULE_RULES: ScheduleNote[] = [
  { text: 'مدة كل حصة ساعتين، والبريك ساعة كاملة.' },
  { text: 'يفضل الحضور قبل الموعد بـ 10 دقائق.' },
  { text: 'يمكن تعديل وقت عند الحاجة بالتنسيق المسبق.' },
]

/** Recent changes to the timetable, so nobody works from an old copy. */
export const SCHEDULE_UPDATES: ScheduleNote[] = [
  { text: 'تم إضافة معاد إضافي لأحمد + أسر يوم الأربعاء.' },
  { text: 'تم شيل رقية + زينب + أسماء من يوم الثلاثاء.' },
  { text: 'تم شيل ريم + ياسين + رويا من يوم الأربعاء.' },
]

/* -------------------------------- helpers ------------------------------- */

export function getSlot(id: string): TimeSlot | undefined {
  return TIME_SLOTS.find((s) => s.id === id)
}

export function slotIndex(id: string): number {
  return TIME_SLOTS.findIndex((s) => s.id === id)
}

/** Total teaching hours in the week, derived rather than written down. */
export function weeklyLessonCount(): number {
  return SCHEDULE_DAYS.reduce(
    (total, day) => total + day.sessions.filter((s) => s.kind === 'lesson').length,
    0,
  )
}

/** Distinct student groups across the week, in the order they first appear. */
export function studentGroups(): string[] {
  const seen: string[] = []
  for (const day of SCHEDULE_DAYS) {
    for (const session of day.sessions) {
      if (session.group && !seen.includes(session.group)) seen.push(session.group)
    }
  }
  return seen
}

export const SCHEDULE_RANGE = { first: TIME_SLOTS[0].start, last: TIME_SLOTS[TIME_SLOTS.length - 1].end }
