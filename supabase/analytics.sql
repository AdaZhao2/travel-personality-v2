-- Run this file once in the Supabase SQL editor.
create table if not exists public.quiz_events (
  id uuid primary key,
  session_id uuid not null,
  attempt_id uuid,
  event_type text not null check (event_type in (
    'quiz_started', 'answer_selected', 'quiz_completed', 'quiz_restarted', 'result_shared'
  )),
  question_id text check (question_id is null or length(question_id) between 1 and 64),
  option_id text check (option_id is null or option_id in ('a', 'b', 'c', 'd')),
  persona_id text check (persona_id is null or persona_id in (
    'chaos-traveller', 'food-hunter', 'luxury-escaper', 'main-character',
    'fomo-rocketeer', 'soft-life-migrant', 'social-compass', 'budget-alchemist',
    'planet-earth-expat'
  )),
  scores jsonb,
  answer_path text check (answer_path is null or answer_path ~ '^[a-d]{16}$'),
  entry_source text check (entry_source is null or entry_source in ('direct', 'invitation', 'shared_result')),
  share_channel text check (share_channel is null or share_channel in ('result_link', 'invite_link', 'poster', 'poster_download')),
  created_at timestamptz not null default now(),
  check (
    (event_type = 'quiz_started' and attempt_id is not null)
    or (event_type = 'answer_selected' and attempt_id is not null and question_id is not null and option_id is not null)
    or (event_type = 'quiz_completed' and attempt_id is not null and persona_id is not null and scores is not null and answer_path is not null)
    or (event_type = 'quiz_restarted' and attempt_id is not null)
    or (event_type = 'result_shared' and persona_id is not null and share_channel is not null)
  )
);

create index if not exists quiz_events_created_at_idx on public.quiz_events (created_at desc);
create index if not exists quiz_events_attempt_idx on public.quiz_events (attempt_id, event_type);
create index if not exists quiz_events_persona_idx on public.quiz_events (persona_id) where persona_id is not null;

alter table public.quiz_events enable row level security;
revoke all on table public.quiz_events from anon, authenticated;
grant insert on table public.quiz_events to anon, authenticated;

drop policy if exists "anonymous analytics inserts" on public.quiz_events;
create policy "anonymous analytics inserts"
on public.quiz_events for insert
to anon, authenticated
with check (
  session_id is not null
  and event_type in ('quiz_started', 'answer_selected', 'quiz_completed', 'quiz_restarted', 'result_shared')
  and created_at <= now() + interval '1 minute'
);

comment on table public.quiz_events is
  'Anonymous Travel Personality usage events. Public clients can insert only; reads stay private.';

-- Usage and completion trend.
create or replace view public.analytics_daily_usage as
select
  date_trunc('day', created_at) as day,
  count(distinct session_id) filter (where event_type = 'quiz_started') as anonymous_visitors,
  count(distinct attempt_id) filter (where event_type = 'quiz_started') as starts,
  count(distinct attempt_id) filter (where event_type = 'quiz_completed') as completions,
  round(
    100.0 * count(distinct attempt_id) filter (where event_type = 'quiz_completed')
    / nullif(count(distinct attempt_id) filter (where event_type = 'quiz_started'), 0),
    2
  ) as completion_rate,
  count(*) filter (where event_type = 'result_shared') as shares
from public.quiz_events
group by 1
order by 1 desc;

-- Real persona distribution, including the JOKER percentage.
create or replace view public.analytics_persona_distribution as
select
  persona_id,
  count(distinct attempt_id) as completions,
  round(100.0 * count(distinct attempt_id) / sum(count(distinct attempt_id)) over (), 2) as percentage
from public.quiz_events
where event_type = 'quiz_completed'
group by persona_id
order by completions desc;

-- Final submitted choices. This reads answer_path from completion events so going back
-- and changing an answer does not count both choices.
create or replace view public.analytics_answer_distribution as
with positions(question_number, question_id) as (values
  (1, 'whatever'), (2, 'holiday'), (3, 'leave-now'), (4, 'sold-out'),
  (5, 'photo-dump'), (6, 'queue'), (7, 'group-chat'), (8, 'upgrade'),
  (9, 'viral'), (10, 'lost'), (11, 'dress-code'), (12, 'menu'),
  (13, 'rain'), (14, 'late'), (15, 'main-character'), (16, 'final-button')
)
select
  question_number,
  question_id,
  substr(answer_path, question_number, 1) as option_id,
  count(*) as selections,
  round(100.0 * count(*) / sum(count(*)) over (partition by question_number), 2) as percentage
from public.quiz_events
cross join positions
where event_type = 'quiz_completed' and answer_path is not null
group by question_number, question_id, substr(answer_path, question_number, 1)
order by question_number, option_id;

-- Compare JOKER answers with all completed tests to find which choices over-index.
create or replace view public.analytics_joker_answers as
with positions(question_number, question_id) as (values
  (1, 'whatever'), (2, 'holiday'), (3, 'leave-now'), (4, 'sold-out'),
  (5, 'photo-dump'), (6, 'queue'), (7, 'group-chat'), (8, 'upgrade'),
  (9, 'viral'), (10, 'lost'), (11, 'dress-code'), (12, 'menu'),
  (13, 'rain'), (14, 'late'), (15, 'main-character'), (16, 'final-button')
), expanded as (
  select
    question_number,
    question_id,
    substr(answer_path, question_number, 1) as option_id,
    persona_id
  from public.quiz_events
  cross join positions
  where event_type = 'quiz_completed' and answer_path is not null
), counts as (
  select
    question_number,
    question_id,
    option_id,
    count(*) as all_count,
    count(*) filter (where persona_id = 'chaos-traveller') as joker_count
  from expanded
  group by question_number, question_id, option_id
)
select
  question_number,
  question_id,
  option_id,
  round(100.0 * joker_count / nullif(sum(joker_count) over (partition by question_number), 0), 2) as joker_percentage,
  round(100.0 * all_count / sum(all_count) over (partition by question_number), 2) as overall_percentage
from counts
order by question_number, option_id;

revoke all on public.analytics_daily_usage from anon, authenticated;
revoke all on public.analytics_persona_distribution from anon, authenticated;
revoke all on public.analytics_answer_distribution from anon, authenticated;
revoke all on public.analytics_joker_answers from anon, authenticated;
