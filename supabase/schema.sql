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

-- ───────────── Campañas compartidas ─────────────
-- Quien dirige comparte una campaña con un código; los jugadores se unen con él desde su cuenta, dejan
-- su ficha a la vista de quien dirige (solo lectura) y las tiradas de todos llegan en directo.
-- Las notas, los PNJ y el combate de quien dirige no salen de su cuenta: aquí solo va lo que elige mostrar.
create table if not exists public.shared_campaigns (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  campaign_id text not null check (char_length(campaign_id) between 1 and 64),
  system text not null check (system ~ '^[a-z0-9-]{1,24}$'),
  name text not null default '' check (char_length(name) <= 80),
  owner_name text not null default '' check (char_length(owner_name) <= 40),
  code text not null check (code ~ '^[A-Z2-9]{8}$'),
  info jsonb not null default '{}'::jsonb check (octet_length(info::text) <= 150000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, campaign_id)
);
create unique index if not exists shared_campaigns_code_key on public.shared_campaigns (code);

create table if not exists public.shared_members (
  campaign uuid not null references public.shared_campaigns (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  display_name text not null default '' check (char_length(display_name) <= 40),
  sheet_id text not null default '' check (char_length(sheet_id) <= 64),
  sheet_name text not null default '' check (char_length(sheet_name) <= 80),
  summary text not null default '' check (char_length(summary) <= 200),
  sheet jsonb check (sheet is null or octet_length(sheet::text) <= 400000),
  joined_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (campaign, user_id)
);
create index if not exists shared_members_user_idx on public.shared_members (user_id);

create table if not exists public.shared_rolls (
  id bigint generated always as identity primary key,
  campaign uuid not null references public.shared_campaigns (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  who text not null default '' check (char_length(who) <= 60),
  title text not null default '' check (char_length(title) <= 120),
  total text not null default '' check (char_length(total) <= 40),
  detail text not null default '' check (char_length(detail) <= 400),
  tone text not null default '' check (tone ~ '^[a-z-]{0,16}$'),
  created_at timestamptz not null default now()
);
create index if not exists shared_rolls_campaign_idx on public.shared_rolls (campaign, id desc);

-- Las políticas preguntan «¿es mía?» y «¿estoy dentro?» con estas funciones, que leen las tablas
-- sin pasar por sus políticas (si no, unas se llamarían a otras sin fin).
create or replace function public.shared_is_owner(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.shared_campaigns c where c.id = target and c.owner_id = (select auth.uid()));
$$;

create or replace function public.shared_is_member(target uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.shared_members m where m.campaign = target and m.user_id = (select auth.uid()));
$$;

alter table public.shared_campaigns enable row level security;
alter table public.shared_members enable row level security;
alter table public.shared_rolls enable row level security;

-- Nadie escribe a mano en estas tablas: compartir, unirse y dejar la ficha van por las funciones de más abajo.
-- El código de invitación no se puede leer de la tabla: solo lo recibe quien dirige, de share_campaign.
revoke all on table public.shared_campaigns from anon, authenticated;
grant select (id, owner_id, campaign_id, system, name, owner_name, info, created_at, updated_at) on table public.shared_campaigns to authenticated;
grant delete on table public.shared_campaigns to authenticated;

revoke all on table public.shared_members from anon, authenticated;
grant select, delete on table public.shared_members to authenticated;

revoke all on table public.shared_rolls from anon, authenticated;
grant select on table public.shared_rolls to authenticated;
grant insert (campaign, who, title, total, detail, tone) on table public.shared_rolls to authenticated;

drop policy if exists "Party can read their shared campaigns" on public.shared_campaigns;
create policy "Party can read their shared campaigns" on public.shared_campaigns for select to authenticated
  using (owner_id = (select auth.uid()) or public.shared_is_member(id));

drop policy if exists "Owners can stop sharing" on public.shared_campaigns;
create policy "Owners can stop sharing" on public.shared_campaigns for delete to authenticated
  using (owner_id = (select auth.uid()));

-- La ficha de un jugador la ven él y quien dirige; los demás jugadores solo reciben nombres (shared_party).
drop policy if exists "Members and owners can read memberships" on public.shared_members;
create policy "Members and owners can read memberships" on public.shared_members for select to authenticated
  using (user_id = (select auth.uid()) or public.shared_is_owner(campaign));

drop policy if exists "Members can leave and owners can remove" on public.shared_members;
create policy "Members can leave and owners can remove" on public.shared_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.shared_is_owner(campaign));

drop policy if exists "Party can read rolls" on public.shared_rolls;
create policy "Party can read rolls" on public.shared_rolls for select to authenticated
  using (public.shared_is_owner(campaign) or public.shared_is_member(campaign));

drop policy if exists "Party can add their rolls" on public.shared_rolls;
create policy "Party can add their rolls" on public.shared_rolls for insert to authenticated
  with check (user_id = (select auth.uid()) and (public.shared_is_owner(campaign) or public.shared_is_member(campaign)));

drop trigger if exists shared_campaigns_set_updated_at on public.shared_campaigns;
create trigger shared_campaigns_set_updated_at before update on public.shared_campaigns for each row execute function public.set_campaign_updated_at();
drop trigger if exists shared_members_set_updated_at on public.shared_members;
create trigger shared_members_set_updated_at before update on public.shared_members for each row execute function public.set_campaign_updated_at();

-- Cada campaña conserva sus últimas 100 tiradas.
create or replace function public.trim_shared_rolls()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.shared_rolls r
  where r.campaign = new.campaign
    and r.id <= (select o.id from public.shared_rolls o where o.campaign = new.campaign order by o.id desc offset 100 limit 1);
  return null;
end;
$$;
drop trigger if exists shared_rolls_trim on public.shared_rolls;
create trigger shared_rolls_trim after insert on public.shared_rolls for each row execute function public.trim_shared_rolls();

-- Nombre de usuario de quien llama, tal como lo guarda su cuenta.
create or replace function public.shared_caller_name()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select left(nullif(trim(u.raw_user_meta_data ->> 'display_name'), ''), 40) from auth.users u where u.id = (select auth.uid())), '');
$$;

-- Comparte una campaña propia (o pone al día su nombre y lo que ven los jugadores) y devuelve su código.
-- Volver a llamarla con la misma campaña no crea otra: devuelve la que ya había.
create or replace function public.share_campaign(p_campaign text, p_system text, p_name text, p_info jsonb)
returns table (id uuid, code text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  camp public.shared_campaigns%rowtype;
  fresh text;
  letters constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea;
begin
  if me is null then
    raise exception using errcode = '28000', message = 'not_signed_in';
  end if;
  select * into camp from public.shared_campaigns c where c.owner_id = me and c.campaign_id = p_campaign;
  if camp.id is not null then
    update public.shared_campaigns c
      set name = left(coalesce(p_name, ''), 80), info = coalesce(p_info, '{}'::jsonb), owner_name = public.shared_caller_name()
      where c.id = camp.id;
    return query select camp.id, camp.code;
    return;
  end if;
  if (select count(*) from public.shared_campaigns c where c.owner_id = me) >= 40 then
    raise exception using errcode = 'P0001', message = 'too_many_shared';
  end if;
  loop
    bytes := uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid());
    fresh := '';
    for i in 0..7 loop
      -- Se saltan los bytes de versión y variante del uuid, que no son aleatorios.
      fresh := fresh || substr(letters, 1 + (get_byte(bytes, case when i < 6 then i else i + 4 end) % 32), 1);
    end loop;
    exit when not exists (select 1 from public.shared_campaigns c where c.code = fresh);
  end loop;
  return query
    insert into public.shared_campaigns as c (owner_id, campaign_id, system, name, owner_name, code, info)
    values (me, p_campaign, p_system, left(coalesce(p_name, ''), 80), public.shared_caller_name(), fresh, coalesce(p_info, '{}'::jsonb))
    returning c.id, c.code;
end;
$$;

-- Pone al día el nombre y lo que ven los jugadores de una campaña que ya se comparte, y devuelve su código.
-- Si ya no se comparte (o no es de quien llama) no hace nada y devuelve nulo: nunca la vuelve a compartir.
create or replace function public.update_shared_campaign(p_id uuid, p_name text, p_info jsonb)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  kept text;
begin
  update public.shared_campaigns c
    set name = left(coalesce(p_name, ''), 80), info = coalesce(p_info, '{}'::jsonb), owner_name = public.shared_caller_name()
    where c.id = p_id and c.owner_id = (select auth.uid())
    returning c.code into kept;
  return kept;
end;
$$;

-- Cambia el código de una campaña propia: el anterior deja de servir (quien ya está dentro, sigue dentro).
create or replace function public.renew_share_code(p_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  fresh text;
  letters constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea;
begin
  if me is null or not exists (select 1 from public.shared_campaigns c where c.id = p_id and c.owner_id = me) then
    raise exception using errcode = '42501', message = 'not_owner';
  end if;
  loop
    bytes := uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid());
    fresh := '';
    for i in 0..7 loop
      fresh := fresh || substr(letters, 1 + (get_byte(bytes, case when i < 6 then i else i + 4 end) % 32), 1);
    end loop;
    exit when not exists (select 1 from public.shared_campaigns c where c.code = fresh);
  end loop;
  update public.shared_campaigns c set code = fresh where c.id = p_id;
  return fresh;
end;
$$;

-- Entra en una campaña con su código. Devuelve la campaña; «own» avisa de que es de quien llama.
create or replace function public.join_campaign(p_code text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
  wanted text := upper(regexp_replace(coalesce(p_code, ''), '[^A-Za-z0-9]', '', 'g'));
  camp public.shared_campaigns%rowtype;
begin
  if me is null then
    raise exception using errcode = '28000', message = 'not_signed_in';
  end if;
  select * into camp from public.shared_campaigns c where c.code = wanted;
  if camp.id is null then
    raise exception using errcode = 'P0002', message = 'code_not_found';
  end if;
  if camp.owner_id = me then
    return jsonb_build_object('id', camp.id, 'system', camp.system, 'name', camp.name, 'own', true);
  end if;
  if not exists (select 1 from public.shared_members m where m.campaign = camp.id and m.user_id = me) then
    if (select count(*) from public.shared_members m where m.campaign = camp.id) >= 12 then
      raise exception using errcode = 'P0001', message = 'campaign_full';
    end if;
    if (select count(*) from public.shared_members m where m.user_id = me) >= 40 then
      raise exception using errcode = 'P0001', message = 'too_many_joined';
    end if;
  end if;
  insert into public.shared_members as m (campaign, user_id, display_name)
  values (camp.id, me, public.shared_caller_name())
  on conflict (campaign, user_id) do update set display_name = excluded.display_name;
  return jsonb_build_object('id', camp.id, 'system', camp.system, 'name', camp.name, 'own', false);
end;
$$;

-- El jugador deja (o retira, con p_sheet nulo) su ficha a la vista de quien dirige. Devuelve si sigue en la campaña.
create or replace function public.share_sheet(p_campaign uuid, p_sheet jsonb, p_name text, p_summary text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  me uuid := (select auth.uid());
begin
  update public.shared_members m
    set sheet = p_sheet,
        sheet_id = case when p_sheet is null then '' else left(coalesce(p_sheet ->> 'id', ''), 64) end,
        sheet_name = case when p_sheet is null then '' else left(coalesce(p_name, ''), 80) end,
        summary = case when p_sheet is null then '' else left(coalesce(p_summary, ''), 200) end,
        display_name = public.shared_caller_name()
    where m.campaign = p_campaign and m.user_id = me;
  return found;
end;
$$;

-- Quién juega en la campaña, para todos los que están en ella: nombres y personaje, nunca la ficha.
create or replace function public.shared_party(p_id uuid)
returns table (user_id uuid, display_name text, sheet_name text, summary text, is_owner boolean)
language sql
stable
security definer
set search_path = ''
as $$
  select c.owner_id, c.owner_name, ''::text, ''::text, true
  from public.shared_campaigns c
  where c.id = p_id and (public.shared_is_owner(p_id) or public.shared_is_member(p_id))
  union all
  select m.user_id, m.display_name, m.sheet_name, m.summary, false
  from public.shared_members m
  where m.campaign = p_id and (public.shared_is_owner(p_id) or public.shared_is_member(p_id));
$$;

revoke all on function public.shared_is_owner(uuid) from public, anon;
revoke all on function public.shared_is_member(uuid) from public, anon;
revoke all on function public.shared_caller_name() from public, anon;
revoke all on function public.trim_shared_rolls() from public, anon, authenticated;
revoke all on function public.share_campaign(text, text, text, jsonb) from public, anon;
revoke all on function public.update_shared_campaign(uuid, text, jsonb) from public, anon;
revoke all on function public.renew_share_code(uuid) from public, anon;
revoke all on function public.join_campaign(text) from public, anon;
revoke all on function public.share_sheet(uuid, jsonb, text, text) from public, anon;
revoke all on function public.shared_party(uuid) from public, anon;
grant execute on function public.shared_is_owner(uuid) to authenticated;
grant execute on function public.shared_is_member(uuid) to authenticated;
grant execute on function public.shared_caller_name() to authenticated;
grant execute on function public.share_campaign(text, text, text, jsonb) to authenticated;
grant execute on function public.update_shared_campaign(uuid, text, jsonb) to authenticated;
grant execute on function public.renew_share_code(uuid) to authenticated;
grant execute on function public.join_campaign(text) to authenticated;
grant execute on function public.share_sheet(uuid, jsonb, text, text) to authenticated;
grant execute on function public.shared_party(uuid) to authenticated;

-- Tiradas en directo: Realtime avisa a cada miembro de las tiradas nuevas de sus campañas.
do $$
begin
  if exists (select 1 from pg_catalog.pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_catalog.pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'shared_rolls') then
    alter publication supabase_realtime add table public.shared_rolls;
  end if;
end;
$$;
