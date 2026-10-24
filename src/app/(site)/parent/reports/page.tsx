import { ParentView } from '@/components/portal/pages/parent/ParentView'

export default async function ParentReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string | string[] }>
}) {
  const { child } = await searchParams
  return <ParentView section="reports" requested={child} />
}
