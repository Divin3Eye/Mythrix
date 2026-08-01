-- Fix source_files: drop policies, drop table, recreate with full schema
-- This is safe for a new project with no real source data

-- Drop existing policies first
drop policy if exists "Users manage own source files" on public.source_files;

-- Drop table (cascades to indexes)
drop table if exists public.source_files cascade;

-- Recreate with full schema
create table public.source_files (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  name        text not null default '',
  url         text,
  size_bytes  bigint not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists source_files_user_idx on public.source_files (user_id, notebook_id);

alter table public.source_files enable row level security;

create policy "Users manage own source files"
  on public.source_files for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

select pg_notify('pgrst', 'reload schema');
