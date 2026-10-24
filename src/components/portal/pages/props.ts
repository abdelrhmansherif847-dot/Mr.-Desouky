import type { ParentBase, StudentBase } from '@/components/portal/base'
import type { ChildSummary, StudentRecord } from '@/lib/portal/types'

/**
 * Every portal page receives its record rather than loading one. The route
 * decides the source: /preview/* passes the anonymised sample, /student and
 * /parent pass real rows loaded for the signed-in user. So a page can never
 * reach for the wrong kind of data on its own.
 */
export type StudentPageProps = {
  base: StudentBase
  record: StudentRecord
  /** True only on /preview/*: shows the sample-data notice. */
  preview?: boolean
}

export type ParentPageProps = {
  base: ParentBase
  /** The child being viewed. */
  record: StudentRecord
  /** Every child linked to this parent — for the switcher. */
  linked: ChildSummary[]
  preview?: boolean
}
