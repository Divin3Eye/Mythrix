-- Create profiles table linked to auth.users
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      split_part(new.email, '@', 1)
    )
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- Allow users to read/update their own profile
alter table public.profiles enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users can view own profile' and tablename = 'profiles') then
    create policy "Users can view own profile"
      on public.profiles for select
      using (auth.uid() = id);
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users can update own profile' and tablename = 'profiles') then
    create policy "Users can update own profile"
      on public.profiles for update
      using (auth.uid() = id);
  end if;
end $$;
