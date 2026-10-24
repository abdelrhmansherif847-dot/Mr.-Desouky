'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * The preview's version of choosing a child.
 *
 * The preview is exported as static files (GitHub Pages), so the server
 * cannot read `?child=`. Every sample child's view is rendered ahead of time
 * and this picks one in the browser. Only ever used with the invented sample
 * — the real parent portal chooses on the server, against the parent's links.
 */
export function PreviewChildSelect({
  views,
  chooser,
}: {
  views: Record<string, React.ReactNode>
  chooser: React.ReactNode
}) {
  return (
    <Suspense fallback={chooser}>
      <Select views={views} chooser={chooser} />
    </Suspense>
  )
}

function Select({ views, chooser }: { views: Record<string, React.ReactNode>; chooser: React.ReactNode }) {
  const id = useSearchParams().get('child')
  return <>{id && Object.hasOwn(views, id) ? views[id] : chooser}</>
}
