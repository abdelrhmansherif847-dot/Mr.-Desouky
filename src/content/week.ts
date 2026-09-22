/**
 * THE TEACHING WEEK
 * =================
 * The real shape of Mr. Desouky's week: which days he teaches, at exactly what
 * times, and how many sessions sit in each day. Times here are accurate and are
 * the single source of truth for every schedule surface in the portal.
 *
 * ⚠️  NO REAL STUDENT NAMES IN THIS FILE — same rule as src/content/schedule.ts,
 * and for the same reason: this repository is public, /student is served to
 * anyone who asks for it, and a static export bakes whatever is here into
 * published HTML. Groups are referred to by an anonymous, stable id.
 *
 * A group id is stable across days, so "the Saturday group A session" and "the
 * Tuesday group A session" are the same people. That is all the UI needs to
 * know. Who those people actually are belongs in the database, read through an
 * authenticated API — at which point `label` is the one field that changes and
 * nothing else in the portal moves. See docs/ADMIN.md.
 *
 * Minutes-from-midnight is the internal unit because it sorts, subtracts and
 * compares without a single date object, and 24:00 (1440) expresses "midnight
 * at the end of this day" without rolling over to the wrong day.
 */

export type WeekdayId = 'tuesday' | 'wednesday' | 'saturday'

export type WeekDay = {
  id: WeekdayId
  label: string
  /** Two letters, for the compact selector on a phone. */
  short: string
  /** JavaScript getDay(): Sunday is 0. */
  weekday: number
}

export type TeachingGroup = {
  id: string
  /** Anonymised. The real roster is not in this repository. */
  label: string
  /** How many students sit in this group. */
  size: number
}

export type WeekSlot = {
  id: string
  dayId: WeekdayId
  /** Minutes from midnight. 1440 is midnight at the end of the day. */
  start: number
  end: number
  groupId: string
}

export const WEEK_DAYS: WeekDay[] = [
  { id: 'tuesday', label: 'Tuesday', short: 'Tu', weekday: 2 },
  { id: 'wednesday', label: 'Wednesday', short: 'We', weekday: 3 },
  { id: 'saturday', label: 'Saturday', short: 'Sa', weekday: 6 },
]

export const TEACHING_GROUPS: TeachingGroup[] = [
  { id: 'a', label: 'Group A', size: 1 },
  { id: 'b', label: 'Group B', size: 3 },
  { id: 'c', label: 'Group C', size: 1 },
  { id: 'd', label: 'Group D', size: 1 },
  { id: 'e', label: 'Group E', size: 1 },
  { id: 'f', label: 'Group F', size: 1 },
]

const at = (hour: number, minute = 0) => hour * 60 + minute

/** Exactly the real timetable. Only the identities are held back. */
export const WEEK_SLOTS: WeekSlot[] = [
  // Tuesday
  { id: 'tu-1', dayId: 'tuesday', start: at(8, 30), end: at(10, 30), groupId: 'f' },
  { id: 'tu-2', dayId: 'tuesday', start: at(14, 30), end: at(16, 30), groupId: 'a' },
  { id: 'tu-3', dayId: 'tuesday', start: at(18), end: at(20), groupId: 'e' },
  { id: 'tu-4', dayId: 'tuesday', start: at(20), end: at(22), groupId: 'c' },
  { id: 'tu-5', dayId: 'tuesday', start: at(22), end: at(24), groupId: 'd' },

  // Wednesday
  { id: 'we-1', dayId: 'wednesday', start: at(16, 30), end: at(18), groupId: 'a' },
  { id: 'we-2', dayId: 'wednesday', start: at(18), end: at(20), groupId: 'b' },
  { id: 'we-3', dayId: 'wednesday', start: at(20), end: at(22), groupId: 'c' },
  { id: 'we-4', dayId: 'wednesday', start: at(22), end: at(24), groupId: 'd' },

  // Saturday
  { id: 'sa-1', dayId: 'saturday', start: at(14, 30), end: at(16, 30), groupId: 'a' },
  { id: 'sa-2', dayId: 'saturday', start: at(16, 30), end: at(18), groupId: 'e' },
  { id: 'sa-3', dayId: 'saturday', start: at(18), end: at(20), groupId: 'b' },
  { id: 'sa-4', dayId: 'saturday', start: at(20), end: at(22), groupId: 'f' },
  { id: 'sa-5', dayId: 'saturday', start: at(22), end: at(24), groupId: 'd' },
]

/**
 * Which group the signed-in student belongs to.
 *
 * A constant while the portal runs on sample data. Once records are real this
 * comes from the student's own profile, and it is the only thing that decides
 * which sessions are theirs — every other slot stays unlabelled to them.
 */
export const VIEWER_GROUP_ID = 'a'

/* ------------------------------ formatting ------------------------------ */

type Clock = { hour: number; minute: number; meridiem: 'AM' | 'PM' }

function clock(minutes: number): Clock {
  const total = minutes % 1440
  const hour24 = Math.floor(total / 60)
  const minute = total % 60
  const meridiem = hour24 < 12 ? 'AM' : 'PM'
  const hour = hour24 % 12 === 0 ? 12 : hour24 % 12
  return { hour, minute, meridiem }
}

/** "4:30" — the meridiem is printed once, by formatRange. */
export function formatTime(minutes: number): string {
  const { hour, minute } = clock(minutes)
  return `${hour}:${String(minute).padStart(2, '0')}`
}

export function meridiem(minutes: number): 'AM' | 'PM' {
  return clock(minutes).meridiem
}

/**
 * "4:30 – 6:00 PM", or "10:00 PM – 12:00 AM" when the session crosses over.
 * The meridiem is repeated only when it actually changes, which is how a
 * timetable is read aloud.
 */
export function formatRange(start: number, end: number): string {
  const from = meridiem(start)
  const to = meridiem(end)
  return from === to
    ? `${formatTime(start)} – ${formatTime(end)} ${to}`
    : `${formatTime(start)} ${from} – ${formatTime(end)} ${to}`
}

/** "1h 30m" / "2h" — session length, for the card's quiet second line. */
export function formatDuration(start: number, end: number): string {
  const total = end - start
  const hours = Math.floor(total / 60)
  const minutes = total % 60
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`
}

/* -------------------------------- lookups ------------------------------- */

export function slotsForDay(dayId: WeekdayId): WeekSlot[] {
  return WEEK_SLOTS.filter((slot) => slot.dayId === dayId).sort((a, b) => a.start - b.start)
}

export function groupOf(slot: WeekSlot): TeachingGroup | undefined {
  return TEACHING_GROUPS.find((group) => group.id === slot.groupId)
}

export function isMine(slot: WeekSlot, viewerGroupId: string = VIEWER_GROUP_ID): boolean {
  return slot.groupId === viewerGroupId
}

export function dayById(id: WeekdayId): WeekDay {
  return WEEK_DAYS.find((day) => day.id === id) ?? WEEK_DAYS[0]
}

/** The day a Date falls on, if it is a teaching day. */
export function dayForDate(date: Date): WeekDay | undefined {
  return WEEK_DAYS.find((day) => day.weekday === date.getDay())
}

export type UpcomingSlot = {
  slot: WeekSlot
  day: WeekDay
  /** Whole minutes from now until it starts. Never negative. */
  minutesUntil: number
  /** True when now is inside the session. */
  live: boolean
  /** 0 = today, 1 = tomorrow, and so on. */
  daysAhead: number
}

/**
 * The student's next session, searching forward from `now` across the week and
 * wrapping into the following one. Returns the session in progress if there is
 * one, because "what do I have right now" is the more useful answer.
 *
 * Pure, and takes `now` as an argument — the caller decides when "now" is, so
 * this can be tested at any instant and never disagrees between server and
 * client render.
 */
export function nextSessionFor(
  now: Date,
  viewerGroupId: string = VIEWER_GROUP_ID,
): UpcomingSlot | null {
  const mine = WEEK_SLOTS.filter((slot) => isMine(slot, viewerGroupId))
  if (mine.length === 0) return null

  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  // Look across today and the next seven days, so a wrap into next week is
  // just another step rather than a special case.
  for (let daysAhead = 0; daysAhead <= 7; daysAhead += 1) {
    const weekday = (now.getDay() + daysAhead) % 7
    const day = WEEK_DAYS.find((d) => d.weekday === weekday)
    if (!day) continue

    for (const slot of slotsForDay(day.id).filter((s) => isMine(s, viewerGroupId))) {
      if (daysAhead === 0) {
        if (nowMinutes >= slot.start && nowMinutes < slot.end) {
          return { slot, day, minutesUntil: 0, live: true, daysAhead }
        }
        if (slot.start <= nowMinutes) continue
        return { slot, day, minutesUntil: slot.start - nowMinutes, live: false, daysAhead }
      }
      return {
        slot,
        day,
        minutesUntil: daysAhead * 1440 - nowMinutes + slot.start,
        live: false,
        daysAhead,
      }
    }
  }
  return null
}

/** "in 35 minutes" / "in 3 hours" / "tomorrow" / "in 4 days". */
export function formatCountdown(upcoming: UpcomingSlot): string {
  if (upcoming.live) return 'Happening now'
  const { minutesUntil, daysAhead } = upcoming
  if (minutesUntil < 60) return `in ${minutesUntil} minute${minutesUntil === 1 ? '' : 's'}`
  if (daysAhead === 0) {
    const hours = Math.round(minutesUntil / 60)
    return `in ${hours} hour${hours === 1 ? '' : 's'}`
  }
  if (daysAhead === 1) return 'tomorrow'
  return `in ${daysAhead} days`
}
