import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { Section } from '@/components/ui/Section'
import { ArrowRight, ButtonLink } from '@/components/ui/Button'
import { ReplaceLocation } from '@/components/courses/ReplaceLocation'
import { COURSES, getCourse } from '@/content/curriculum'
import { SITE } from '@/content/site'
import { curriculumPath } from '@/lib/courses/present'

/**
 * /programs/<course>/lessons/ has no page of its own. A course's lessons are
 * listed in the curriculum section of its course page, so this address sends
 * visitors there, permanently: the course slugs are stable and so is where
 * their lessons are listed. An unknown course gets the normal 404 page.
 *
 * Server build (Vercel): a real HTTP 308 to /programs/<course>/#curriculum.
 *
 * Static export (GitHub Pages): a host of plain files cannot send a redirect,
 * and Next.js would only redirect there once its script has run. So the
 * export gets a page that redirects on its own instead: an immediate meta
 * refresh (works without script), a script fallback, and a visible link. It
 * is kept out of search. Unknown courses have no file, so Pages serves 404.html.
 */
const IS_STATIC_EXPORT = process.env.NEXT_PUBLIC_STATIC_EXPORT === 'true'

type Params = Promise<{ slug: string }>

export function generateStaticParams() {
  return COURSES.map((course) => ({ slug: course.slug }))
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const course = getCourse((await params).slug)
  if (!course) return {}
  return {
    title: `${course.title} lessons`,
    description: `Every lesson of ${course.title} is listed in the curriculum on its course page.`,
    robots: { index: false, follow: true },
  }
}

export default async function LessonsIndex({ params }: { params: Params }) {
  const course = getCourse((await params).slug)
  if (!course) notFound()

  const target = curriculumPath(course)
  if (!IS_STATIC_EXPORT) permanentRedirect(target)

  const absolute = `${SITE.basePath}${target}`
  return (
    <>
      {/* React places this in the document head. */}
      <meta httpEquiv="refresh" content={`0; url=${absolute}`} />
      <ReplaceLocation href={absolute} />
      <Section tone="paper" grid containerClassName="py-20 sm:py-28">
        <div className="mx-auto max-w-xl text-center" data-testid="lessons-redirect">
          <p className="eyebrow text-sky-600">{course.title}</p>
          <h1 className="mt-4 text-display-md text-deep-700">The lessons are on the course page</h1>
          <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-deep-500">
            Every lesson of {course.title} is listed in the curriculum on its course page. If you are not taken there
            automatically, use the link below.
          </p>
          <div className="mt-9 flex justify-center">
            <ButtonLink href={target} size="lg" className="group">
              Go to the curriculum
              <ArrowRight />
            </ButtonLink>
          </div>
        </div>
      </Section>
    </>
  )
}
