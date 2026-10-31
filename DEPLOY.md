# ADIEM LapTimer — roteiro de publicação (GitHub + EasyPanel + Supabase)

## Escopo e limitações desta versão

- Portal Next.js 16 / React 19.
- Live Timing lê `rt004_sessions` e `rt004_laps`; atualização Realtime depende da publicação `supabase_realtime`.
- Cadastro identifica transponders pelo `transponder_id` e associa com `portal_kart_id` e `pilot_id`.
- Não altera firmware ESP32, coletor BLE/Python nem backend MQTT.
- Não execute migrações adicionais fora das listadas neste roteiro.

## 0. Atenção à segurança

Esta versão faz consultas diretamente do navegador ao Supabase com a chave publicável. O projeto histórico está configurado para uso de laboratório e pode ter RLS desabilitado. A chave publicável não é secreta; se RLS estiver desabilitado, tabelas podem ficar acessíveis por terceiros que conheçam a URL/chave. Portanto:

1. Use um projeto Supabase de teste ou restrinja o acesso ao portal no EasyPanel/proxy enquanto estiver validando.
2. Não publique em domínio aberto nem trate como produção até definir autenticação e políticas RLS para todas as tabelas usadas pelo portal.
3. Nunca configure `SUPABASE_SERVICE_ROLE_KEY` como variável `NEXT_PUBLIC_*`, nunca a coloque no GitHub e nunca a use no navegador.
4. Não habilite políticas permissivas para `anon` apenas para fazer o portal funcionar.

A tela atual de transponders grava diretamente no Supabase; a rota de API administrativa existente não substitui essas gravações da tela.

## 1. Criar o repositório GitHub

1. No GitHub, crie um repositório vazio chamado `adiem_laptimer` (ou outro nome escolhido por você).
2. Não marque para criar README, `.gitignore` ou licença, pois estes arquivos já estão neste pacote.
3. Extraia o ZIP para uma pasta local. Entre na pasta `adiem_laptimer-main`, onde fica `package.json`.
4. Abra PowerShell nessa pasta e execute, substituindo `SEU_USUARIO` pelo usuário/organização real:

```powershell
git init
git branch -M main
git add .
git status
git commit -m "Initial ADIEM LapTimer portal"
git remote add origin https://github.com/SEU_USUARIO/adiem_laptimer.git
git push -u origin main
```

Se o Git pedir identidade, configure-a com seus dados:

```powershell
git config --global user.name "Seu nome"
git config --global user.email "seu-email@example.com"
```

Antes de `git add`, confira `git status` e certifique-se de que nenhum `.env.local`, senha ou chave secreta será enviado.

## 2. Conferir o Supabase antes de alterar

1. Abra o projeto Supabase correto.
2. Vá a SQL Editor.
3. Abra o arquivo `supabase/scripts/00_diagnostico_leitura.sql` do repositório, copie o conteúdo e execute.
4. Confirme que existem as tabelas `rt004_sessions`, `rt004_laps`, `rt004_transponders`, `events`, `tracks`, `karts` e `pilots`.
5. Confira os resultados das colunas e do estado RLS. Se alguma coluna essencial não existir, pare e envie o resultado antes de executar migrações.

## 3. SQL de migração e Realtime

Execute apenas se necessário:

- `supabase/scripts/01_migracao_transponder_piloto.sql`: executa a migração para `pilot_id`; pode ser executada novamente. Se a migração original `20261024_rt004_transponder_pilot.sql` já foi executada, não precisa executar ambas — use este script somente para garantir que a estrutura exista.
- `supabase/scripts/02_habilitar_realtime.sql`: inclui `public.rt004_laps` na publicação `supabase_realtime` apenas se ainda não estiver incluída.

Não execute SQL que recrie tabelas de telemetria ou apague dados. Não altere a tabela `rt004_laps` para resolver questões de interface.

## 4. Criar o projeto no EasyPanel

1. No EasyPanel, crie um novo **Project**, por exemplo `adiem-laptimer`.
2. Dentro dele, crie um **Service/App** a partir de GitHub.
3. Conecte a conta GitHub e selecione o repositório `adiem_laptimer`, branch `main`.
4. Selecione builder **Dockerfile**.
5. Defina o caminho/contexto de build como a raiz do repositório (`/`) e Dockerfile `Dockerfile`.
6. Configure a porta interna do container como `3000`.
7. Habilite deploy automático ao atualizar a branch `main`, se essa opção estiver disponível.

## 5. Variáveis de ambiente no EasyPanel

O Dockerfile compila o Next.js e injeta as variáveis públicas durante o build. Configure as duas variáveis abaixo na seção de **Build Arguments / Build-time variables** do serviço (não apenas nas variáveis runtime):

| Nome | Valor | Tipo |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase, ex. `https://xxxx.supabase.co` | Pública |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable key do Supabase; se o projeto ainda usa a chave legada, pode ser a `anon` key | Pública |

Se a interface do EasyPanel tiver uma seção de Environment Variables em runtime, também pode repetir essas duas variáveis ali, mas o essencial para este Dockerfile é que estejam disponíveis no build.

`SUPABASE_SERVICE_ROLE_KEY` e `ADIEM_ADMIN_PASSWORD` só são lidas pela rota administrativa `/api/transponders`; a tela atual não usa essa rota. Não as configure nesta primeira publicação a menos que a rota seja validada e realmente utilizada. Se forem necessárias posteriormente, use apenas variáveis runtime secretas e nunca as publique no browser.

## 6. Fazer deploy e conferir

1. Salve a configuração e inicie o deploy.
2. Acompanhe os logs de build. O build precisa terminar com sucesso.
3. Configure o domínio e HTTPS no EasyPanel, mas mantenha acesso restrito enquanto RLS/autenticação não estiverem resolvidos.
4. Abra o portal e confira:
   - página inicial/Live Timing carrega;
   - eventos são listados;
   - páginas `/events`, `/tracks`, `/karts`, `/pilots` e `/transponders` abrem;
   - a tela de transponders lista os IDs já existentes;
   - o painel apresenta as voltas da sessão mais recente;
   - ao iniciar um treino, o evento possui pista associada e metragem válida.

Se aparecer `Missing Supabase environment variables`, as variáveis públicas não foram incluídas no build. Corrija os Build Arguments e faça novo deploy.

Se aparecer erro de permissão no Supabase, não resolva desabilitando RLS em um projeto exposto publicamente. Copie o erro e revise as policies antes de continuar.

## 7. Limitação de segurança antes de uso público

Antes de tornar o portal público, o próximo trabalho obrigatório é implementar autenticação e políticas RLS coerentes para todas as tabelas. O portal atual não possui uma camada de login abrangente e as páginas de cadastros fazem leitura/escrita no cliente. Este pacote é para primeiro deploy controlado e validação, não uma declaração de que o portal está pronto para produção pública.
