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
