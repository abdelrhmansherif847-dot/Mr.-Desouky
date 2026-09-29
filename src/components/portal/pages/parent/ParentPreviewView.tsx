import { ChildChooser, type ParentSection } from '@/components/portal/children'
import { PreviewChildSelect } from '@/components/portal/PreviewChildSelect'
import { PreviewNotice } from '@/components/portal/PreviewNotice'
import ParentOverviewPage from '@/components/portal/pages/parent/Overview'
import ParentReportsPage from '@/components/portal/pages/parent/Reports'
import { getSampleParentRecord } from '@/lib/portal/data'

const PAGES = { '': ParentOverviewPage, reports: ParentReportsPage } as const

/**
 * Kept apart from ParentView so the public preview never imports the module
 * that talks to Supabase — it can only ever render the invented sample.
 */
/** The preview's page body: the invented sample family, chosen in the browser. */
export async function ParentPreviewView({ section }: { section: ParentSection }) {
  const sample = await getSampleParentRecord()
  const linked = sample.children.map((child) => ({ id: child.profile.id, name: child.profile.name }))
  const Page = PAGES[section]
  return (
    <PreviewChildSelect
      chooser={
        <div className="space-y-5">
          <PreviewNotice audience="parent" />
          <ChildChooser base="/preview/parent" section={section} items={linked} />
        </div>
      }
      views={Object.fromEntries(
        sample.children.map((child) => [
          child.profile.id,
          <Page key={child.profile.id} base="/preview/parent" record={child} linked={linked} preview />,
        ]),
      )}
    />
  )
}
