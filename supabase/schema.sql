create table if not exists public.husti_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  app_state jsonb not null default '{}'::jsonb,
  inserted_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.husti_user_state enable row level security;

drop policy if exists "Users can read their own HUSTI state" on public.husti_user_state;
create policy "Users can read their own HUSTI state"
on public.husti_user_state
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own HUSTI state" on public.husti_user_state;
create policy "Users can insert their own HUSTI state"
on public.husti_user_state
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own HUSTI state" on public.husti_user_state;
create policy "Users can update their own HUSTI state"
on public.husti_user_state
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own HUSTI state" on public.husti_user_state;
create policy "Users can delete their own HUSTI state"
on public.husti_user_state
for delete
using (auth.uid() = user_id);
