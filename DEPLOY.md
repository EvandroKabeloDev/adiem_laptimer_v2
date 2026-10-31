# Checklist de implantação V2

1. Repositório GitHub novo, privado recomendado; enviar os arquivos desta pasta na raiz.
2. Executar SQL da pasta `supabase/migrations` no Supabase atual.
3. EasyPanel → App → Fonte GitHub → repo V2 → `main` → caminho `/`.
4. Construção: Dockerfile na raiz.
5. Variáveis:
   `NEXT_PUBLIC_SUPABASE_URL`
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   `SUPABASE_SERVICE_ROLE_KEY`
6. Porta interna: `3000`.
7. Implantar e conferir logs.
8. Testar primeiro `/`, `/api/telemetry` e listagem de `pilots_v2`.
9. Não abrir para usuários externos até implementar autenticação e autorização multi-tenant.

## Segurança
A chave de serviço é privilegiada. O endpoint CRUD inicial não tem autenticação. Não o exponha publicamente. Para testes, restrinja acesso no EasyPanel/rede ou implemente autenticação antes de habilitar domínio público.
