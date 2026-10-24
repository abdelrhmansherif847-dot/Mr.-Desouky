import StudentJourney from '@/components/portal/pages/student/Journey'
import { requireMyStudentRecord } from '@/lib/portal/records'

export default async function StudentJourneyPage() {
  return <StudentJourney base="/student" record={await requireMyStudentRecord()} />
}
