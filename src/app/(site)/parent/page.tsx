import { ParentView } from '@/components/portal/pages/parent/ParentView'

export default async function ParentOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ child?: string | string[] }>
}) {
  const { child } = await searchParams
  return <ParentView section="" requested={child} />
}
