/**
 * Time rendering inside the Arabic, right-to-left schedule.
 *
 * Each value is isolated with <bdi> so the digits and the Arabic marker
 * ("ص" / "ظ" / "م") stay together as one token. The pair then flows in the
 * surrounding RTL direction — start on the right, end on the left — which is
 * how the range reads in Arabic.
 */

export function TimeValue({ value, className }: { value: string; className?: string }) {
  return (
    <span className={`num ${className ?? ''}`}>
      <bdi>{value}</bdi>
    </span>
  )
}

export function TimeRange({
  start,
  end,
  className,
}: {
  start: string
  end: string
  className?: string
}) {
  return (
    <span className={`num ${className ?? ''}`}>
      <bdi>{start}</bdi>
      <span aria-hidden="true"> — </span>
      <bdi>{end}</bdi>
    </span>
  )
}
