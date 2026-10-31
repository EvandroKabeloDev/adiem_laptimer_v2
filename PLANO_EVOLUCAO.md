# ADIEM LapTimer — plano de evolução

## Restrições desta etapa

- Não alterar o firmware/código do ESP32.
- Preservar o coletor atual e as tabelas `rt004_sessions`, `rt004_packets` e `rt004_laps`.
- Manter o cadastro do transponder por `transponder_id`.
- Usar `portal_kart_id` para vincular o transponder a um kart cadastrado no portal e `pilot_id` para o piloto associado.
- Não executar migrações no Supabase sem necessidade identificada e validação prévia.

## Etapa 1 — estabilização do Live Timing

- Exibir apenas voltas da sessão atualmente carregada.
- Evitar misturar sessões no evento Realtime.
- Validar atualização, histórico, melhor volta, média e identificação do kart.
- Confirmar comportamento com uma sessão ativa, uma encerrada e novas voltas inseridas.

## Etapa 2 — cadastros e consultas da plataforma

- Revisar os cadastros existentes de pistas, eventos, karts, pilotos e transponders.
- Manter as entidades e os relacionamentos existentes sempre que possível.
- Conferir consultas e filtros para evento, sessão, piloto, kart e transponder.
- Construir histórico de sessões e classificações usando as voltas já armazenadas.

## Etapa 3 — gestão de corrida

- Evoluir para classificação por piloto/kart e evento, preservando a rastreabilidade das voltas de origem.
- Definir regras de classificação com base no regulamento aplicável antes de implementá-las.
- Manter a origem RT004 independente da interface, para permitir evolução futura sem exigir mudança imediata no ESP32.

## Alterações desta revisão

- O listener de Realtime ignora INSERTs de `rt004_laps` que não pertencem à sessão atualmente carregada.
- A rota PATCH de transponders usa `portal_kart_id`, alinhada à tela de cadastro e ao Live Timing.
- O README documenta o papel de `transponder_id`, `portal_kart_id` e `pilot_id`.

## Validação pendente

O ambiente desta execução não conseguiu instalar as dependências npm dentro do tempo disponível. Portanto, o build Next.js ainda precisa ser executado em ambiente com dependências instaláveis antes do deploy.
