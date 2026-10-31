# Course curricula

The six official course curricula, as supplied by the teacher, are the
reference images in `reference/`:

| Image | Courses |
| --- | --- |
| `sat-math-basic.webp` | SAT Math – Basic (Grade 10) |
| `sat-math-advanced.webp` | SAT Math – Advanced (Grade 11–12) |
| `est-act-math.webp` | EST Math – Basic and Advanced (top), ACT Math – Basic and Advanced (bottom) |

They are transcribed, one file per course, into `src/content/curriculum/`.
Those files are what the site reads; the images are kept here only so the
transcription can be checked against its source.

## Where everything lives

| File | Holds |
| --- | --- |
| `src/content/curriculum/<course>.ts` | The transcription: identity, grade, target test, delivery and assessment counts, 24 lessons with topics, corrections and teacher-check notes |
| `src/content/curriculum/objectives/<course>.ts` | Learning objectives by lesson ID, each naming the topics it is drawn from. All are drafts until the teacher approves them |
| `src/content/curriculum/exams.ts` | The SAT, EST and ACT math test formats, kept separate, every fact with its source; and the proposed SAT core/extension labels |
| `src/content/curriculum/model.ts` | Validation, and the course view built from the files above (hours, assessment plan, lesson sections) |
| `src/content/curriculum/index.ts` | `COURSES`, `getCourse`, `getLesson`, `getLessonById`: the only entry point the site uses |

Each fact is written once. Hours, homework sets and in-lesson mocks are
calculated from the lessons, not stored. If the files disagree, the build
stops and lists every problem.

## Exam targets

Each course prepares students for one test, set by `target` in its file:

| Course | Target test |
| --- | --- |
| SAT Math – Basic, SAT Math – Advanced | SAT (digital), Math section |
| EST Math – Basic, EST Math – Advanced | EST I (owner's decision, Phase 1 review) |
| ACT Math – Basic, ACT Math – Advanced | ACT (enhanced), Mathematics test |

Each exam's format lists the tests it describes (`covers`), and every
course's target must be one of them, so the EST format describes EST I
only. The build stops if a course targets another exam's test or a test
its format does not describe; `npm test` also checks the assignments above.

## Exam facts: Pending Official Verification

Exam facts and SAT scope labels are shown to visitors only once they are
`confirmed` against the publisher's own document (and, for scope labels,
approved). On 2026-10-31 none could be read in the original, so all are
`to-confirm`, labelled "Pending Official Verification". That includes every
EST I detail: sections, question count, timing, calculator policy and
scoring. Nothing is inferred beyond what the cited documents state, and
where the EST sources disagree the disagreement is recorded in the EST
format's open questions rather than resolved by guesswork.

The transcription rules are at the top of `src/content/curriculum/types.ts`.
In short: wording and order are kept exactly as printed. A misprint is
corrected only once the owner approves it, and its note keeps the printed
original. `npm test` checks every course for 24 lessons in order, stable
lesson IDs, no course mentioning another course's exam, and every decision
below.

## Awaiting the teacher

These four readings could not be confirmed from the images, so they are
stored exactly as printed (each lesson's note holds a suggested reading for
the teacher). Once the teacher gives the wording, update the topic, set the
note's `decision` to `applied`, and update `tests/curriculum.test.mts`.

| Lesson | Stored as printed |
| --- | --- |
| EST Math – Advanced, L1 | Probiemunhitgure |
| EST Math – Advanced, L14 | Applications andgations |
| ACT Math – Basic, L2 | like terms |
| ACT Math – Advanced, L12 | identities ideations |

To change a curriculum, update its reference image and its data file
together.
