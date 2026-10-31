-- Habilita eventos INSERT de rt004_laps no Supabase Realtime.
-- Pode ser executado repetidamente sem erro de tabela duplicada.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'rt004_laps'
  ) then
    alter publication supabase_realtime add table public.rt004_laps;
  end if;
end $$;
