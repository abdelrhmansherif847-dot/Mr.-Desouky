/**
 * The six official courses: their identity, delivery, assessment plan and
 * 24 lessons, transcribed from the teacher's reference images in
 * docs/curriculum/reference/. These files are the single source for every
 * course and lesson fact on the site.
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

/**
 * The specific test a course prepares students for. Both EST courses
 * prepare for EST I, by the owner's decision.
 */
export type ExamTest = 'SAT' | 'EST I' | 'ACT'

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

/**
 * How the course is delivered and assessed: the "Course Details" strip of
 * its reference image.
 */
export type CourseDelivery = {
  /**
   * image - printed on the course's reference image
   * owner - not printed; set by the owner's decision to match the other courses
   */
  from: 'image' | 'owner'
  hoursPerLesson: { min: number; max: number }
  quizzes: { min: number; max: number; when: string }
  mocks: { count: number; format: string }
  homework: string
  tracking: string
}

export type CourseCurriculum = {
  /** The course page's slug, /programs/<slug>/, and the course's ID. */
  slug: string
  exam: Exam
  level: Level
  /** The test this course prepares students for. */
  target: ExamTest
  /** The image heading, e.g. "SAT Math – Basic". */
  title: string
  grade: string
  /** The line under the heading, as printed. */
  strapline: string
  delivery: CourseDelivery
  /** Closing lines printed on the image. */
  slogans: string[]
  /** Which reference image this was transcribed from. */
  source: string
  lessons: CurriculumLesson[]
}

/* ------------------------------------------------------------------ */
/* Learning objectives                                                  */
/* ------------------------------------------------------------------ */

/** Every objective starts as a draft; only the teacher approves one. */
export type ObjectiveReview = 'draft' | 'approved'

export type LearningObjective = {
  text: string
  /**
   * The 0-based indices of the lesson topics this objective is drawn from.
   * An objective says nothing its topics do not.
   */
  from: number[]
  review: ObjectiveReview
}

/** One course's objectives, keyed by lesson ID. */
export type CourseObjectives = Record<string, LearningObjective[]>

/**
 * A course-level learning outcome, drafted only from the titles of the
 * lessons it names. Together a course's outcomes cite every lesson.
 */
export type CourseOutcome = {
  text: string
  /** Lesson numbers (1–24) the outcome is drawn from. */
  lessons: number[]
  review: ObjectiveReview
}

/* ------------------------------------------------------------------ */
/* Exam formats and scope: facts about the exams themselves              */
/* ------------------------------------------------------------------ */

export type SourceRef = {
  title: string
  publisher: string
  url: string
  /** Page or section the fact comes from, when known. */
  where?: string
}

/**
 * confirmed  - read in the publisher's own document or page
 * to-confirm - the publisher's document is identified, but its text has not
 *              been read in full yet (only search excerpts of it)
 * secondary  - only third-party sources
 * Only `confirmed` facts are ever shown to visitors. The other two read
 * "Pending Official Verification" wherever they are listed for review.
 */
export type Verification = 'confirmed' | 'to-confirm' | 'secondary'

/** A fact about an exam, never stated without where it came from. */
export type ExamFact = {
  label: string
  value: string
  verification: Verification
  sources: SourceRef[]
}

/** One exam's math test. SAT, EST and ACT are each described separately. */
export type ExamFormat = {
  exam: Exam
  /** The tests these facts describe; every course's target must be one. */
  covers: ExamTest[]
  fullName: string
  mathTest: string
  facts: ExamFact[]
  /** What could not be established, or where sources disagree. */
  openQuestions: string[]
  /** When the facts were last checked against their sources. */
  checkedOn: string
}

/**
 * Whether a topic is tested by its exam, as proposed for the owner's and
 * teacher's review. Nothing is removed from the curriculum because of it.
 */
export type TopicScope = {
  lessonId: string
  /** 0-based topic index within the lesson. */
  topic: number
  /**
   * core      - within the exam's tested content
   * extension - beyond it
   * mixed     - part of the topic is core and part extension; `basis` says which
   */
  proposed: 'core' | 'extension' | 'mixed'
  basis: string
  verification: Verification
  sources: SourceRef[]
  review: 'pending' | 'approved'
}
