-- Habilita Realtime para a tabela de voltas do RT004.
-- Idempotente: não falha se a tabela já estiver na publication.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rt004_laps'
  ) then
    alter publication supabase_realtime add table public.rt004_laps;
  end if;
end $$;
