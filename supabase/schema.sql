-- Run this in the Supabase SQL editor of the "Engagement" project.
-- Safe to run again: it only creates/updates what is missing.

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------- RSVPs

create table if not exists public.rsvps (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  attending boolean not null,
  locale text not null default 'en' check (locale in ('en', 'ar')),
  created_at timestamptz not null default now()
);

alter table public.rsvps enable row level security;

-- Guests can submit an RSVP but cannot read the list (view it in the Supabase dashboard).
drop policy if exists "anyone can rsvp" on public.rsvps;
create policy "anyone can rsvp" on public.rsvps
  for insert to anon, authenticated with check (true);

-- ---------------------------------------------------------------- Guestbook wishes

create table if not exists public.wishes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 100),
  message text not null check (char_length(message) between 1 and 1000),
  locale text not null default 'en' check (locale in ('en', 'ar')),
  created_at timestamptz not null default now()
);

-- Each wish has a secret "owner token" kept in the author's browser.
-- Only its SHA-256 hash is stored, so the raw token never leaves the author's device.
alter table public.wishes add column if not exists owner_token text;
alter table public.wishes add column if not exists updated_at timestamptz;

create or replace function public.wishes_hash_owner_token()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.owner_token is not null then
    new.owner_token := encode(extensions.digest(new.owner_token, 'sha256'), 'hex');
  end if;
  return new;
end $$;

drop trigger if exists wishes_hash_owner_token on public.wishes;
create trigger wishes_hash_owner_token
  before insert on public.wishes
  for each row execute function public.wishes_hash_owner_token();

alter table public.wishes enable row level security;

-- Guests can post wishes and everyone can read them in the guestbook.
drop policy if exists "anyone can post wishes" on public.wishes;
create policy "anyone can post wishes" on public.wishes
  for insert to anon, authenticated with check (true);

drop policy if exists "anyone can read wishes" on public.wishes;
create policy "anyone can read wishes" on public.wishes
  for select to anon, authenticated using (true);

-- Guests may only read/write the public columns directly; editing and deleting
-- go through the functions below, which check the owner token.
revoke all on public.wishes from anon, authenticated;
grant select (id, name, message, locale, created_at, updated_at) on public.wishes to anon, authenticated;
grant insert (name, message, locale, owner_token) on public.wishes to anon, authenticated;

create or replace function public.update_wish(p_id uuid, p_token text, p_name text, p_message text)
returns table (id uuid, name text, message text, locale text, created_at timestamptz, updated_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  update public.wishes w
     set name = left(btrim(p_name), 100),
         message = left(btrim(p_message), 1000),
         updated_at = now()
   where w.id = p_id
     and w.owner_token = encode(extensions.digest(p_token, 'sha256'), 'hex')
  returning w.id, w.name, w.message, w.locale, w.created_at, w.updated_at;
end $$;

create or replace function public.delete_wish(p_id uuid, p_token text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  n int;
begin
  delete from public.wishes w
   where w.id = p_id
     and w.owner_token = encode(extensions.digest(p_token, 'sha256'), 'hex');
  get diagnostics n = row_count;
  return n > 0;
end $$;

revoke all on function public.update_wish(uuid, text, text, text) from public;
revoke all on function public.delete_wish(uuid, text) from public;
grant execute on function public.update_wish(uuid, text, text, text) to anon, authenticated;
grant execute on function public.delete_wish(uuid, text) to anon, authenticated;

-- Live-update the guestbook for everyone when a wish is added, edited or deleted.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'wishes'
  ) then
    alter publication supabase_realtime add table public.wishes;
  end if;
end $$;
