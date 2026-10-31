/**
 * The official curricula of the six courses, transcribed from the teacher's
 * reference images in docs/curriculum/reference/. These files are the single
 * source for every lesson number, title and topic shown on the site.
 *
 * Transcription rules
 *  - Lesson titles, topic wording, capitalisation and order are kept exactly
 *    as printed.
 *  - Typography only: a range is set with an en dash ("Grade 11–12", "4–6"),
 *    and a comma or full stop left at the very end of a bullet is dropped.
 *  - One phrase broken across two bullet lines is kept as one topic, and a
 *    `joined` note records how it was printed.
 *  - Nothing printed is corrected. A misprint or an unreadable word stays as
 *    printed, with a note proposing a reading; the proposal is applied only
 *    after it has been approved.
 *  - No lesson is `published` until real teaching content exists for it.
 */

export type Exam = 'SAT' | 'EST' | 'ACT'
export type Level = 'Basic' | 'Advanced'

/** `published` only once the lesson's real teaching content exists. */
export type LessonStatus = 'planned' | 'published'

export type TranscriptionNote = {
  /** The lesson title, or the 0-based index of the topic the note is about. */
  at: 'title' | number
  /**
   * garbled  - the image text cannot be read; `printed` is the closest reading
   *            of the letters, and the topic keeps it until a reading is approved
   * misprint - readable, but a clear typing error in the image
   * unclear  - readable, but possibly cut short or ambiguous
   * joined   - one phrase printed across two bullet lines, kept as one topic
   * clarify  - the official title is kept; `proposed` is a short explanation
   *            that could be shown beside it
   */
  kind: 'garbled' | 'misprint' | 'unclear' | 'joined' | 'clarify'
  /** What the image shows. For `joined`, the two printed lines, split by " | ". */
  printed: string
  /** A suggested reading or explanation. Not applied until approved. */
  proposed?: string
  /** How sure the proposed reading is. */
  confidence?: 'high' | 'low'
}

export type CurriculumLesson = {
  /** Stable for good: e.g. "sat-basic-L01". Never reused or renumbered. */
  id: string
  /** 1–24 as printed; also the display order. */
  number: number
  title: string
  topics: string[]
  status: LessonStatus
  notes?: TranscriptionNote[]
}

/** The "Course Details" strip of a reference image, as printed. */
export type CourseDetails = {
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
  /** `null` where the image has no "Course Details" strip. */
  details: CourseDetails | null
  /** Closing lines printed on the image. */
  slogans: string[]
  /** Which reference image this was transcribed from. */
  source: string
  lessons: CurriculumLesson[]
}
