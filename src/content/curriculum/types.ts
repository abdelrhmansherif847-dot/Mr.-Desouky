/**
 * The official curricula of the six courses, transcribed from the teacher's
 * reference images in docs/curriculum/reference/. These files are the single
 * source for every lesson number, title and topic shown on the site.
 *
 * Transcription rules
 *  - Lesson titles, topic wording, capitalisation and order are kept exactly
 *    as printed. (The website may capitalise the first letter of a topic
 *    when it displays it; the data here keeps the printed case.)
 *  - Typography only: a range is set with an en dash ("Grade 11–12", "4–6"),
 *    and a comma or full stop left at the very end of a bullet is dropped.
 *  - One phrase broken across two bullet lines is kept as one topic, and a
 *    `joined` note records how it was printed.
 *  - A misprint is corrected only once the owner has approved the
 *    correction; its note keeps what the image prints. A reading that could
 *    not be confirmed keeps the printed text and waits for the teacher.
 *  - No lesson is `published` until real teaching content exists for it.
 */

export type Exam = 'SAT' | 'EST' | 'ACT'
export type Level = 'Basic' | 'Advanced'

/** `published` only once the lesson's real teaching content exists. */
export type LessonStatus = 'planned' | 'published'

export type TranscriptionNote = {
  /** The 0-based index of the topic the note is about. */
  at: number
  /**
   * garbled  - the image text cannot be read reliably
   * misprint - readable, but a clear typing error in the image
   * unclear  - readable, but possibly cut short or ambiguous
   * joined   - one phrase printed across two bullet lines, kept as one topic
   */
  kind: 'garbled' | 'misprint' | 'unclear' | 'joined'
  /** What the image shows. For `joined`, the two printed lines, split by " | ". */
  printed: string
  /**
   * applied       - the owner approved the correction: the topic carries
   *                 `proposed`, and `printed` records the original
   * teacher-check - not confirmed: the topic keeps `printed` until the
   *                 teacher gives the wording. `proposed` is only a
   *                 suggestion for the teacher and is never displayed.
   */
  decision: 'applied' | 'teacher-check'
  proposed?: string
}

export type CurriculumLesson = {
  /** Stable for good: e.g. "sat-basic-L01". Never reused or renumbered. */
  id: string
  /** 1–24 as printed; also the display order. */
  number: number
  /** The official title, exactly as printed. */
  title: string
  /** An approved explanation shown beside a title that needs one. */
  clarification?: string
  topics: string[]
  status: LessonStatus
  notes?: TranscriptionNote[]
}

/** How the course is delivered: the "Course Details" strip of an image. */
export type CourseDetails = {
  /**
   * image - printed on the course's reference image
   * owner - not printed; set by the owner's decision to match the other courses
   */
  from: 'image' | 'owner'
  lessons: { count: number; length: string }
  quizzes: { count: string; when: string }
  mocks: { count: number; format: string }
  homework: string
  tracking: string
}

export type CourseCurriculum = {
  /** The course page's slug: /programs/<slug>/. */
  slug: string
  exam: Exam
  level: Level
  /** The image heading, e.g. "SAT Math – Basic". */
  title: string
  grade: string
  /** The line under the heading, as printed. */
  strapline: string
  details: CourseDetails
  /** Closing lines printed on the image. */
  slogans: string[]
  /** Which reference image this was transcribed from. */
  source: string
  lessons: CurriculumLesson[]
}
