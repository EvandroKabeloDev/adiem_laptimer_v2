# ADIEM Motorsport Suite V2

Novo frontend isolado. Preserva o backend MQTT, firmware e tabelas atuais. Todas as tabelas novas criadas por esta entrega terminam em `_v2`. A telemetria consulta a tabela já existente `public.rt004_laps` sem modificá-la.

## Antes de publicar
**Esta versão é um scaffold funcional inicial, não a suíte completa pronta para produção.** Inclui navegação, leitura de telemetria RT004 e listagem/inserção genérica para cadastros V2. Ainda faltam autenticação, autorização por cliente, edição/exclusão lógica, associação completa entre módulos, dashboards de manutenção, relatórios finais e classificação por piloto/categoria.

A rota `/api/data` usa `SUPABASE_SERVICE_ROLE_KEY` no servidor. Sem autenticação, qualquer visitante que alcance a aplicação pode acionar as operações expostas pela API. Use apenas em ambiente de teste controlado; não publique para usuários finais até implementar autenticação e autorização. Não coloque service-role em variável `NEXT_PUBLIC_*`.

## Deploy via GitHub + EasyPanel
1. Crie um repositório novo, preferencialmente privado: `adiem_portal_v2`.
2. Faça upload do conteúdo desta pasta na raiz do repositório (não faça upload apenas do ZIP).
3. No Supabase existente, abra SQL Editor e execute `supabase/migrations/20261030_create_adiem_v2.sql`.
4. No EasyPanel, crie App apontando para `SEU_USUARIO/adiem_portal_v2`, branch `main`, build path `/`, usando Dockerfile.
5. Em Ambiente, configure:
   - `NEXT_PUBLIC_SUPABASE_URL` = URL do projeto Supabase atual
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = chave anon/publishable pública atual
   - `SUPABASE_SERVICE_ROLE_KEY` = chave administrativa atual, somente servidor
6. Configure porta interna `3000` e implante.
7. Teste primeiro os módulos com banco vazio e a telemetria RT004. Não altere o backend MQTT nem o firmware.

## Observações de modelo
- `rt004_laps`, `rt004_sessions`, `rt004_packets`, `rt004_transponders` são estruturas do projeto existente; esta entrega não faz migrations nelas.
- `devices_v2` é o cadastro de produto/cliente e não substitui os identificadores do esquema RT004.
- `event_entries_v2.transponder_id` referencia `devices_v2`, não `rt004_transponders`. A ponte entre o cadastro comercial e o transponder físico deve ser validada antes de usar associações em produção.
- `lap_notes_v2.rt004_lap_id` não tem FK intencional nesta primeira entrega para evitar supor o tipo/PK sem confirmar o schema exato.
- A telemetria inicial exibe os registros retornados; não interpreta `lap_time_ms` como tempo oficial até validar os campos e a semântica dos dados.

## Estrutura
- `src/app/page.tsx`: interface inicial da suíte
- `src/app/api/data/route.ts`: endpoints de listagem e inserção para tabelas V2 permitidas
- `src/app/api/telemetry/route.ts`: leitura de `rt004_laps`
- `supabase/migrations/...sql`: tabelas novas `_v2`
