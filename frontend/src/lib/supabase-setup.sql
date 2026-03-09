-- ═══════════════════════════════════════════════════════════════════════════
-- PropInvest AI — Supabase Database Setup
-- Run this entire script in: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. Create saved_deals table
create table if not exists public.saved_deals (
  id         text        primary key,
  user_id    uuid        not null references auth.users(id) on delete cascade,
  name       text        not null,
  saved_at   timestamptz not null default now(),
  input      jsonb       not null,
  result     jsonb       not null
);

-- 2. Row Level Security — users can only see their own deals
alter table public.saved_deals enable row level security;

create policy "Users can select their own deals"
  on public.saved_deals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own deals"
  on public.saved_deals for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own deals"
  on public.saved_deals for delete
  using (auth.uid() = user_id);

create policy "Users can update their own deals"
  on public.saved_deals for update
  using (auth.uid() = user_id);

-- 3. Index for fast user lookups
create index if not exists saved_deals_user_id_idx
  on public.saved_deals (user_id, saved_at desc);

-- 4. Optional: profiles table (for future use — display name, plan tier)
create table if not exists public.profiles (
  id         uuid        primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  avatar_url text,
  plan       text        not null default 'free',  -- 'free' | 'pro'
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- 5. Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ═══════════════════════════════════════════════════════════════════════════
-- Done! Your database is ready.
-- Next: enable Google OAuth in Supabase Dashboard → Authentication → Providers
-- ═══════════════════════════════════════════════════════════════════════════
