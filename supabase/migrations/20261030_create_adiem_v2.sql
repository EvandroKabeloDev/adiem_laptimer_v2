-- ADIEM Motorsport Suite V2
-- Não altera nem renomeia tabelas existentes do MVP.
-- Todas as tabelas novas terminam em _v2.
-- Execute no SQL Editor do Supabase somente uma vez; o script é idempotente.

create extension if not exists pgcrypto;

create table if not exists public.clients_v2 (
 id uuid primary key default gen_random_uuid(), name text not null, email text, phone text,
 city text, state text, country text default 'Brasil', status text not null default 'Ativo'
   check (status in ('Ativo','Bloqueado','Expirado','Temporário')),
 expires_at timestamptz, company_name text, logo_url text, brand_color text default '#c9ff42',
 notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.admin_users_v2 (
 id uuid primary key default gen_random_uuid(), first_name text not null, last_name text,
 email text not null, phone text, city text, state text, country text default 'Brasil',
 role text not null default 'Suporte Técnico' check (role in ('Administrador Geral','Gestão de acesso Cliente','Gestão de Dispositivos','Suporte Técnico')),
 status text not null default 'Temporário' check (status in ('Ativo','Bloqueado','Expirado','Temporário')),
 expires_at timestamptz, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.devices_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 device_type text not null check (device_type in ('Leitor','Transponder')), device_code text not null,
 rasp_id text, batch_code text, registered_at date default current_date,
 technology text, status text not null default 'Ativo', last_seen_at timestamptz,
 last_reader_code text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(device_type,device_code)
);
create table if not exists public.pilots_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 first_name text not null, last_name text, sex text, birth_date date, weight_kg numeric(6,2),
 phone text, email text, address text, guardian_name text, guardian_phone text, guardian_email text,
 category text, team_start_date date, suit_size text, helmet_size text, glove_size text, shoe_size text,
 avatar_url text, photo_url text, status text not null default 'Ativo', notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.karts_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 number text not null, chassis_name text, chassis_model text, chassis_notes text, chassis_year integer,
 engine_name text, engine_model text, engine_year integer, owner_name text, owner_type text,
 category text, status text not null default 'Ativo', archived_at timestamptz, notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.tracks_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 name text not null, country text default 'Brasil', state text, city text, kartodrome text,
 is_default boolean not null default false, status text not null default 'Ativo', notes text,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.track_layouts_v2 (
 id uuid primary key default gen_random_uuid(), track_id uuid not null references public.tracks_v2(id) on delete cascade,
 name text not null, length_m numeric(8,2), direction text check (direction in ('Horário','Anti-horário')),
 left_corners integer, right_corners integer, straights integer, sensor_main_location text,
 sensor_s1_location text, sensor_s2_location text, sensor_s3_location text,
 elevation text, inclination text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.events_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 name text not null, event_date date not null default current_date, track_id uuid references public.tracks_v2(id) on delete set null,
 layout_id uuid references public.track_layouts_v2(id) on delete set null, session_mode text not null default 'Evento' check(session_mode in ('Evento','Telemetria Transponder')),
 track_condition text, ambient_temp_min numeric(5,2), ambient_temp_max numeric(5,2),
 track_temp_min numeric(5,2), track_temp_max numeric(5,2), started_at timestamptz, finished_at timestamptz,
 status text not null default 'Planejado' check(status in ('Planejado','Em andamento','Finalizado','Arquivado')),
 notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.event_entries_v2 (
 id uuid primary key default gen_random_uuid(), event_id uuid not null references public.events_v2(id) on delete cascade,
 pilot_id uuid references public.pilots_v2(id) on delete set null, kart_id uuid references public.karts_v2(id) on delete set null,
 transponder_id uuid references public.devices_v2(id) on delete set null, category text, started_at timestamptz,
 finished_at timestamptz, notes text, created_at timestamptz not null default now()
);
create table if not exists public.setups_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 kart_id uuid references public.karts_v2(id) on delete set null, event_id uuid references public.events_v2(id) on delete set null,
 name text not null, version integer not null default 1, setup_data jsonb not null default '{}'::jsonb,
 notes text, created_by text, created_at timestamptz not null default now()
);
create table if not exists public.maintenance_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 kart_id uuid not null references public.karts_v2(id) on delete cascade, event_id uuid references public.events_v2(id) on delete set null,
 component text not null, maintenance_date timestamptz not null default now(),
 usage_limit_hours numeric(10,2), usage_limit_laps integer, usage_limit_km numeric(10,2),
 details text, parts_used jsonb not null default '[]'::jsonb, responsible text,
 cost numeric(12,2) not null default 0, status text not null default 'Concluída',
 created_at timestamptz not null default now()
);
create table if not exists public.inventory_items_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 name text not null, manufacturer text, technical_description text, batch_code text,
 entry_date date default current_date, condition_percent integer not null default 0 check(condition_percent between 0 and 100),
 unit_cost numeric(12,2) not null default 0, quantity numeric(12,3) not null default 0,
 minimum_quantity numeric(12,3) not null default 0, kart_id uuid references public.karts_v2(id) on delete set null,
 payment_status text not null default 'Aguardando Pagamento' check(payment_status in ('Pago','Aguardando Pagamento','Acertar')),
 notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.inventory_movements_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 item_id uuid not null references public.inventory_items_v2(id) on delete restrict,
 movement_type text not null check(movement_type in ('Entrada','Saída','Devolução','Ajuste')),
 quantity numeric(12,3) not null check(quantity > 0), movement_date timestamptz not null default now(),
 kart_id uuid references public.karts_v2(id) on delete set null, event_id uuid references public.events_v2(id) on delete set null,
 unit_cost numeric(12,2) not null default 0, reason text, notes text, created_at timestamptz not null default now()
);
create table if not exists public.financial_entries_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 entry_type text not null check(entry_type in ('Receita','Despesa')), description text not null,
 category text, amount numeric(12,2) not null check(amount >= 0), due_date date, paid_at timestamptz,
 payment_status text not null default 'Aguardando Pagamento' check(payment_status in ('Pago','Aguardando Pagamento','Acertar','Cancelado')),
 kart_id uuid references public.karts_v2(id) on delete set null, event_id uuid references public.events_v2(id) on delete set null,
 supplier text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists public.lap_notes_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 rt004_lap_id bigint, session_id uuid, note text not null, pilot_name text, kart_number text,
 created_at timestamptz not null default now()
);
create table if not exists public.session_changes_v2 (
 id uuid primary key default gen_random_uuid(), client_id uuid references public.clients_v2(id) on delete set null,
 session_id uuid, change_type text not null, pilot_id uuid references public.pilots_v2(id) on delete set null,
 kart_id uuid references public.karts_v2(id) on delete set null, transponder_id uuid references public.devices_v2(id) on delete set null,
 details jsonb not null default '{}'::jsonb, effective_lap_number integer, created_at timestamptz not null default now()
);
create table if not exists public.audit_log_v2 (
 id uuid primary key default gen_random_uuid(), actor text, action text not null, entity_type text not null,
 entity_id text, details jsonb not null default '{}'::jsonb, created_at timestamptz not null default now()
);

create index if not exists idx_devices_v2_client on public.devices_v2(client_id);
create index if not exists idx_pilots_v2_client on public.pilots_v2(client_id);
create index if not exists idx_karts_v2_client on public.karts_v2(client_id);
create index if not exists idx_events_v2_client_date on public.events_v2(client_id,event_date desc);
create index if not exists idx_event_entries_v2_event on public.event_entries_v2(event_id);
create index if not exists idx_setups_v2_kart on public.setups_v2(kart_id,created_at desc);
create index if not exists idx_maintenance_v2_kart on public.maintenance_v2(kart_id,maintenance_date desc);
create index if not exists idx_inventory_v2_client on public.inventory_items_v2(client_id);
create index if not exists idx_inventory_movements_v2_item on public.inventory_movements_v2(item_id,movement_date desc);
create index if not exists idx_financial_entries_v2_client_due on public.financial_entries_v2(client_id,due_date);
create index if not exists idx_lap_notes_v2_session on public.lap_notes_v2(session_id);
create index if not exists idx_session_changes_v2_session on public.session_changes_v2(session_id);

-- Atualiza updated_at para tabelas mutáveis.
create or replace function public.set_updated_at_v2() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;
do $$
declare t text;
begin
 foreach t in array array['clients_v2','admin_users_v2','devices_v2','pilots_v2','karts_v2','tracks_v2','track_layouts_v2','events_v2','inventory_items_v2','financial_entries_v2'] loop
  execute format('drop trigger if exists trg_%I_updated_at on public.%I',t,t);
  execute format('create trigger trg_%I_updated_at before update on public.%I for each row execute function public.set_updated_at_v2()',t,t);
 end loop;
end $$;

-- A API V2 usa service-role no servidor. Não habilitamos políticas públicas anon:
-- adicionar autenticação/isolamento por cliente antes de expor a aplicação na internet.
