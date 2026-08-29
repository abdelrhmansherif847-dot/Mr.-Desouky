import { Section, SectionHeading } from '@/components/ui/Section'
import { Badge } from '@/components/ui/Card'
import { ContactForm } from '@/components/contact/ContactForm'
import { CONTACT, whatsappLink } from '@/content/site'
import { FAQS } from '@/content/faq'
import { JsonLd, breadcrumbJsonLd, faqJsonLd, pageMeta } from '@/lib/seo'

export const metadata = pageMeta({
  title: 'Contact',
  description:
    'Ask about SAT or EST Math programs, arrange a diagnostic assessment, or get advice on which level is right — by WhatsApp, email or the contact form.',
  path: '/contact',
  keywords: ['SAT Math teacher contact', 'EST Math course registration'],
})

const STEPS = [
  { n: '01', t: 'Get in touch', d: 'WhatsApp, email or the form — whichever is easiest.' },
  { n: '02', t: 'A short conversation', d: 'Target exam, timeline, and what has been tried so far.' },
  { n: '03', t: 'Diagnostic assessment', d: 'An honest starting point, broken down by topic.' },
  { n: '04', t: 'Program & level', d: 'The recommendation follows from the result, not from a guess.' },
]

export default function ContactPage() {
  return (
    <>
      {/* ---------- Header ---------- */}
      <Section tone="paper" grid containerClassName="pb-10 pt-14 sm:pt-16 lg:pb-14 lg:pt-20">
        <Badge tone="sky">Contact</Badge>
        <SectionHeading
          as="h1"
          className="mt-5"
          title="Ask anything before you decide"
          lead="Questions about which exam, which level, timing, or how the system works are all welcome — including the ones that end with a recommendation not to sign up yet."
        />
      </Section>

      {/* ---------- Contact options + form ---------- */}
      <Section tone="mist" containerClassName="pt-10 sm:pt-12 lg:pt-14">
        <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
          {/* Direct channels */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <div className="rounded-panel border border-deep-100 bg-white p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-deep-700">Direct</h2>
                <p className="mt-2 text-sm leading-relaxed text-deep-500">
                  WhatsApp is usually the fastest way to get an answer.
                </p>

                <div className="mt-6 space-y-3">
                  <a
                    href={whatsappLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center gap-4 rounded-card border border-growth-200 bg-growth-50/60 p-4 transition-colors duration-300 hover:bg-growth-50"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-growth-500 text-white">
                      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.87 9.87 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.02h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.2 8.2 0 0 1-1.26-4.36c0-4.54 3.7-8.23 8.25-8.23a8.23 8.23 0 0 1 8.24 8.24c0 4.54-3.7 8.23-8.24 8.23z" />
                        <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.14-.14.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.38-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.2 5.08 4.49.71.3 1.26.49 1.7.63.71.23 1.36.19 1.87.12.57-.09 1.76-.72 2-1.41.25-.7.25-1.29.18-1.42-.08-.13-.28-.2-.58-.35z" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-bold text-deep-700">WhatsApp</span>
                      <span className="block truncate text-sm text-deep-500">
                        {CONTACT.whatsappDisplay}
                      </span>
                    </span>
                  </a>

                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="group flex items-center gap-4 rounded-card border border-deep-100 p-4 transition-colors duration-300 hover:bg-mist"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-deep-50 text-deep-600">
                      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                        <path
                          d="M3 7.5A2.5 2.5 0 0 1 5.5 5h13A2.5 2.5 0 0 1 21 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 16.5v-9Zm1.6-.3 6.7 5a1.2 1.2 0 0 0 1.4 0l6.7-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-sm font-bold text-deep-700">Email</span>
                      <span className="block truncate text-sm text-deep-500">{CONTACT.email}</span>
                    </span>
                  </a>
                </div>

                <h3 className="mt-8 eyebrow text-deep-400">Follow</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {CONTACT.social.map((s) => (
                    <li key={s.label}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-full border border-deep-100 px-3.5 py-1.5 text-xs font-medium text-deep-600 transition-colors duration-200 hover:border-sky-300 hover:text-sky-700"
                      >
                        {s.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              {/* What happens next */}
              <div className="mt-4 rounded-panel border border-deep-100 bg-white p-6 sm:p-8">
                <h2 className="font-display text-xl font-bold text-deep-700">What happens next</h2>
                <ol className="mt-5 space-y-4">
                  {STEPS.map((step) => (
                    <li key={step.n} className="flex gap-4">
                      <span className="font-mono text-xs font-bold text-sky-500">{step.n}</span>
                      <div>
                        <p className="font-display text-sm font-bold text-deep-700">{step.t}</p>
                        <p className="mt-0.5 text-xs leading-relaxed text-deep-500">{step.d}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-7">
            <div className="rounded-panel border border-deep-100 bg-white p-6 sm:p-8 lg:p-10">
              <h2 className="font-display text-xl font-bold text-deep-700">Send a message</h2>
              <p className="mt-2 text-sm leading-relaxed text-deep-500">
                Fields marked <span className="text-sky-500">*</span> are required.
              </p>
              <div className="mt-7">
                <ContactForm />
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* ---------- FAQ ---------- */}
      <Section tone="paper">
        <SectionHeading eyebrow="Questions" title="Answered before you ask" />
        <div className="mt-10 grid gap-3 lg:grid-cols-2">
          {FAQS.map((faq) => (
            <details
              key={faq.q}
              className="group rounded-card border border-deep-100 bg-white p-5 open:shadow-card sm:p-6"
            >
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-display text-base font-semibold text-deep-700">
                {faq.q}
                <span
                  aria-hidden="true"
                  className="mt-1 shrink-0 text-sky-500 transition-transform duration-300 ease-calm group-open:rotate-45"
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4">
                    <path d="M8 3v10M3 8h10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-deep-500">{faq.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Contact', path: '/contact' },
          ]),
          faqJsonLd(FAQS),
        ]}
      />
    </>
  )
}
