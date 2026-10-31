import type { Metadata } from 'next'
import { CONTACT, SITE } from '@/content/site'

// Social crawlers need a fully-qualified URL, and a root-relative path would
// lose the project sub-path when resolved against metadataBase.
const OG_IMAGE = `${SITE.url}/brand/og-image.svg`

type PageMetaInput = {
  title: string
  description: string
  path: string
  /** Extra keywords — keep natural, never stuff. */
  keywords?: string[]
}

export function pageMeta({ title, description, path, keywords }: PageMetaInput): Metadata {
  const url = `${SITE.url}${path}`

  return {
    title,
    description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} · ${SITE.name}`,
      description,
      url,
      siteName: SITE.name,
      locale: 'en_US',
      type: 'website',
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: SITE.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${SITE.name}`,
      description,
      images: [OG_IMAGE],
    },
  }
}

/**
 * Structured data. Person + EducationalOrganization is the honest pairing here:
 * a named instructor running a structured program, not an accredited school.
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    '@id': `${SITE.url}#organization`,
    name: SITE.name,
    alternateName: SITE.shortName,
    description: SITE.description,
    url: SITE.url,
    slogan: SITE.slogan,
    email: CONTACT.email,
    areaServed: SITE.area,
    sameAs: CONTACT.social.map((s) => s.href),
    founder: { '@id': `${SITE.url}#person` },
  }
}

export function personJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE.url}#person`,
    name: SITE.name,
    alternateName: SITE.shortName,
    jobTitle: SITE.role,
    description: `${SITE.role} teaching a structured SAT, EST and ACT Math preparation system.`,
    url: SITE.url,
    knowsAbout: ['SAT Math', 'EST Math', 'ACT Math', 'Mathematics education', 'Exam preparation'],
    sameAs: CONTACT.social.map((s) => s.href),
  }
}

/**
 * One course. Built from the curriculum model: its official lesson titles
 * become the syllabus sections. No price and no exam facts are included.
 */
export function courseJsonLd(course: {
  title: string
  description: string
  slug: string
  grade: string
  /** The test the course prepares for, e.g. "EST I". */
  target: string
  lessons: string[]
  prerequisite?: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: course.title,
    description: course.description,
    url: `${SITE.url}/programs/${course.slug}`,
    educationalLevel: course.grade,
    teaches: `${course.target} Math preparation`,
    inLanguage: 'en',
    ...(course.prerequisite ? { coursePrerequisites: course.prerequisite } : {}),
    syllabusSections: course.lessons.map((name) => ({ '@type': 'Syllabus', name })),
    provider: {
      '@type': 'EducationalOrganization',
      name: SITE.name,
      url: SITE.url,
    },
  }
}

export function faqJsonLd(faqs: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE.url}${item.path}`,
    })),
  }
}

/** Renders a JSON-LD block. Content is our own static data, never user input. */
export function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
