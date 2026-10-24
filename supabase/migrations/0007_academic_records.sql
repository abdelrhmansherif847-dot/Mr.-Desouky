-- 0007 — Academic records.
--
-- Everything a student's portal shows, as rows the owner writes and the
-- student and their linked parents read. No record is ever fabricated: an
-- empty table is an empty portal, and the portal says so.
--
-- SECURITY MODEL (the same on every table)
--
--   anon           no privileges at all.
--   student        reads their own rows, while their account is approved.
--   parent         reads rows of students linked to them (guardianships),
--                  while their account is approved.
--   owner          reads and writes everything.
--   anyone else    nothing — pending and suspended accounts have no role in
--                  private.caller_role(), so they match no rule.
--
-- Writes are granted to `authenticated` and then limited to the owner by
-- policy, so no SECURITY DEFINER function is needed for day-to-day entry.
-- A trigger additionally refuses any record whose student_id is not a
-- student account. Reviews are visible to students and parents only once
-- published; feedback carries its own visibility, and 'internal' feedback is
-- the owner's alone.
--
-- ROLLBACK
--   drop table public.achievements, public.feedback, public.mock_sections,
--              public.mocks, public.reviews, public.quiz_topic_results,
--              public.quizzes, public.homework, public.sessions,
--              public.student_profiles;
--   drop function private.readable_student_ids(), private.touch_updated_at(),
--                 private.assert_student(), private.check_review_quiz();
--   drop type public.feedback_visibility, public.review_status,
--             public.homework_status, public.session_status, public.exam_kind;

create type public.exam_kind           as enum ('SAT', 'EST');
create type public.session_status      as enum ('scheduled', 'attended', 'missed', 'cancelled');
create type public.homework_status     as enum ('assigned', 'completed', 'late', 'missed');
create type public.review_status       as enum ('draft', 'published');
create type public.feedback_visibility as enum ('shared', 'student', 'parent', 'internal');

-- ---------------------------------------------------------------------------
-- Shared helpers
-- ---------------------------------------------------------------------------

-- The students whose records the caller may read (besides the owner, who is
-- handled separately). Evaluated once per statement when used as
-- `student_id in (select private.readable_student_ids())`.
create or replace function private.readable_student_ids()
  returns setof uuid
  language sql
  stable
  set search_path = public, pg_temp
as $$
  select auth.uid() where private.caller_role() = 'student'
  union all
  select g.student_id
    from public.guardianships g
   where g.parent_id = auth.uid()
     and private.caller_role() = 'parent'
$$;

revoke all on function private.readable_student_ids() from public;
grant execute on function private.readable_student_ids() to authenticated;

create or replace function private.touch_updated_at()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function private.touch_updated_at() from public;

-- Every academic record belongs to a student account.
create or replace function private.assert_student()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $$
begin
  if not exists (select 1 from public.profiles where id = new.student_id and role = 'student') then
    raise exception 'records can only belong to a student account' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.assert_student() from public;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

-- The student's programme setup: where they are in the journey.
create table public.student_profiles (
  student_id       uuid primary key references public.profiles (id) on delete cascade,
  exam             public.exam_kind,
  level            text check (level in ('Basic', 'Advanced')),
  program_title    text check (char_length(program_title) <= 120),
  started_on       date,
  current_stage    smallint not null default 0 check (current_stage between 0 and 6),
  target_exam_date date,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table public.sessions (
  id               uuid primary key default gen_random_uuid(),
  student_id       uuid not null references public.profiles (id) on delete cascade,
  session_date     date not null,
  start_time       time,
  duration_minutes smallint not null default 120 check (duration_minutes between 15 and 480),
  kind             text not null default 'Lesson' check (char_length(kind) between 1 and 60),
  topic            text not null check (char_length(topic) between 1 and 160),
  status           public.session_status not null default 'scheduled',
  preparation      text check (char_length(preparation) <= 1000),
  notes            text check (char_length(notes) <= 2000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index sessions_student_date_idx on public.sessions (student_id, session_date desc);

create table public.homework (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 160),
  description text check (char_length(description) <= 2000),
  topic       text check (char_length(topic) <= 120),
  assigned_on date not null default current_date,
  due_on      date not null,
  status      public.homework_status not null default 'assigned',
  progress    smallint not null default 0 check (progress between 0 and 100),
  score       numeric(5, 2) check (score between 0 and 100),
  feedback    text check (char_length(feedback) <= 2000),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint homework_dates check (due_on >= assigned_on)
);
create index homework_student_due_idx on public.homework (student_id, due_on desc);

create table public.quizzes (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  title      text not null check (char_length(title) between 1 and 160),
  taken_on   date not null,
  score      integer not null check (score >= 0),
  total      integer not null check (total > 0),
  notes      text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quizzes_score_within_total check (score <= total)
);
create index quizzes_student_taken_idx on public.quizzes (student_id, taken_on desc);

create table public.quiz_topic_results (
  id         uuid primary key default gen_random_uuid(),
  quiz_id    uuid not null references public.quizzes (id) on delete cascade,
  topic      text not null check (char_length(topic) between 1 and 120),
  correct    integer not null check (correct >= 0),
  total      integer not null check (total > 0),
  created_at timestamptz not null default now(),
  constraint quiz_topic_results_within_total check (correct <= total)
);
create index quiz_topic_results_quiz_idx on public.quiz_topic_results (quiz_id);

create table public.reviews (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles (id) on delete cascade,
  quiz_id     uuid references public.quizzes (id) on delete set null,
  title       text not null check (char_length(title) between 1 and 160),
  reviewed_on date not null default current_date,
  content     text not null check (char_length(content) between 1 and 4000),
  next_step   text check (char_length(next_step) <= 1000),
  status      public.review_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index reviews_student_date_idx on public.reviews (student_id, reviewed_on desc);

create table public.mocks (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  exam       public.exam_kind not null,
  title      text not null check (char_length(title) between 1 and 120),
  taken_on   date not null,
  score      integer not null check (score >= 0),
  total      integer not null check (total > 0),
  notes      text check (char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mocks_score_within_total check (score <= total)
);
create index mocks_student_taken_idx on public.mocks (student_id, taken_on desc);

create table public.mock_sections (
  id              uuid primary key default gen_random_uuid(),
  mock_id         uuid not null references public.mocks (id) on delete cascade,
  position        smallint not null default 0,
  name            text not null check (char_length(name) between 1 and 80),
  correct         integer not null check (correct >= 0),
  total           integer not null check (total > 0),
  minutes_used    smallint check (minutes_used >= 0),
  minutes_allowed smallint check (minutes_allowed > 0),
  created_at      timestamptz not null default now(),
  constraint mock_sections_within_total check (correct <= total)
);
create index mock_sections_mock_idx on public.mock_sections (mock_id, position);

create table public.feedback (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  category   text not null default 'General' check (char_length(category) between 1 and 80),
  message    text not null check (char_length(message) between 1 and 2000),
  next_step  text check (char_length(next_step) <= 1000),
  visibility public.feedback_visibility not null default 'shared',
  given_on   date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index feedback_student_date_idx on public.feedback (student_id, given_on desc);

create table public.achievements (
  id          uuid primary key default gen_random_uuid(),
  student_id  uuid not null references public.profiles (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 120),
  description text check (char_length(description) <= 500),
  earned_on   date not null default current_date,
  kind        text not null default 'Milestone' check (char_length(kind) between 1 and 40),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index achievements_student_date_idx on public.achievements (student_id, earned_on desc);

-- ---------------------------------------------------------------------------
-- Privileges, triggers and row-level security
-- ---------------------------------------------------------------------------

-- Tables owned by a student directly.
do $$
declare
  t text;
begin
  foreach t in array array[
    'student_profiles', 'sessions', 'homework', 'quizzes', 'reviews', 'mocks', 'feedback', 'achievements'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);

    execute format(
      'create trigger %I before insert or update on public.%I
         for each row execute function private.assert_student()', t || '_student_check', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function private.touch_updated_at()', t || '_touch', t);

    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.is_owner()))',
      t || '_owner_insert', t);
    execute format(
      'create policy %I on public.%I for update to authenticated
         using ((select private.is_owner())) with check ((select private.is_owner()))',
      t || '_owner_update', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_owner()))',
      t || '_owner_delete', t);
  end loop;
end;
$$;

-- Read rules. Most tables share one; reviews and feedback add their own.
do $$
declare
  t text;
begin
  foreach t in array array[
    'student_profiles', 'sessions', 'homework', 'quizzes', 'mocks', 'achievements'
  ] loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (
         (select private.is_owner())
         or student_id in (select private.readable_student_ids())
       )', t || '_select', t);
  end loop;
end;
$$;

create policy "reviews_select"
  on public.reviews for select to authenticated
  using (
    (select private.is_owner())
    or (status = 'published' and student_id in (select private.readable_student_ids()))
  );

-- A review may point at a quiz only if it is the same student's quiz, so a
-- review can never pull another student's result into view.
create or replace function private.check_review_quiz()
  returns trigger
  language plpgsql
  set search_path = public, pg_temp
as $$
begin
  if new.quiz_id is not null and not exists (
    select 1 from public.quizzes where id = new.quiz_id and student_id = new.student_id
  ) then
    raise exception 'a review can only refer to the same student''s quiz' using errcode = '23514';
  end if;
  return new;
end;
$$;

revoke all on function private.check_review_quiz() from public;

create trigger reviews_quiz_check
  before insert or update on public.reviews
  for each row execute function private.check_review_quiz();

-- 'shared' reaches student and parents; 'student' and 'parent' reach only
-- that audience; 'internal' reaches nobody but the owner.
create policy "feedback_select"
  on public.feedback for select to authenticated
  using (
    (select private.is_owner())
    or (
      student_id in (select private.readable_student_ids())
      and (visibility = 'shared' or visibility::text = (select private.caller_role())::text)
    )
  );

-- Child tables: readable exactly when their parent row is (the subquery is
-- itself subject to the parent table's policy); written only by the owner.
do $$
declare
  t text;
  parent_table text;
  fk text;
begin
  foreach t in array array['quiz_topic_results', 'mock_sections'] loop
    parent_table := case t when 'quiz_topic_results' then 'quizzes' else 'mocks' end;
    fk := case t when 'quiz_topic_results' then 'quiz_id' else 'mock_id' end;

    execute format('alter table public.%I enable row level security', t);
    execute format('revoke all on public.%I from anon, authenticated', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);

    execute format(
      'create policy %I on public.%I for select to authenticated using (
         exists (select 1 from public.%I p where p.id = %I.%I)
       )', t || '_select', t, parent_table, t, fk);
    execute format(
      'create policy %I on public.%I for insert to authenticated with check ((select private.is_owner()))',
      t || '_owner_insert', t);
    execute format(
      'create policy %I on public.%I for update to authenticated
         using ((select private.is_owner())) with check ((select private.is_owner()))',
      t || '_owner_update', t);
    execute format(
      'create policy %I on public.%I for delete to authenticated using ((select private.is_owner()))',
      t || '_owner_delete', t);
  end loop;
end;
$$;
