import { ChildChooser, WaitingForLink, type ParentSection } from '@/components/portal/children'
import ParentOverviewPage from '@/components/portal/pages/parent/Overview'
import ParentReportsPage from '@/components/portal/pages/parent/Reports'
import { getChildView } from '@/lib/portal/records'

const PAGES = { '': ParentOverviewPage, reports: ParentReportsPage } as const

/**
 * The real parent portal's page body.
 *
 * `requested` is the `?child=` value from the URL. getChildView honours it
 * only if it names one of this parent's own linked children; otherwise it
 * is ignored. So: no children → the waiting state; one → that child; several
 * and no valid choice → the chooser.
 */
export async function ParentView({
  section,
  requested,
}: {
  section: ParentSection
  requested: string | string[] | undefined
}) {
  const { children, selected, record } = await getChildView(
    typeof requested === 'string' ? requested : undefined,
  )
  if (children.length === 0) return <WaitingForLink />
  if (!selected || !record) return <ChildChooser base="/parent" section={section} items={children} />
  const Page = PAGES[section]
  return <Page base="/parent" record={record} linked={children} />
}
