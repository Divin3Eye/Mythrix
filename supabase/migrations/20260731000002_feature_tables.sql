-- Extend profiles with plan + preferences
alter table public.profiles
  add column if not exists full_name text,
  add column if not exists plan text not null default 'free'
    check (plan in ('free', 'pro')),
  add column if not exists preferences jsonb not null default '{}'::jsonb;

-- Notebooks
create table if not exists public.notebooks (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text,
  color       text,
  icon        text,
  is_favorite boolean not null default false,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists notebooks_user_id_idx on public.notebooks (user_id);
create index if not exists notebooks_user_deleted_idx on public.notebooks (user_id, deleted_at);

-- Collections (folder-like groupings of notebooks)
create table if not exists public.collections (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  description text,
  color       text,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists collections_user_id_idx on public.collections (user_id);

create table if not exists public.collection_notebooks (
  collection_id uuid not null references public.collections(id) on delete cascade,
  notebook_id   uuid not null references public.notebooks(id) on delete cascade,
  added_at      timestamptz not null default now(),
  primary key (collection_id, notebook_id)
);

-- Source files (storage usage backing the Storage page; processing added in Phase A)
create table if not exists public.source_files (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  name        text not null,
  size_bytes  bigint not null default 0,
  created_at  timestamptz not null default now()
);

create index if not exists source_files_user_idx on public.source_files (user_id, notebook_id);

-- Notifications
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  type       text not null default 'info',
  title      text not null,
  body       text,
  link       text,
  read_at    timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_created_idx on public.notifications (user_id, created_at desc);

-- Shares (view-only notebook share links)
create table if not exists public.shares (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  notebook_id uuid not null references public.notebooks(id) on delete cascade,
  token       text not null unique,
  permission  text not null default 'view' check (permission in ('view')),
  expires_at  timestamptz,
  revoked     boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists shares_user_idx on public.shares (user_id);

-- updated_at trigger
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace trigger notebooks_update_updated_at
  before update on public.notebooks
  for each row
  execute function public.update_updated_at_column();

create or replace trigger collections_update_updated_at
  before update on public.collections
  for each row
  execute function public.update_updated_at_column();

-- RLS
alter table public.notebooks enable row level security;
alter table public.collections enable row level security;
alter table public.collection_notebooks enable row level security;
alter table public.source_files enable row level security;
alter table public.notifications enable row level security;
alter table public.shares enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users manage own notebooks' and tablename = 'notebooks') then
    create policy "Users manage own notebooks"
      on public.notebooks for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users manage own collections' and tablename = 'collections') then
    create policy "Users manage own collections"
      on public.collections for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users manage own collection links' and tablename = 'collection_notebooks') then
    create policy "Users manage own collection links"
      on public.collection_notebooks for all
      using (
        exists (
          select 1 from public.collections c
          where c.id = collection_id and c.user_id = auth.uid()
        )
      )
      with check (
        exists (
          select 1 from public.collections c
          where c.id = collection_id and c.user_id = auth.uid()
        )
      );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users manage own source files' and tablename = 'source_files') then
    create policy "Users manage own source files"
      on public.source_files for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users manage own notifications' and tablename = 'notifications') then
    create policy "Users manage own notifications"
      on public.notifications for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users manage own shares' and tablename = 'shares') then
    create policy "Users manage own shares"
      on public.shares for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;
