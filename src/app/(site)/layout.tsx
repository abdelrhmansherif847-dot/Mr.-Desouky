import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { WhatsAppButton } from '@/components/layout/WhatsAppButton'
import { PageTransition } from '@/components/motion/PageTransition'

/**
 * Chrome for the public website: header, footer and the floating WhatsApp
 * action.
 *
 * This lives in a route group so the internal admin area can render its own
 * chrome instead of inheriting the marketing navigation. Route groups do not
 * appear in URLs — every page below still lives at the same path it did.
 */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <SiteHeader />
      <PageTransition id="main" className="flex-1">
        {children}
      </PageTransition>
      <SiteFooter />
      <WhatsAppButton />
    </>
  )
}
