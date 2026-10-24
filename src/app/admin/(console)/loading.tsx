import { PortalSkeleton } from '@/components/portal/Skeleton'

/** Shown while the console loads — the admin frame renders with each page. */
export default function Loading() {
  return (
    <div className="min-h-dvh bg-mist">
      <div className="h-[6.5rem] bg-deep-800" aria-hidden="true" />
      <div className="container-page py-10">
        <PortalSkeleton label="Loading" />
      </div>
    </div>
  )
}
