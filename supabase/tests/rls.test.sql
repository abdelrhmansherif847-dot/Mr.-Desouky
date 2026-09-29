-- Security tests for migrations 0001–0007. Run with supabase/tests/run.sh
-- against a local PostgreSQL that has shim.sql and every migration applied.
-- Everything happens in one transaction that is rolled back at the end.
--
-- Each check is run as the real API role (`authenticated` or `anon`) with the
-- caller's id in request.jwt.claims — exactly how Supabase evaluates RLS.

\set ON_ERROR_STOP 1
begin;

create schema t;
create table t.results (name text, ok boolean, detail text);

-- Run `sql` as a user (null = anonymous) and report whether it raised.
create function t.run(uid uuid, sql text) returns text language plpgsql as $$
declare n bigint;
begin
  if uid is null then
    perform set_config('role', 'anon', true);
    perform set_config('request.jwt.claims', '{}', true);
  else
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, true);
  end if;
  execute sql;
  get diagnostics n = row_count;
  perform set_config('role', 'postgres', true);
  return 'ok:' || n;
exception when others then
  perform set_config('role', 'postgres', true);
  return 'error:' || sqlstate || ':' || sqlerrm;
end $$;

-- Count rows visible to a user.
create function t.visible(uid uuid, sql text) returns bigint language plpgsql as $$
declare n bigint;
begin
  if uid is null then
    perform set_config('role', 'anon', true);
    perform set_config('request.jwt.claims', '{}', true);
  else
    perform set_config('role', 'authenticated', true);
    perform set_config('request.jwt.claims', json_build_object('sub', uid)::text, true);
  end if;
  execute 'select count(*) from (' || sql || ') x' into n;
  perform set_config('role', 'postgres', true);
  return n;
exception when others then
  perform set_config('role', 'postgres', true);
  return -1;
end $$;

create function t.check(name text, ok boolean, detail text default null) returns void language sql as $$
  insert into t.results values (name, ok, detail)
$$;

-- ---------------------------------------------------------------------------
-- Fixture: accounts are created the way Supabase creates them (a row in
-- auth.users; the trigger writes the profile), then promoted by hand, as the
-- owner would in the SQL editor.
-- ---------------------------------------------------------------------------
insert into auth.users (id, email, raw_user_meta_data) values
  ('00000000-0000-4000-8000-000000000001', 'owner@example.test',      '{"full_name":"Owner"}'),
  ('00000000-0000-4000-8000-000000000011', 'student.a@example.test',  '{"full_name":"Student A","intended_role":"student"}'),
  ('00000000-0000-4000-8000-000000000012', 'student.b@example.test',  '{"full_name":"Student B","intended_role":"student"}'),
  ('00000000-0000-4000-8000-000000000013', 'student.p@example.test',  '{"full_name":"Pending Student","intended_role":"student"}'),
  ('00000000-0000-4000-8000-000000000014', 'student.s@example.test',  '{"full_name":"Suspended Student","intended_role":"student"}'),
  ('00000000-0000-4000-8000-000000000021', 'parent.a@example.test',   '{"full_name":"Parent A","intended_role":"parent"}'),
  ('00000000-0000-4000-8000-000000000022', 'parent.b@example.test',   '{"full_name":"Parent B","intended_role":"parent"}'),
  ('00000000-0000-4000-8000-000000000023', 'parent.p@example.test',   '{"full_name":"Pending Parent","intended_role":"parent"}'),
  ('00000000-0000-4000-8000-000000000024', 'parent.m@example.test',   '{"full_name":"Multi Parent","intended_role":"parent"}');

update public.profiles set role = 'owner', status = 'approved' where id = '00000000-0000-4000-8000-000000000001';
update public.profiles set status = 'approved' where id in (
  '00000000-0000-4000-8000-000000000011', '00000000-0000-4000-8000-000000000012',
  '00000000-0000-4000-8000-000000000021', '00000000-0000-4000-8000-000000000022',
  '00000000-0000-4000-8000-000000000024');
update public.profiles set status = 'suspended' where id = '00000000-0000-4000-8000-000000000014';

\set owner    '''00000000-0000-4000-8000-000000000001'''
\set stuA     '''00000000-0000-4000-8000-000000000011'''
\set stuB     '''00000000-0000-4000-8000-000000000012'''
\set stuPend  '''00000000-0000-4000-8000-000000000013'''
\set stuSusp  '''00000000-0000-4000-8000-000000000014'''
\set parA     '''00000000-0000-4000-8000-000000000021'''
\set parB     '''00000000-0000-4000-8000-000000000022'''
\set parPend  '''00000000-0000-4000-8000-000000000023'''
\set parMulti '''00000000-0000-4000-8000-000000000024'''

-- 0005: sign-up metadata never grants more than student/parent + pending.
select t.check('0005 signup: parent intent -> parent/pending',
  (select role = 'parent' and status = 'pending' from public.profiles where id = :parPend));

-- ---------------------------------------------------------------------------
-- ADMIN: only the owner may approve, suspend, reinstate, link.
-- ---------------------------------------------------------------------------
select t.check('admin: anon cannot call admin_set_account',
  t.run(null, format('select public.admin_set_account(%L, ''approved'')', :stuPend)) like 'error:42501%');
select t.check('admin: student cannot approve',
  t.run(:stuA, format('select public.admin_set_account(%L, ''approved'')', :stuPend)) like 'error:42501%');
select t.check('admin: parent cannot approve',
  t.run(:parA, format('select public.admin_set_account(%L, ''approved'')', :stuPend)) like 'error:42501%');
select t.check('admin: pending user cannot approve themselves',
  t.run(:stuPend, format('select public.admin_set_account(%L, ''approved'')', :stuPend)) like 'error:42501%');
select t.check('admin: still pending after refused attempts',
  (select status = 'pending' from public.profiles where id = :stuPend));

-- Each change and its read-back are separate statements: a statement does not
-- see writes made by a function it calls.
select t.check('admin: owner approves pending (pending -> approved): call',
  t.run(:owner, format('select public.admin_set_account(%L, ''approved'')', :stuPend)) like 'ok%');
select t.check('admin: owner approves pending (pending -> approved): result',
  (select status = 'approved' from public.profiles where id = :stuPend));
select t.check('admin: owner suspends (approved -> suspended): call',
  t.run(:owner, format('select public.admin_set_account(%L, ''suspended'')', :stuPend)) like 'ok%');
select t.check('admin: owner suspends (approved -> suspended): result',
  (select status = 'suspended' from public.profiles where id = :stuPend));
select t.check('admin: owner reinstates (suspended -> approved): call',
  t.run(:owner, format('select public.admin_set_account(%L, ''approved'')', :stuPend)) like 'ok%');
select t.check('admin: owner reinstates (suspended -> approved): result',
  (select status = 'approved' from public.profiles where id = :stuPend));
select t.check('admin: owner suspends a pending account (pending -> suspended): call',
  t.run(:owner, format('select public.admin_set_account(%L, ''suspended'')', :parPend)) like 'ok%');
select t.check('admin: owner suspends a pending account (pending -> suspended): result',
  (select status = 'suspended' from public.profiles where id = :parPend));
select t.check('admin: owner corrects a role (student -> parent) with no links: call',
  t.run(:owner, format('select public.admin_set_account(%L, ''pending'', ''parent'')', :stuPend)) like 'ok%');
select t.check('admin: owner corrects a role (student -> parent) with no links: result',
  (select role = 'parent' from public.profiles where id = :stuPend));
update public.profiles set role = 'student' where id = :stuPend;
update public.profiles set status = 'pending' where id in (:stuPend, :parPend);

select t.check('admin: owner cannot change their own account',
  t.run(:owner, format('select public.admin_set_account(%L, ''suspended'')', :owner)) like 'error:22023%');
select t.check('admin: owner cannot grant the owner role',
  t.run(:owner, format('select public.admin_set_account(%L, ''approved'', ''owner'')', :stuB)) like 'error:22023%');
select t.check('admin: owner cannot grant the assistant role here',
  t.run(:owner, format('select public.admin_set_account(%L, ''approved'', ''assistant'')', :stuB)) like 'error:22023%');
select t.check('admin: unknown account is reported',
  t.run(:owner, 'select public.admin_set_account(''00000000-0000-4000-8000-0000000000ff'', ''approved'')') like 'error:P0002%');

-- 0004 regression: still no direct writes to privileged columns.
select t.check('0004: student cannot write own status',
  t.run(:stuA, format('update public.profiles set status = ''approved'' where id = %L', :stuA)) like 'error:42501%');
select t.check('0004: student cannot write own role',
  t.run(:stuA, format('update public.profiles set role = ''owner'' where id = %L', :stuA)) like 'error:42501%');
select t.check('0004: owner cannot write another status directly (only via function)',
  t.run(:owner, format('update public.profiles set status = ''approved'' where id = %L', :stuPend)) like 'error:42501%');
select t.check('0004: student can still edit own phone',
  t.run(:stuA, format('update public.profiles set phone = ''0100'' where id = %L', :stuA)) = 'ok:1');

-- ---------------------------------------------------------------------------
-- GUARDIANSHIPS
-- ---------------------------------------------------------------------------
select t.check('guardianship: student cannot insert a link',
  t.run(:stuA, format('insert into public.guardianships (parent_id, student_id) values (%L, %L)', :parA, :stuA)) like 'error:42501%');
select t.check('guardianship: parent cannot insert a link',
  t.run(:parA, format('insert into public.guardianships (parent_id, student_id) values (%L, %L)', :parA, :stuB)) like 'error:42501%');
select t.check('guardianship: parent cannot call admin_link_guardian',
  t.run(:parA, format('select public.admin_link_guardian(%L, %L)', :parA, :stuB)) like 'error:42501%');
select t.check('guardianship: student cannot call admin_link_guardian',
  t.run(:stuA, format('select public.admin_link_guardian(%L, %L)', :parA, :stuA)) like 'error:42501%');

select t.check('guardianship: owner links parent A -> student A',
  t.run(:owner, format('select public.admin_link_guardian(%L, %L)', :parA, :stuA)) like 'ok%');
select t.check('guardianship: owner links multi parent -> A and B',
  t.run(:owner, format('select public.admin_link_guardian(%L, %L)', :parMulti, :stuA)) like 'ok%'
  and t.run(:owner, format('select public.admin_link_guardian(%L, %L)', :parMulti, :stuB)) like 'ok%');
select t.check('guardianship: linking twice is harmless',
  t.run(:owner, format('select public.admin_link_guardian(%L, %L)', :parA, :stuA)) like 'ok%'
  and (select count(*) = 1 from public.guardianships where parent_id = :parA and student_id = :stuA));
select t.check('guardianship: a parent cannot be linked as a student',
  t.run(:owner, format('select public.admin_link_guardian(%L, %L)', :parA, :parB)) like 'error:23514%');
select t.check('guardianship: a student cannot be the guardian',
  t.run(:owner, format('select public.admin_link_guardian(%L, %L)', :stuA, :stuB)) like 'error:23514%');
select t.check('guardianship: parent sees only own links',
  t.visible(:parA, 'select 1 from public.guardianships') = 1
  and t.visible(:parB, 'select 1 from public.guardianships') = 0);
select t.check('guardianship: linked_students gives parent A exactly student A, name only',
  t.visible(:parA, format('select 1 from public.linked_students() where id = %L', :stuA)) = 1
  and t.visible(:parA, 'select 1 from public.linked_students()') = 1);
select t.check('guardianship: multi parent sees two children',
  t.visible(:parMulti, 'select 1 from public.linked_students()') = 2);
select t.check('guardianship: pending parent gets no children even if linked',
  (select count(*) from public.guardianships where parent_id = :parPend) = 0
  and t.visible(:parPend, 'select 1 from public.linked_students()') = 0);
select t.check('guardianship: role change refused while links exist',
  t.run(:owner, format('select public.admin_set_account(%L, ''approved'', ''parent'')', :stuA)) like 'error:23514%');
select t.check('guardianship: anon cannot read links',
  t.visible(null, 'select 1 from public.guardianships') = -1);

-- ---------------------------------------------------------------------------
-- ACADEMIC RECORDS
-- ---------------------------------------------------------------------------
select t.check('academic: owner can create records for student A',
  t.run(:owner, format($q$
    with q as (insert into public.quizzes (student_id, title, taken_on, score, total)
               values (%1$L, 'Quiz A', current_date, 7, 10) returning id)
    insert into public.quiz_topic_results (quiz_id, topic, correct, total)
    select id, 'Algebra', 7, 10 from q $q$, :stuA)) like 'ok%'
  and t.run(:owner, format('insert into public.sessions (student_id, session_date, topic) values (%L, current_date, ''Linear equations'')', :stuA)) like 'ok%'
  and t.run(:owner, format('insert into public.homework (student_id, title, due_on) values (%L, ''Set 1'', current_date)', :stuA)) like 'ok%'
  and t.run(:owner, format('insert into public.mocks (student_id, exam, title, taken_on, score, total) values (%L, ''SAT'', ''Mock 1'', current_date, 600, 800)', :stuA)) like 'ok%'
  and t.run(:owner, format('insert into public.achievements (student_id, title) values (%L, ''First mock'')', :stuA)) like 'ok%'
  and t.run(:owner, format('insert into public.student_profiles (student_id, exam, current_stage) values (%L, ''SAT'', 2)', :stuA)) like 'ok%');
select t.check('academic: owner can create records for student B',
  t.run(:owner, format('insert into public.sessions (student_id, session_date, topic) values (%L, current_date, ''Geometry'')', :stuB)) like 'ok%'
  and t.run(:owner, format('insert into public.quizzes (student_id, title, taken_on, score, total) values (%L, ''Quiz B'', current_date, 5, 10)', :stuB)) like 'ok%');
select t.check('academic: records cannot belong to a parent account',
  t.run(:owner, format('insert into public.sessions (student_id, session_date, topic) values (%L, current_date, ''x'')', :parA)) like 'error:23514%');
select t.check('academic: score cannot exceed total',
  t.run(:owner, format('insert into public.quizzes (student_id, title, taken_on, score, total) values (%L, ''Bad'', current_date, 11, 10)', :stuA)) like 'error:23514%');

select t.check('academic: student reads own sessions',
  t.visible(:stuA, 'select 1 from public.sessions') = 1);
select t.check('academic: student cannot read another student''s records',
  t.visible(:stuA, format('select 1 from public.sessions where student_id = %L', :stuB)) = 0
  and t.visible(:stuA, format('select 1 from public.quizzes where student_id = %L', :stuB)) = 0);
select t.check('academic: student sees own quiz topic results (child table)',
  t.visible(:stuA, 'select 1 from public.quiz_topic_results') = 1
  and t.visible(:stuB, 'select 1 from public.quiz_topic_results') = 0);
select t.check('academic: pending student reads nothing',
  t.run(:owner, format('select public.admin_set_account(%L, ''pending'')', :stuA)) like 'ok%'
  and t.visible(:stuA, 'select 1 from public.sessions') = 0);
select t.check('academic: suspended student reads nothing',
  t.run(:owner, format('select public.admin_set_account(%L, ''suspended'')', :stuA)) like 'ok%'
  and t.visible(:stuA, 'select 1 from public.sessions') = 0);
select t.check('academic: reinstated student reads again',
  t.run(:owner, format('select public.admin_set_account(%L, ''approved'')', :stuA)) like 'ok%'
  and t.visible(:stuA, 'select 1 from public.sessions') = 1);

select t.check('academic: linked parent reads child''s records',
  t.visible(:parA, 'select 1 from public.sessions') = 1
  and t.visible(:parA, 'select 1 from public.quizzes') = 1
  and t.visible(:parA, 'select 1 from public.student_profiles') = 1);
select t.check('academic: linked parent cannot read an unlinked child',
  t.visible(:parA, format('select 1 from public.sessions where student_id = %L', :stuB)) = 0);
select t.check('academic: unlinked parent reads nothing',
  t.visible(:parB, 'select 1 from public.sessions') = 0);
select t.check('academic: multi parent reads both children',
  t.visible(:parMulti, 'select 1 from public.sessions') = 2);
select t.check('academic: owner reads everything',
  t.visible(:owner, 'select 1 from public.sessions') = 2);
select t.check('academic: anonymous is denied outright',
  t.visible(null, 'select 1 from public.sessions') = -1
  and t.visible(null, 'select 1 from public.quizzes') = -1
  and t.visible(null, 'select 1 from public.feedback') = -1);

select t.check('academic: student cannot write own records',
  t.run(:stuA, format('insert into public.sessions (student_id, session_date, topic) values (%L, current_date, ''x'')', :stuA)) like 'error:42501%'
  and t.run(:stuA, 'update public.homework set status = ''completed''') = 'ok:0'
  and t.run(:stuA, 'delete from public.quizzes') = 'ok:0');
select t.check('academic: student cannot raise own quiz score',
  (select score = 7 from public.quizzes where title = 'Quiz A'));
-- Refused either by RLS (42501) or, earlier, by the student-account check,
-- which cannot see the child's profile row as a parent (23514). Both refuse.
select t.check('academic: parent cannot write child''s records',
  t.run(:parA, format('insert into public.homework (student_id, title, due_on) values (%L, ''x'', current_date)', :stuA)) ~ '^error:(42501|23514)'
  and t.run(:parA, 'update public.sessions set status = ''attended''') = 'ok:0');
select t.check('academic: owner can update and delete',
  t.run(:owner, 'update public.sessions set status = ''attended'' where topic = ''Geometry''') = 'ok:1'
  and t.run(:owner, 'delete from public.achievements where title = ''First mock''') = 'ok:1');

-- Reviews: drafts are the owner's until published.
select t.run(:owner, format('insert into public.reviews (student_id, title, content, status) values (%L, ''Draft review'', ''x'', ''draft'')', :stuA));
select t.run(:owner, format('insert into public.reviews (student_id, title, content, status) values (%L, ''Published review'', ''x'', ''published'')', :stuA));
select t.check('reviews: student sees published only',
  t.visible(:stuA, 'select 1 from public.reviews') = 1);
select t.check('reviews: parent sees published only',
  t.visible(:parA, 'select 1 from public.reviews') = 1);
select t.check('reviews: owner sees drafts too',
  t.visible(:owner, 'select 1 from public.reviews') = 2);

-- Feedback visibility.
select t.run(:owner, format($q$insert into public.feedback (student_id, message, visibility) values
  (%1$L, 'shared', 'shared'), (%1$L, 'student only', 'student'),
  (%1$L, 'parent only', 'parent'), (%1$L, 'internal', 'internal')$q$, :stuA));
select t.check('feedback: student sees shared + student',
  t.visible(:stuA, 'select 1 from public.feedback') = 2
  and t.visible(:stuA, 'select 1 from public.feedback where visibility in (''parent'',''internal'')') = 0);
select t.check('feedback: parent sees shared + parent',
  t.visible(:parA, 'select 1 from public.feedback') = 2
  and t.visible(:parA, 'select 1 from public.feedback where visibility in (''student'',''internal'')') = 0);
select t.check('feedback: internal notes are the owner''s alone',
  t.visible(:owner, 'select 1 from public.feedback where visibility = ''internal''') = 1);

-- Removing a link removes access at once.
select t.check('guardianship: owner unlinks parent A',
  t.run(:owner, format('select public.admin_unlink_guardian(%L, %L)', :parA, :stuA)) like 'ok%');
select t.check('guardianship: access gone immediately after unlink',
  t.visible(:parA, 'select 1 from public.sessions') = 0
  and t.visible(:parA, 'select 1 from public.linked_students()') = 0);
select t.check('guardianship: parent cannot unlink',
  t.run(:parMulti, format('select public.admin_unlink_guardian(%L, %L)', :parMulti, :stuA)) like 'error:42501%'
  and (select count(*) = 2 from public.guardianships where parent_id = :parMulti));

-- A suspended parent loses access to linked children.
select t.run(:owner, format('select public.admin_set_account(%L, ''suspended'')', :parMulti));
select t.check('guardianship: suspended parent reads nothing',
  t.visible(:parMulti, 'select 1 from public.sessions') = 0
  and t.visible(:parMulti, 'select 1 from public.linked_students()') = 0);

-- ---------------------------------------------------------------------------
-- auth_settings is out of reach.
-- ---------------------------------------------------------------------------
select t.check('auth_settings: RLS enabled',
  (select relrowsecurity from pg_class where oid = 'private.auth_settings'::regclass));
select t.check('auth_settings: signed-in users cannot read it',
  t.visible(:stuA, 'select 1 from private.auth_settings') = -1);
select t.check('auth_settings: signed-in users cannot open sign-ups',
  t.run(:owner, 'update private.auth_settings set allow_signups = true') like 'error:42501%');

-- ---------------------------------------------------------------------------
-- Report
-- ---------------------------------------------------------------------------
\pset format unaligned
\pset tuples_only on
select case when ok then 'PASS  ' else 'FAIL  ' end || name || coalesce('  — ' || detail, '') from t.results;
select format('%s passed, %s failed', count(*) filter (where ok), count(*) filter (where not ok)) from t.results;
select case when bool_and(ok) then 'ALL PASS' else 'FAILURES' end from t.results;

rollback;
