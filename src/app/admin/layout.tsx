import type { Metadata } from 'next'

/**
 * The admin area sits outside the (site) route group, so it inherits none of
 * the public header, footer or WhatsApp action — only the document shell.
 */
export const metadata: Metadata = {
  title: 'Admin',
  // Internal tools must never appear in search results.
  robots: { index: false, follow: false, nocache: true },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
