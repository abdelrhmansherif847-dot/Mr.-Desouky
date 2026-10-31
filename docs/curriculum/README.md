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
In short: wording and order are kept exactly as printed, and a misprint or an
unreadable word stays as printed, with a note proposing a reading, until that
reading is approved. `npm test` checks every course for 24 lessons in order,
stable lesson IDs, and that no course mentions another course's exam.

To change a curriculum, update its reference image and its data file
together.
