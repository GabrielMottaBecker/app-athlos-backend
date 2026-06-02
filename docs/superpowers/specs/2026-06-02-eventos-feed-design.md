# Eventos Feed Design

## Contexto

O Athlos precisa de um modulo backend para eventos e treinos conforme RF12, RF13 e RF14:

- RF12: exibir calendario com eventos e treinos organizados.
- RF13: permitir inscricao e confirmacao de presenca em eventos e treinos.
- RF14: exibir informacoes detalhadas de cada evento ou treino.

O mobile ja possui um template em memoria para eventos com os campos `id`, `date`, `type`, `typeColor`, `title`, `time`, `place` e `bgColor`. O backend existente usa NestJS, Drizzle, PostgreSQL, Docker Compose e uma organizacao DDD por microsservico.

## Decisao

Criar um novo microsservico `feed` na porta `4003`, com banco proprio `athlos_feed`, mantendo o mesmo padrao dos microsservicos `associacao`, `identidade` e `user-auth`.

O README atual ja lista `feed` na porta `4003` como microsservico planejado para eventos e treinos. Usar esse nome preserva o context map existente e deixa espaco para posts/feed serem adicionados depois sem outro servico.

## Arquitetura

O servico `services/feed` seguira a estrutura existente:

- `src/main.ts`: bootstrap HTTP com Swagger e prefixo global.
- `src/app.module.ts`: configura `ConfigModule`, `SharedModule` e `FeedModule`.
- `src/modules/feed/feed.module.ts`: agrega submodulos do dominio feed.
- `src/modules/feed/eventos`: modulo inicial com camadas `domain`, `application` e `infra`.

O modulo `eventos` tera:

- Entidade `Evento`.
- Entidade `PresencaEvento`.
- Interfaces de repositorio por dominio.
- Servicos de aplicacao para CRUD e presencas.
- DTOs de criacao, atualizacao, resposta e confirmacao.
- Controllers REST protegidos por JWT e permissoes.
- Schemas Drizzle e migrations SQL.

## Modelo De Dados

Tabela `eventos`:

- `id`: UUID gerado pelo banco.
- `date`: texto, mantendo o formato atual do mobile como `JUN 14`.
- `type`: enum com valores `TREINO`, `EVENTO SOCIAL`, `EXTRAS` e `COMPETICAO`.
- `type_color`: inteiro com a cor ARGB/hex do mobile.
- `title`: texto.
- `time`: texto, mantendo o formato atual do mobile como `19:00 - 21:00`.
- `place`: texto.
- `bg_color`: inteiro com a cor de fundo do card.
- `atletica_id`: UUID para filtrar dados por atletica.
- `created_at`: timestamp com timezone.
- `updated_at`: timestamp com timezone.

Tabela `evento_presencas`:

- `id`: UUID gerado pelo banco.
- `evento_id`: UUID referenciando `eventos`, com delete cascade.
- `usuario_id`: UUID do usuario/associado autenticado.
- `status`: enum `CONFIRMADA`.
- `created_at`: timestamp com timezone.
- `updated_at`: timestamp com timezone.

A combinacao `evento_id + usuario_id` sera unica para impedir confirmacoes duplicadas.

## API REST

Rotas do microsservico `feed`:

- `GET /v1/eventos?_page=1&_size=10`: lista eventos paginados.
- `GET /v1/eventos/:id`: busca evento por ID.
- `GET /v1/eventos/atletica/:atleticaId`: lista eventos de uma atletica.
- `GET /v1/eventos/atletica/:atleticaId/tipo/:type`: lista eventos de uma atletica filtrados por tipo.
- `POST /v1/eventos`: cria evento.
- `PUT /v1/eventos/:id`: atualiza evento.
- `DELETE /v1/eventos/:id`: remove evento.
- `POST /v1/eventos/:id/presencas`: confirma presenca de um usuario.
- `DELETE /v1/eventos/:id/presencas/:usuarioId`: remove confirmacao de presenca.

O padrao de retorno seguira os servicos existentes:

- Criacao retorna `void`.
- Atualizacao e remocao retornam `204 No Content`.
- Consultas retornam DTOs.
- Listagem paginada retorna `PaginatedResult<EventoDto>`.

## Permissoes

Adicionar ao enum compartilhado:

- `EVENTOS_READ = "eventos:read"`
- `EVENTOS_WRITE = "eventos:write"`
- `EVENTOS_DELETE = "eventos:delete"`

Leitura e confirmacao de presenca usam `eventos:read`. Criacao e edicao usam `eventos:write`. Remocao usa `eventos:delete`.

## Docker E Banco

Adicionar banco `athlos_feed` ao script `docker/postgres/init/01-create-databases.sql`.

Adicionar servico `feed` ao `docker-compose.yml`:

- Porta externa/interna `4003`.
- `DATABASE_URL=postgres://postgres:postgres@postgres:5432/athlos_feed`.
- Mesmo `RABBITMQ_URL`, `JWT_SECRET`, health dependencies e comando de migration dos demais microsservicos.
- Build usando `Dockerfile.service` com `SERVICE_NAME=feed`.

## Testes E Verificacao

Como o backend ainda nao possui suite de testes configurada, a implementacao adicionara testes focados onde for viavel sem desorganizar o projeto. A verificacao minima obrigatoria sera:

- `npm install --prefix services/feed`, se necessario.
- `npm run typecheck --prefix services/feed`.
- `npm run build --prefix services/feed`.
- `docker compose config`.
- Subir infraestrutura e servico `feed` para validar migrations e inicializacao.

## Fora De Escopo

- Integracao do mobile com a API.
- Notificacoes push de novos eventos.
- Posts/feed de comunicacao interna.
- Integração com jogos universitarios, placar ou tabela de campeonato.
- Pagamento ou check-in presencial com QR Code.
