import { CONTACT } from '@/content/site'
import { createRateLimiter, handleContact } from '@/lib/contact/server'
import { validateEnquiry } from '@/lib/contact/validate'

/**
 * POST /api/contact/ — the contact form's delivery on Vercel. The logic and
 * its safeguards are in lib/contact/server.ts; this only wires in the real
 * validation, fetch, limiter and server-only configuration.
 *
 * Server-only environment (Vercel → Settings → Environment Variables):
 *   RESEND_API_KEY      Sensitive. Sending access only.
 *   CONTACT_FROM_EMAIL  An address on a domain verified in that Resend account.
 *   CONTACT_TO_EMAIL    Optional. Defaults to CONTACT.email.
 *
 * Not part of the static GitHub Pages build: the workflow removes src/app/api
 * along with the other server routes.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Five enquiries per address per ten minutes, per server instance.
const limiter = createRateLimiter(5, 10 * 60 * 1000)

export async function POST(request: Request) {
  return handleContact(request, {
    config: {
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.CONTACT_FROM_EMAIL,
      to: process.env.CONTACT_TO_EMAIL || CONTACT.email,
      apiUrl: process.env.RESEND_API_URL,
    },
    validate: validateEnquiry,
    fetch,
    limiter,
  })
}
