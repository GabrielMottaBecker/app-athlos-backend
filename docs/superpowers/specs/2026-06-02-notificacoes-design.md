# Notificacoes Design

## Contexto

O Athlos precisa de um modulo backend para notificacoes conforme os requisitos:

- RF21: notificar associados sobre novos eventos e treinos publicados no feed.
- RF22: notificar associados sobre atualizacoes relevantes de associacao.

O README ja reserva o microsservico `notificacoes` na porta `4006`, com dominio de notificacoes push. A primeira versao sera hibrida: inbox persistente no backend agora, com modelagem de device tokens para integrar push real depois.

## Decisao

Criar um novo microsservico `notificacoes` na porta `4006`, com banco proprio `athlos_notificacoes`, mantendo o padrao dos servicos existentes:

- NestJS com bootstrap HTTP compartilhado.
- `SharedModule` para auth, Drizzle e RabbitMQ.
- Estrutura DDD por modulo.
- Drizzle ORM e migrations SQL.
- Docker Compose com service e database proprios.

Push real via Firebase/APNs/Expo fica fora da primeira entrega. O servico registrara tokens de dispositivo e mantera status suficiente para plugar um provider depois.

## Arquitetura

O servico `services/notificacoes` tera:

- `src/main.ts`: bootstrap HTTP e Swagger.
- `src/app.module.ts`: `ConfigModule`, `SharedModule`, `NotificacoesModule`.
- `src/modules/notificacoes/notificacoes.module.ts`: agrega inbox, device tokens e consumers.
- Camadas `domain`, `application` e `infra` seguindo os servicos existentes.

O servico expora uma API REST para consulta e leitura da inbox, alem de registro de device tokens. Tambem consumira eventos RabbitMQ de outros microsservicos para criar notificacoes automaticamente.

## Eventos RabbitMQ

### Eventos Consumidos

O servico `notificacoes` consumira:

- `feed.eventos.created.exchange` / `evento.created`: cria notificacao de novo evento/treino para a atletica do evento.
- `associacao.associados.status-changed.exchange` / `associado.status-changed`: cria notificacao direcionada ao associado quando seu status mudar.
- `associacao.associados.updated.exchange` / `associado.updated`: cria notificacao direcionada ao associado quando houver atualizacao relevante de cadastro.

### Alteracao Necessaria No Feed

O microsservico `feed` ainda nao publica eventos RabbitMQ. A implementacao de notificacoes deve incluir uma extensao pequena no `feed`:

- Criar contrato compartilhado `shared/src/contracts/events/feed-events.enum.ts`.
- Criar `EventoMessagingService`.
- Publicar eventos em `create`, `edit` e `remove`:
  - `EVENTO_CREATED`
  - `EVENTO_UPDATED`
  - `EVENTO_DELETED`

A primeira versao de notificacoes consome `EVENTO_CREATED`. `EVENTO_UPDATED` e `EVENTO_DELETED` ficam disponiveis para evolucao de regras sem novo contrato.

## Modelo De Dados

Tabela `notificacoes`:

- `id`: UUID.
- `usuario_id`: UUID opcional. Quando nulo, notificacao e coletiva por atletica.
- `atletica_id`: UUID obrigatorio.
- `tipo`: enum `EVENTO_PUBLICADO`, `ASSOCIACAO_ATUALIZADA`, `SISTEMA`.
- `titulo`: texto.
- `mensagem`: texto.
- `metadata`: JSONB opcional para IDs e payload resumido do evento gerador.
- `created_at`: timestamp com timezone.

Tabela `notificacao_leituras`:

- `id`: UUID.
- `notificacao_id`: UUID referenciando `notificacoes`, com delete cascade.
- `usuario_id`: UUID.
- `read_at`: timestamp com timezone.
- Combinacao unica `notificacao_id + usuario_id`.

Tabela `device_tokens`:

- `id`: UUID.
- `usuario_id`: UUID.
- `atletica_id`: UUID.
- `token`: texto unico.
- `platform`: enum `ANDROID`, `IOS`, `WEB`.
- `ativo`: boolean.
- `created_at`: timestamp com timezone.
- `updated_at`: timestamp com timezone.

## API REST

Rotas do microsservico `notificacoes`:

- `GET /v1/notificacoes?_page=1&_size=10`: lista inbox do usuario autenticado. Deve retornar notificacoes direcionadas ao usuario e notificacoes coletivas da sua atletica.
- `GET /v1/notificacoes/nao-lidas/count`: retorna contador de notificacoes nao lidas.
- `POST /v1/notificacoes`: cria notificacao manual, voltada para administradores.
- `PATCH /v1/notificacoes/:id/lida`: marca uma notificacao como lida para o usuario autenticado.
- `PATCH /v1/notificacoes/lidas`: marca todas as notificacoes visiveis do usuario como lidas.
- `POST /v1/device-tokens`: registra ou reativa token do dispositivo.
- `DELETE /v1/device-tokens/:token`: desativa token do dispositivo.

O padrao de retorno seguira os servicos existentes:

- Criacao e atualizacoes retornam `void` ou `204 No Content`.
- Consultas retornam DTOs.
- Listagem paginada retorna `PaginatedResult<NotificacaoDto>`.

## Permissoes

Adicionar ao enum compartilhado:

- `NOTIFICACOES_READ = "notificacoes:read"`
- `NOTIFICACOES_WRITE = "notificacoes:write"`
- `NOTIFICACOES_DELETE = "notificacoes:delete"`

Leitura, marcar como lida e device tokens usam `notificacoes:read`. Criacao manual usa `notificacoes:write`.

Tambem ajustar `services/identidade/src/modules/identidade/usuarios/application/services/auth.service.ts` para incluir permissoes novas no JWT:

- Administrador: eventos e notificacoes com read/write/delete.
- Membro: eventos read e notificacoes read.

## Regras De Negocio

- Notificacoes coletivas tem `usuario_id` nulo e `atletica_id` preenchido.
- Notificacoes direcionadas tem `usuario_id` e `atletica_id` preenchidos.
- Uma notificacao e considerada lida para um usuario quando existe registro em `notificacao_leituras`.
- Marcar como lida deve ser idempotente.
- Registrar device token deve criar ou reativar o token; se o mesmo token ja existir para o usuario, atualizar plataforma, atletica e `ativo`.
- Desativar token nao deve apagar historico.
- Consumers RabbitMQ devem usar queues duraveis e `ack` apenas depois de persistir a notificacao.

## Docker E Banco

Adicionar banco `athlos_notificacoes` ao script `docker/postgres/init/01-create-databases.sql`.

Adicionar servico `notificacoes` ao `docker-compose.yml`:

- Porta `4006`.
- `DATABASE_URL=postgres://postgres:postgres@postgres:5432/athlos_notificacoes`.
- Mesmo `JWT_SECRET`, `RABBITMQ_URL`, health dependencies e comando de migration dos demais microsservicos.
- Build usando `Dockerfile.service` com `SERVICE_NAME=notificacoes`.

## Documentacao

Atualizar o README com:

- URL da API e Swagger em `http://localhost:4006`.
- Banco `athlos_notificacoes`.
- Permissoes novas.
- Endpoints de notificacoes e device tokens.
- Eventos RabbitMQ do feed e consumers de notificacoes.
- Context map marcando `notificacoes` como implementado.

## Testes E Verificacao

Como o backend ainda nao possui suite de testes automatizados configurada, a verificacao minima obrigatoria sera:

- `npm.cmd install --prefix services/notificacoes`, se necessario.
- `npm.cmd run typecheck --prefix services/notificacoes`.
- `npm.cmd run build --prefix services/notificacoes`.
- `npm.cmd run typecheck:feed`.
- `npm.cmd run typecheck:identidade`.
- `docker-compose config`.
- Subir `notificacoes` com Docker para validar migrations e inicializacao.

## Fora De Escopo

- Envio real via Firebase Cloud Messaging, APNs, Expo ou outro provider.
- UI/mobile para exibicao da inbox.
- Preferencias granulares de notificacao por usuario.
- Templates ricos, imagens, deep links universais e agendamento.
- Retentativas avancadas de entrega push.
