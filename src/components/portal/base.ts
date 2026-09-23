/**
 * Where a portal is mounted.
 *
 * The same pages serve two audiences: the real, authenticated portal a signed-
 * in student or parent reaches, and the public sample-data preview anyone can
 * browse. Every internal link is built from this base, so a visitor in the
 * preview is never sent into the protected area — where they would only be
 * bounced to a login screen — and a signed-in student is never sent out of it.
 */
export type StudentBase = '/student' | '/preview/student'
export type ParentBase = '/parent' | '/preview/parent'
