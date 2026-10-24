import StudentJourney from '@/components/portal/pages/student/Journey'
import { getSampleStudentRecord } from '@/lib/portal/data'

export default async function StudentJourneyPreviewPage() {
  return <StudentJourney base="/preview/student" record={await getSampleStudentRecord()} preview />
}
