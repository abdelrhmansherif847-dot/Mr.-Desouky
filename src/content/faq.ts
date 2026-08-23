/** FAQ — the questions students and parents actually ask first. */

export type Faq = { q: string; a: string }

export const FAQS: Faq[] = [
  {
    q: 'How do I know whether my child needs the Basic or the Advanced level?',
    a: 'The diagnostic assessment decides it, not preference. It shows topic by topic what is already secure and what is missing, and the recommended level follows from that. If the assessment shows a solid foundation, the student starts at Advanced. If not, starting at Basic saves time rather than costing it.',
  },
  {
    q: 'What is the difference between the SAT and the EST program?',
    a: 'They are two separate exams with different syllabi, question styles and timing, so they are taught as two completely separate programs. EST material is never adapted from SAT material — the practice sets, mocks and wording are specific to each exam.',
  },
  {
    q: 'How is progress measured?',
    a: 'Through attendance, homework completion, topic-scored quizzes, reviews and full-length mock exams. Every result is recorded, and the trend matters more than any single score. Both the student and the parent can see the same evidence.',
  },
  {
    q: 'Can you guarantee a specific score?',
    a: 'No — and any teacher who guarantees one should be treated carefully. What is committed to here is a structured process, honest measurement, early identification of weaknesses, real exam simulation, and clear feedback at every stage. Scores follow from that work.',
  },
  {
    q: 'What happens if my child falls behind?',
    a: 'It is noticed early, because attendance, homework and quiz trends are reviewed continuously rather than at the end of the term. A dip is addressed the week it appears — with a targeted review, extra practice, or a conversation about what changed.',
  },
  {
    q: 'How much homework is there?',
    a: 'A targeted set after every session, sized to be completed properly rather than rushed. Homework is corrected with written notes, not just ticked, and completion is tracked and visible to parents.',
  },
  {
    q: 'Can a student move from Basic to Advanced mid-program?',
    a: 'Yes, when the results support it. The move is based on quiz and mock evidence, not on how long the student has attended.',
  },
  {
    q: 'How do parents stay informed?',
    a: 'Through the parent portal and written feedback after each quiz and mock. Attendance, homework completion, quiz performance, mock scores, strengths, weaknesses and upcoming sessions are all visible — without having to ask.',
  },
  {
    q: 'How do I register?',
    a: 'Message on WhatsApp or send the contact form. The first step is always the diagnostic assessment, so that the recommended program and level are based on evidence rather than a guess.',
  },
]
