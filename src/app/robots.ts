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
      // The sample preview and the account notices hold nothing private, but
      // are not landing pages either, so they stay out of search too.
      // Paths include the sub-path so they stay correct on a project site.
      disallow: [
        `${SITE.basePath}/student/`,
        `${SITE.basePath}/parent/`,
        `${SITE.basePath}/preview/`,
        `${SITE.basePath}/account/`,
        `${SITE.basePath}/login/`,
        `${SITE.basePath}/admin/`,
      ],
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  }
}
