import type { MetadataRoute } from 'next'
import { PROGRAMS } from '@/content/programs'
import { SITE } from '@/content/site'

/**
 * Public pages only. The portals are behind `robots: noindex` and are
 * deliberately excluded — they will hold student data once they are live.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1, changeFrequency: 'monthly' },
    { path: '/programs', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/method', priority: 0.8, changeFrequency: 'yearly' },
    { path: '/journey', priority: 0.8, changeFrequency: 'yearly' },
    { path: '/how-it-works', priority: 0.8, changeFrequency: 'yearly' },
    { path: '/about', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/mentoring', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/resources', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/contact', priority: 0.7, changeFrequency: 'yearly' },
  ]

  return [
    ...pages.map((page) => ({
      url: `${SITE.url}${page.path}`,
      lastModified: now,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...PROGRAMS.map((program) => ({
      url: `${SITE.url}/programs/${program.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.85,
    })),
  ]
}
