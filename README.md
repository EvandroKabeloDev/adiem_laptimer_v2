# ADIEM LapTimer — Live Timing MVP

Portal de cronometragem para LapWiz RT004, construído com Next.js 16, React 19, TypeScript e Supabase.

## Fluxo atual

`LapWiz RT004 → BLE/Python → Supabase → Supabase Realtime → Portal Next.js`

A aquisição existente permanece separada. Este repositório não modifica firmware ESP32 nem o backend MQTT.

## Módulos

- Live Timing baseado em `rt004_sessions` e `rt004_laps`.
- Eventos e pistas.
- Cadastro de karts e pilotos.
- Cadastro por `transponder_id`, com vínculos `portal_kart_id` e `pilot_id`.

## Executar localmente

Requer Node.js 22 ou superior e npm.

1. Copie `.env.example` para `.env.local`.
2. Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com os valores do seu projeto Supabase.
3. Execute:

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## SQL

- `supabase/scripts/00_diagnostico_leitura.sql`: diagnóstico sem alterações.
- `supabase/scripts/01_migracao_transponder_piloto.sql`: garante coluna e FK de piloto.
- `supabase/scripts/02_habilitar_realtime.sql`: habilita Realtime para `rt004_laps` de forma idempotente.

Leia `DEPLOY.md` antes de publicar.

## Segurança

A chave publishable/anon é exposta ao navegador por definição. A segurança dos dados depende de autenticação e políticas RLS. Não exponha publicamente um projeto com RLS desabilitado. Nunca comite `.env.local` ou uma chave `service_role`.
