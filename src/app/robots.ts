import type { MetadataRoute } from 'next'
import { SITE } from '@/content/site'

// Static export: this metadata route must be generated at build time.
export const dynamic = 'force-static'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Portals and logins hold student data once live — never index them.
      // Paths include the sub-path so they stay correct on a project site.
      disallow: [
        `${SITE.basePath}/student/`,
        `${SITE.basePath}/parent/`,
        `${SITE.basePath}/login/`,
        `${SITE.basePath}/admin/`,
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
