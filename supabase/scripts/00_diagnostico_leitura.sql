-- ADIEM LapTimer: diagnóstico somente leitura.
-- Execute no Supabase SQL Editor antes da migração/deploy.
-- Este script NÃO altera tabelas, políticas nem dados.

-- 1) Confirma tabelas essenciais e colunas existentes.
select table_name, column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in (
    'rt004_sessions', 'rt004_laps', 'rt004_transponders',
    'events', 'tracks', 'karts', 'pilots'
  )
order by table_name, ordinal_position;

-- 2) Confirma se rt004_transponders já tem as colunas usadas pelo portal.
select
  exists (select 1 from information_schema.columns where table_schema='public' and table_name='rt004_transponders' and column_name='transponder_id') as has_transponder_id,
  exists (select 1 from information_schema.columns where table_schema='public' and table_name='rt004_transponders' and column_name='kart_id') as has_kart_id,
  exists (select 1 from information_schema.columns where table_schema='public' and table_name='rt004_transponders' and column_name='portal_kart_id') as has_portal_kart_id,
  exists (select 1 from information_schema.columns where table_schema='public' and table_name='rt004_transponders' and column_name='pilot_id') as has_pilot_id,
  exists (select 1 from information_schema.columns where table_schema='public' and table_name='rt004_transponders' and column_name='active') as has_active;

-- 3) Contagem e amostra de dados; não altera nada.
select 'rt004_sessions' as table_name, count(*) as row_count from public.rt004_sessions
union all select 'rt004_laps', count(*) from public.rt004_laps
union all select 'rt004_transponders', count(*) from public.rt004_transponders
union all select 'events', count(*) from public.events
union all select 'tracks', count(*) from public.tracks
union all select 'karts', count(*) from public.karts
union all select 'pilots', count(*) from public.pilots;

-- 4) Verifica publicação Realtime para rt004_laps.
select pubname, schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime'
  and schemaname = 'public'
  and tablename = 'rt004_laps';

-- 5) Estado RLS das tabelas usadas pelo portal.
-- Se rowsecurity=false, o acesso via chave pública não está protegido por RLS.
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relkind = 'r'
  and c.relname in ('rt004_sessions','rt004_laps','rt004_transponders','events','tracks','karts','pilots')
order by c.relname;
