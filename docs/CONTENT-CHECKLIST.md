# Pre-launch content checklist

Everything below is a **working placeholder**, not a fact. Each item names the
exact file and constant to change. Nothing here requires touching components.

---

## 1. Brand assets — required

- [ ] `public/brand/logo-color.svg` → the approved full-colour logo
- [ ] `public/brand/logo-mono.svg` → the approved black / monochrome logo
- [ ] `public/brand/portrait.svg` → the approved professional portrait
- [ ] `public/brand/og-image.svg` → a 1200×630 share card using the approved logo
- [ ] `public/icon.svg` → favicon generated from the approved logo

See [`public/brand/README.md`](../public/brand/README.md) for formats and sizing.

Once replaced, set `isPlaceholder: false` on `LOGO` and `PORTRAIT` in
`src/content/site.ts` so the codebase stops flagging them as unset.

---

## 2. Contact details — required

**File: `src/content/site.ts`**

- [ ] `SITE.url` — currently the GitHub Pages URL, set automatically by the
      deploy workflow. Only change this when a custom domain is ready (set
      `NEXT_PUBLIC_SITE_URL`); see [`DEPLOYMENT.md`](DEPLOYMENT.md).
- [ ] `CONTACT.whatsapp` — currently `201000000000`. Digits only, full
      international format, no `+`.
- [ ] `CONTACT.whatsappDisplay` — the human-readable version shown on screen.
- [ ] `CONTACT.email` — currently `info@desoukymath.com`.
- [ ] `CONTACT.social[]` — the four entries are placeholder URLs pointing at
      each platform's homepage. Replace with the real profiles, or delete the
      rows you do not use.
- [ ] `SITE.area` — currently `Egypt`. Used for local SEO.

---

## 3. Program details — required

**File: `src/content/programs.ts`**

For each of the four programs, confirm:

- [ ] `duration` — currently 12 weeks (Basic) / 10 weeks (Advanced)
- [ ] `sessions` — currently 24 (Basic) / 20 (Advanced)
- [ ] `sessionLength` — currently 2 hours
- [ ] `groupSize` — currently "Small groups, plus a one-to-one option"
- [ ] `learn[]` — the syllabus breakdown per program
- [ ] `included[]` — particularly the **mock exam counts** (2 for Basic, 4 for
      Advanced)
- [ ] `entryRequirement`

**EST specifically:** the syllabus is written to be structurally accurate for
the EST Math section, but the exact topic coverage and section timing should be
checked against the current official EST specification before publishing.

**Pricing is deliberately absent.** There is no price field anywhere. If you
want prices on the site, add them to `Program` in `programs.ts` and they will
need a small render addition on the program page.

---

## 4. About page — optional but recommended

**File: `src/content/about.ts`**

The About copy is written to contain **no unverified claims** — no years of
experience, no student counts, no score statistics. That is deliberate: nothing
on the site asserts a fact that has not been confirmed.

- [ ] `OPTIONAL_CREDENTIALS` — currently an empty array. Add confirmed facts
      here (degree, years teaching, exam experience) and they render
      automatically as a credentials strip on the About page. Leave it empty
      and the strip simply does not appear.
- [ ] `INTRO.paragraphs` — review the voice. This is the most personal copy on
      the site and should sound like him.

---

## 5. Weekly schedule — confirm before publishing

**File: `src/content/schedule.ts`**

The whole timetable — days, time slots, student groups, breaks, open time and
notes — lives in this one file. Editing it updates both the desktop grid and
the mobile day view; no component needs touching.

- [ ] Confirm the four teaching days and every time slot
- [ ] Confirm the student group names as they should appear publicly
      (`يوسف + صحابه`, `مصطفى`, `أحمد + أسر`, `رقية + زينب + أسماء`,
      `ريم + ياسين + رويا`)
- [ ] **Decide whether student first names should be public at all.** They are
      currently visible to anyone who finds the page. If that is not intended,
      replace them with group labels (e.g. `مجموعة أ`) — the file is the only
      place to change.
- [ ] Confirm the standing rules in `SCHEDULE_RULES`
- [ ] Keep `SCHEDULE_UPDATES` current, or empty it once the changes are old news

---

## 6. Resources — optional

**File: `src/content/resources.ts`**

Every entry has an `available` flag. Items with `available: false` render as
"Coming soon" and are never presented as if they already exist.

- [ ] For each resource you actually have: set `href` and `available: true`
- [ ] Delete entries you do not plan to produce
- [ ] Add real ones — practice sheets, workbooks, videos

---

## 7. Contact form delivery — optional

**File: `src/lib/contact/submit.ts`**

The site is served as a static export, so the form submits from the browser.
Without configuration it validates, keeps what was typed, and hands the
completed enquiry to WhatsApp with every field already filled in. It never
silently drops an enquiry or falsely claims success.

- [ ] Create a form endpoint (Formspree, Web3Forms, Getform, Basin — all free
      for low volume) and point it at the address in `CONTACT.email`
- [ ] Add it on GitHub as **Settings → Secrets and variables → Actions →
      Variables** named `NEXT_PUBLIC_CONTACT_ENDPOINT`
- [ ] Push, then send a test enquiry and confirm it arrives

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for details.

---

## 8. Portals — when you are ready to go live

- [ ] Implement authentication — `src/lib/portal/auth.ts` documents where
- [ ] Point `getStudentRecord()` / `getParentRecord()` at real records —
      `src/lib/portal/data.ts`
- [ ] Enforce that a parent can only read their own children's records **in the
      data layer**, not in the UI
- [ ] Set `IS_SAMPLE_DATA = false`
- [ ] Remove `<PreviewNotice />` from the portal pages
- [ ] Replace the `LoginPanel` screens with the real sign-in form
- [ ] Keep the portals `noindex` (already configured)

The sample records are two deliberately different students — one SAT Basic
mid-journey with a missed session, one EST Advanced near mock stage with a
clean record — so both the "needs attention" and "on track" states are visible.

---

## 9. Final pass

- [ ] Read every page once at mobile width
- [ ] Confirm no page promises a specific score
- [ ] Confirm nothing references Si Math
- [ ] Confirm the logo is the approved one everywhere
- [ ] `npm run build && npm run lint && npm run typecheck` all clean
