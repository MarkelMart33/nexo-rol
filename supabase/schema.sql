-- NEXO personal campaigns: one private campaign record per owner.
-- Run in the Supabase SQL Editor for the NEXO Traveller project.

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 50),
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.campaigns enable row level security;

revoke all on table public.campaigns from anon, authenticated;
grant select, insert, update, delete on table public.campaigns to authenticated;

drop policy if exists "Owners can read their campaigns" on public.campaigns;
create policy "Owners can read their campaigns" on public.campaigns for select to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "Owners can create their campaigns" on public.campaigns;
create policy "Owners can create their campaigns" on public.campaigns for insert to authenticated with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update their campaigns" on public.campaigns;
create policy "Owners can update their campaigns" on public.campaigns for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete their campaigns" on public.campaigns;
create policy "Owners can delete their campaigns" on public.campaigns for delete to authenticated using (owner_id = (select auth.uid()));

create or replace function public.set_campaign_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at before update on public.campaigns for each row execute function public.set_campaign_updated_at();

-- NEXO character games (Vampiro, D&D, Tormentas, Cthulhu, Pathfinder) and the campaigns of every system
-- ("campanas"): one private save per owner and game.
create table if not exists public.game_saves (
  owner_id uuid not null references auth.users (id) on delete cascade,
  game text not null check (game in ('vampiro', 'dnd', 'tormentas', 'cthulhu', 'pathfinder', 'campanas')),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, game)
);

-- Existing projects: widen the list of games (safe to run again).
alter table public.game_saves drop constraint if exists game_saves_game_check;
alter table public.game_saves add constraint game_saves_game_check check (game in ('vampiro', 'dnd', 'tormentas', 'cthulhu', 'pathfinder', 'campanas'));

alter table public.game_saves enable row level security;

revoke all on table public.game_saves from anon, authenticated;
grant select, insert, update, delete on table public.game_saves to authenticated;

drop policy if exists "Owners can read their game saves" on public.game_saves;
create policy "Owners can read their game saves" on public.game_saves for select to authenticated using (owner_id = (select auth.uid()));

drop policy if exists "Owners can create their game saves" on public.game_saves;
create policy "Owners can create their game saves" on public.game_saves for insert to authenticated with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can update their game saves" on public.game_saves;
create policy "Owners can update their game saves" on public.game_saves for update to authenticated using (owner_id = (select auth.uid())) with check (owner_id = (select auth.uid()));

drop policy if exists "Owners can delete their game saves" on public.game_saves;
create policy "Owners can delete their game saves" on public.game_saves for delete to authenticated using (owner_id = (select auth.uid()));

drop trigger if exists game_saves_set_updated_at on public.game_saves;
create trigger game_saves_set_updated_at before update on public.game_saves for each row execute function public.set_campaign_updated_at();

-- NEXO usernames: each display name (user_metadata.display_name) belongs to a single account,
-- ignoring case. Triggers on auth.users keep public.usernames in step with the metadata, so a
-- sign-up or rename that takes a name already in use fails. Run this whole file again after updating it.
create table if not exists public.usernames (
  owner_id uuid primary key references auth.users (id) on delete cascade,
  username text not null check (username ~ '^[[:alnum:]_.-]{3,24}$')
);
create unique index if not exists usernames_username_key on public.usernames (lower(username));

-- Nobody reads the table directly; the app asks through username_available().
alter table public.usernames enable row level security;
revoke all on table public.usernames from anon, authenticated;

create or replace function public.sync_username()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text := nullif(trim(new.raw_user_meta_data ->> 'display_name'), '');
begin
  -- Names outside the app's format (for example, users created from the dashboard) are not reserved.
  if wanted is null or wanted !~ '^[[:alnum:]_.-]{3,24}$' then
    delete from public.usernames where owner_id = new.id;
  elsif exists (select 1 from public.usernames u where lower(u.username) = lower(wanted) and u.owner_id <> new.id) then
    raise exception using errcode = '23505', message = 'username_taken';
  else
    insert into public.usernames (owner_id, username) values (new.id, wanted)
    on conflict (owner_id) do update set username = excluded.username;
  end if;
  return new;
end;
$$;

drop trigger if exists usernames_on_signup on auth.users;
create trigger usernames_on_signup after insert on auth.users for each row execute function public.sync_username();
drop trigger if exists usernames_on_update on auth.users;
create trigger usernames_on_update after update of raw_user_meta_data on auth.users for each row
  when (old.raw_user_meta_data ->> 'display_name' is distinct from new.raw_user_meta_data ->> 'display_name')
  execute function public.sync_username();

-- Existing accounts: the first account to have used a name keeps it.
insert into public.usernames (owner_id, username)
select distinct on (lower(trim(raw_user_meta_data ->> 'display_name'))) id, trim(raw_user_meta_data ->> 'display_name')
from auth.users
where trim(raw_user_meta_data ->> 'display_name') ~ '^[[:alnum:]_.-]{3,24}$'
order by lower(trim(raw_user_meta_data ->> 'display_name')), created_at
on conflict do nothing;

-- Lets the sign-up form and the profile check a name before using it.
create or replace function public.username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.usernames u
    where lower(u.username) = lower(trim(name)) and u.owner_id is distinct from (select auth.uid())
  );
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;
