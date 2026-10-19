-- windsight only: additive tables, no modifications to existing arena tables.
create table if not exists public.windinsight_companies (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create table if not exists public.windinsight_reports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create table if not exists public.windinsight_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  payload jsonb not null,
  created_at timestamptz not null default now()
);
create index if not exists windinsight_reports_user_created on public.windinsight_reports(user_id, created_at desc);
create index if not exists windinsight_searches_user_created on public.windinsight_searches(user_id, created_at desc);
alter table public.windinsight_companies enable row level security;
alter table public.windinsight_reports enable row level security;
alter table public.windinsight_searches enable row level security;
create policy "windinsight_company_owner" on public.windinsight_companies for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "windinsight_reports_owner" on public.windinsight_reports for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "windinsight_searches_owner" on public.windinsight_searches for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
grant select,insert,update,delete on public.windinsight_companies, public.windinsight_reports, public.windinsight_searches to authenticated;
revoke all on public.windinsight_companies, public.windinsight_reports, public.windinsight_searches from anon;
