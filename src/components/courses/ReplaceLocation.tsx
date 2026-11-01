'use client'

import { useEffect } from 'react'

/**
 * Backup for a static redirect page. The page's own meta refresh normally
 * moves the browser on before this runs; if a browser ignores meta refresh,
 * this does the same with script. `replace`, so Back does not return here.
 */
export function ReplaceLocation({ href }: { href: string }) {
  useEffect(() => {
    window.location.replace(href)
  }, [href])
  return null
}
