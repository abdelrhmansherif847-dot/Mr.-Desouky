import type { Metadata, Viewport } from 'next'
import { IBM_Plex_Mono, IBM_Plex_Sans_Arabic, Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { SITE } from '@/content/site'
import { JsonLd, organizationJsonLd, personJsonLd } from '@/lib/seo'
import './globals.css'

const display = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display',
  display: 'swap',
})

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
  display: 'swap',
})

/**
 * Arabic is set in IBM Plex Sans Arabic — the same type family as the mono
 * face already in the system, so the schedule reads as part of the brand
 * rather than as a second voice bolted on.
 */
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
})

const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.role}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  creator: SITE.name,
  keywords: [
    'SAT Math',
    'SAT Math Egypt',
    'SAT Math teacher',
    'SAT Math course',
    'EST Math',
    'EST Math Egypt',
    'EST Math teacher',
    'EST Math course',
    'SAT Math basics',
    'SAT Math advanced',
  ],
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.description,
    url: SITE.url,
    locale: 'en_US',
    images: [{ url: `${SITE.url}/brand/og-image.svg`, width: 1200, height: 630, alt: SITE.name }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE.name} — ${SITE.role}`,
    description: SITE.description,
    images: [`${SITE.url}/brand/og-image.svg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    // Prefixed explicitly: metadata icon paths are not rewritten by basePath.
    icon: [{ url: `${SITE.basePath}/icon.svg`, type: 'image/svg+xml' }],
    apple: `${SITE.basePath}/icon.svg`,
  },
}

export const viewport: Viewport = {
  themeColor: '#123B5D',
  width: 'device-width',
  initialScale: 1,
  colorScheme: 'light',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang={SITE.locale}
      className={`${display.variable} ${body.variable} ${mono.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        {/*
          Scroll-revealed sections start hidden and are shown by JavaScript.
          Without it they would never appear, so this guarantees the content
          is visible to anyone browsing without scripts.
        */}
        <noscript>
          <style>{`[data-reveal]{opacity:1!important;transform:none!important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">
        {children}
        <JsonLd data={[organizationJsonLd(), personJsonLd()]} />
      </body>
    </html>
  )
}
