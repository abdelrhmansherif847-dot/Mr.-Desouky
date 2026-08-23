/**
 * Single source of truth for brand constants, navigation and contact details.
 *
 * ⚠️  BEFORE LAUNCH — confirm every value marked `TODO:` below with
 *     Eng. Abdelrhman Desouky. They are working placeholders, not facts.
 */

export const SITE = {
  name: 'Eng. Abdelrhman Desouky',
  shortName: 'Mr. Desouky',
  role: 'SAT & EST Math Instructor',
  slogan: 'Try. Learn. Rise.',
  description:
    'A structured SAT and EST Math learning system built on clear teaching, consistent practice, honest measurement and real feedback — so every student knows where they stand and what comes next.',
  /** TODO: replace with the live domain before launch. */
  url: 'https://desoukymath.com',
  locale: 'en',
  /** TODO: confirm — used for local SEO and structured data. */
  area: 'Egypt',
} as const

/** Brand asset paths. See public/brand/README.md before changing these. */
export const LOGO = {
  color: '/brand/logo-color.svg',
  mono: '/brand/logo-mono.svg',
  /** True once the approved logo has replaced the shipped placeholder. */
  isPlaceholder: true,
} as const

export const PORTRAIT = {
  src: '/brand/portrait.svg',
  alt: 'Eng. Abdelrhman Desouky, SAT & EST Math instructor',
  isPlaceholder: true,
} as const

/**
 * TODO: confirm all contact details.
 * `whatsapp` must be digits only, in full international format, no "+".
 */
export const CONTACT = {
  whatsapp: '201000000000',
  whatsappDisplay: '+20 100 000 0000',
  email: 'info@desoukymath.com',
  social: [
    { label: 'Facebook', href: 'https://facebook.com/', handle: '@desoukymath' },
    { label: 'Instagram', href: 'https://instagram.com/', handle: '@desoukymath' },
    { label: 'YouTube', href: 'https://youtube.com/', handle: '@desoukymath' },
    { label: 'TikTok', href: 'https://tiktok.com/', handle: '@desoukymath' },
  ],
} as const

/** Pre-filled WhatsApp deep link. */
export function whatsappLink(message?: string): string {
  const base = `https://wa.me/${CONTACT.whatsapp}`
  const text =
    message ??
    'Hello Mr. Desouky, I would like to ask about the SAT / EST Math programs.'
  return `${base}?text=${encodeURIComponent(text)}`
}

export type NavItem = {
  label: string
  href: string
  description?: string
  children?: { label: string; href: string; description?: string }[]
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'Programs',
    href: '/programs',
    description: 'SAT and EST Math, at Basic and Advanced level.',
    children: [
      { label: 'All programs', href: '/programs', description: 'Compare every track side by side' },
      { label: 'SAT Math — Basic', href: '/programs/sat-math-basic', description: 'Build the foundation' },
      { label: 'SAT Math — Advanced', href: '/programs/sat-math-advanced', description: 'Raise the ceiling' },
      { label: 'EST Math — Basic', href: '/programs/est-math-basic', description: 'Build the foundation' },
      { label: 'EST Math — Advanced', href: '/programs/est-math-advanced', description: 'Raise the ceiling' },
    ],
  },
  { label: 'The Desouky Method', href: '/method', description: 'READ · ANALYZE · PLAN · SOLVE · CHECK' },
  { label: 'Student Journey', href: '/journey', description: 'Seven stages from assessment to exam day' },
  { label: 'About', href: '/about', description: 'The person, the philosophy, the principles' },
  { label: 'Resources', href: '/resources', description: 'Practice sheets, workbooks, guides and videos' },
]

/** Secondary links that live in the footer but not the main navigation. */
export const SECONDARY_NAV: NavItem[] = [
  { label: 'How It Works', href: '/how-it-works' },
  { label: 'Mentoring & Advising', href: '/mentoring' },
  { label: 'Contact', href: '/contact' },
]

export const PORTAL_NAV = [
  { label: 'Student Login', href: '/login/student' },
  { label: 'Parent Login', href: '/login/parent' },
] as const
