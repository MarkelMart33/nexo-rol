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

-- NEXO character games (Vampiro, D&D, Tormentas, Cthulhu): one private save per owner and game.
create table if not exists public.game_saves (
  owner_id uuid not null references auth.users (id) on delete cascade,
  game text not null check (game in ('vampiro', 'dnd', 'tormentas', 'cthulhu')),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (owner_id, game)
);

-- Existing projects: widen the list of games (safe to run again).
alter table public.game_saves drop constraint if exists game_saves_game_check;
alter table public.game_saves add constraint game_saves_game_check check (game in ('vampiro', 'dnd', 'tormentas', 'cthulhu'));

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
