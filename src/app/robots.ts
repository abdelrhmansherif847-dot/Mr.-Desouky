import type { MetadataRoute } from 'next'
import { SITE } from '@/content/site'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Portals and logins hold student data once live — never index them.
      disallow: ['/student', '/student/', '/parent', '/parent/', '/login/'],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
