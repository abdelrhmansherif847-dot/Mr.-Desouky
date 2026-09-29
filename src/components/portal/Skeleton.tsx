/**
 * Loading placeholders in the shape of the page that is coming, so the
 * layout does not jump when records arrive. A gentle pulse, switched off
 * under reduced motion. Announced once to screen readers.
 */
function Block({ className }: { className: string }) {
  return <div className={`rounded-lg bg-deep-100/70 motion-safe:animate-pulse ${className}`} />
}

export function PortalSkeleton({ label = 'Loading your records' }: { label?: string }) {
  return (
    <div role="status" aria-live="polite" className="space-y-5">
      <span className="sr-only">{label}…</span>
      <div className="grid overflow-hidden rounded-panel border border-deep-100 bg-white md:grid-cols-2" aria-hidden="true">
        <div className="space-y-3 p-6">
          <Block className="h-3 w-20" />
          <Block className="h-6 w-3/4" />
          <Block className="h-4 w-2/3" />
        </div>
        <div className="space-y-3 border-t border-deep-100 bg-mist/60 p-6 md:border-l md:border-t-0">
          <Block className="h-3 w-24" />
          <Block className="h-5 w-2/3" />
          <Block className="h-10 w-full" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-3 rounded-card border border-deep-100 bg-white p-5">
            <Block className="h-3 w-16" />
            <Block className="h-7 w-20" />
          </div>
        ))}
      </div>
      <div className="grid gap-5 lg:grid-cols-2" aria-hidden="true">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-4 rounded-panel border border-deep-100 bg-white p-6">
            <Block className="h-4 w-32" />
            <Block className="h-12 w-full" />
            <Block className="h-12 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}
