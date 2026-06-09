# Notificacoes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new `notificacoes` microservice on port `4006`, with persistent inbox, device token registry, and RabbitMQ consumers for event and association updates.

**Architecture:** The service follows the existing NestJS + DDD + Drizzle pattern used by `feed`, `associacao` and `identidade`. It owns the `athlos_notificacoes` database, exposes REST endpoints for inbox/device tokens, consumes durable RabbitMQ queues, and extends `feed` to publish event lifecycle messages.

**Tech Stack:** NestJS 11, TypeScript, Drizzle ORM, PostgreSQL 16, RabbitMQ, Docker Compose.

---

## File Structure

- Create `services/notificacoes/package.json`: scripts/dependencies copied from `services/feed`.
- Create `services/notificacoes/tsconfig.json`: aliases `@shared/*` and `@notificacoes/*`.
- Create `services/notificacoes/tsconfig.build.json`, `nest-cli.json`, `drizzle.config.ts`, `.env.example`.
- Create `services/notificacoes/src/main.ts`, `src/app.module.ts`, `src/modules/notificacoes/notificacoes.module.ts`.
- Create notification domain files under `services/notificacoes/src/modules/notificacoes/notificacoes`.
- Create device token domain files under `services/notificacoes/src/modules/notificacoes/device-tokens`.
- Create RabbitMQ consumer files under `services/notificacoes/src/modules/notificacoes/consumers`.
- Create migration files under `services/notificacoes/drizzle`.
- Modify `shared/src/contracts/events/feed-events.enum.ts`: new feed event contract.
- Modify `services/feed/src/modules/feed/eventos`: add event publishing.
- Modify `shared/src/domain/enums/permission.enum.ts`: add notification permissions.
- Modify `services/identidade/src/modules/identidade/usuarios/application/services/auth.service.ts`: include event/notification permissions in JWTs.
- Modify `package.json`, `docker-compose.yml`, `docker/postgres/init/01-create-databases.sql`, `README.md`.

## Task 1: Add Feed Event Contract And Publisher

**Files:**
- Create: `shared/src/contracts/events/feed-events.enum.ts`
- Create: `services/feed/src/modules/feed/eventos/application/services/evento-messaging.service.ts`
- Modify: `services/feed/src/modules/feed/eventos/application/services/evento.service.ts`
- Modify: `services/feed/src/modules/feed/eventos/eventos.module.ts`
- Test: `npm.cmd run typecheck:feed`

- [ ] **Step 1: Write the contract**

```ts
export enum FeedExchangeName {
  EVENTO_CREATED = "feed.eventos.created.exchange",
  EVENTO_UPDATED = "feed.eventos.updated.exchange",
  EVENTO_DELETED = "feed.eventos.deleted.exchange",
}

export enum FeedRoutingKey {
  EVENTO_CREATED = "evento.created",
  EVENTO_UPDATED = "evento.updated",
  EVENTO_DELETED = "evento.deleted",
}
```

- [ ] **Step 2: Run typecheck to verify no publisher exists yet**

Run: `npm.cmd run typecheck:feed`

Expected: PASS before wiring. This establishes the baseline.

- [ ] **Step 3: Implement `EventoMessagingService`**

Use the same pattern as `AssociadoMessagingService`: assert three exchanges on bootstrap and publish `EventoDto` payloads.

- [ ] **Step 4: Wire publisher into `EventosModule` and `EventoService`**

Inject `EventoMessagingService` into `EventoService`. After creating an event, load it back from repository and publish `EVENTO_CREATED`. After edit, publish updated event. Before delete, publish deleted event payload after repository delete.

- [ ] **Step 5: Verify feed still compiles**

Run: `npm.cmd run typecheck:feed`

Expected: PASS.

## Task 2: Scaffold Notificacoes Service

**Files:**
- Create: `services/notificacoes/package.json`
- Create: `services/notificacoes/package-lock.json`
- Create: `services/notificacoes/tsconfig.json`
- Create: `services/notificacoes/tsconfig.build.json`
- Create: `services/notificacoes/nest-cli.json`
- Create: `services/notificacoes/drizzle.config.ts`
- Create: `services/notificacoes/.env.example`
- Create: `services/notificacoes/src/main.ts`
- Create: `services/notificacoes/src/app.module.ts`
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes.module.ts`
- Test: `npm.cmd run typecheck --prefix services/notificacoes`

- [ ] **Step 1: Create package/config files**

Copy the structure from `services/feed`, changing:

```json
{
  "name": "@athlos/notificacoes",
  "scripts": {
    "start:prod": "node dist/services/notificacoes/src/main.js"
  }
}
```

Use path alias:

```json
"@notificacoes/*": ["./src/modules/notificacoes/*"]
```

- [ ] **Step 2: Create app bootstrap**

Use title `Athlos - Notificacoes API`, description `Microsservico de notificacoes do Athlos`, and `process.env.PORT`.

- [ ] **Step 3: Install dependencies**

Run: `npm.cmd install --prefix services/notificacoes`

Expected: creates `services/notificacoes/package-lock.json`.

- [ ] **Step 4: Run typecheck to verify empty service baseline**

Run: `npm.cmd run typecheck --prefix services/notificacoes`

Expected: PASS with an empty `NotificacoesModule`.

## Task 3: Add Notification Domain, DTOs And Repositories

**Files:**
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/domain/models/notificacao.entity.ts`
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/domain/models/notificacao-tipo.enum.ts`
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/domain/repositories/notificacao-repository.interface.ts`
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/application/dto/create-notificacao.dto.ts`
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/application/dto/notificacao.dto.ts`
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/infra/database/schemas/notificacao.schema.ts`
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/infra/repositories/drizzle-notificacao.repository.ts`
- Test: `npm.cmd run typecheck --prefix services/notificacoes`

- [ ] **Step 1: Implement notification entity**

`Notificacao.restore()` accepts `id`, `usuarioId`, `atleticaId`, `tipo`, `titulo`, `mensagem`, `metadata`, `createdAt`, `readAt`. Keep `readAt` as derived response state, not persisted on the base table.

- [ ] **Step 2: Implement DTOs**

`CreateNotificacaoDto` fields:

```ts
usuarioId?: string;
atleticaId!: string;
tipo!: NotificacaoTipo;
titulo!: string;
mensagem!: string;
metadata?: Record<string, unknown>;
```

`NotificacaoDto.fromNotificacao()` returns response including `lida` and `readAt`.

- [ ] **Step 3: Implement Drizzle schemas**

Create `notificacoesSchema` and `notificacaoLeiturasSchema`, including unique index on `notificacao_id + usuario_id`.

- [ ] **Step 4: Implement repository contract and Drizzle repository**

Required methods:

```ts
create(notificacao: Notificacao): Promise<void>;
findInboxPaginated(usuarioId: string, atleticaId: string, params: PaginationParams): Promise<{ rows: Notificacao[]; total: number }>;
countUnread(usuarioId: string, atleticaId: string): Promise<number>;
markAsRead(notificacaoId: string, usuarioId: string): Promise<void>;
markAllAsRead(usuarioId: string, atleticaId: string): Promise<void>;
```

- [ ] **Step 5: Verify compile**

Run: `npm.cmd run typecheck --prefix services/notificacoes`

Expected: PASS.

## Task 4: Add Device Token Domain, DTOs And Repository

**Files:**
- Create: `services/notificacoes/src/modules/notificacoes/device-tokens/domain/models/device-token.entity.ts`
- Create: `services/notificacoes/src/modules/notificacoes/device-tokens/domain/models/device-platform.enum.ts`
- Create: `services/notificacoes/src/modules/notificacoes/device-tokens/domain/repositories/device-token-repository.interface.ts`
- Create: `services/notificacoes/src/modules/notificacoes/device-tokens/application/dto/register-device-token.dto.ts`
- Create: `services/notificacoes/src/modules/notificacoes/device-tokens/infra/database/schemas/device-token.schema.ts`
- Create: `services/notificacoes/src/modules/notificacoes/device-tokens/infra/repositories/drizzle-device-token.repository.ts`
- Test: `npm.cmd run typecheck --prefix services/notificacoes`

- [ ] **Step 1: Implement platform enum**

```ts
export enum DevicePlatform {
  ANDROID = "ANDROID",
  IOS = "IOS",
  WEB = "WEB",
}
```

- [ ] **Step 2: Implement entity and DTO**

`RegisterDeviceTokenDto` has `token` and `platform`. `usuarioId` and `atleticaId` come from `CurrentUser`.

- [ ] **Step 3: Implement schema**

Table `device_tokens` has `id`, `usuario_id`, `atletica_id`, `token` unique, `platform`, `ativo`, `created_at`, `updated_at`.

- [ ] **Step 4: Implement repository**

Required methods:

```ts
upsert(token: DeviceToken): Promise<void>;
deactivate(token: string, usuarioId: string): Promise<void>;
findActiveByAtletica(atleticaId: string): Promise<DeviceToken[]>;
findActiveByUsuario(usuarioId: string): Promise<DeviceToken[]>;
```

- [ ] **Step 5: Verify compile**

Run: `npm.cmd run typecheck --prefix services/notificacoes`

Expected: PASS.

## Task 5: Add Application Services And Controllers

**Files:**
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/application/services/notificacao.service.ts`
- Create: `services/notificacoes/src/modules/notificacoes/device-tokens/application/services/device-token.service.ts`
- Create: `services/notificacoes/src/modules/notificacoes/notificacoes/infra/controllers/notificacoes.controller.ts`
- Create: `services/notificacoes/src/modules/notificacoes/device-tokens/infra/controllers/device-tokens.controller.ts`
- Modify: `services/notificacoes/src/modules/notificacoes/notificacoes.module.ts`
- Modify: `shared/src/domain/enums/permission.enum.ts`
- Modify: `services/identidade/src/modules/identidade/usuarios/application/services/auth.service.ts`
- Test: `npm.cmd run typecheck --prefix services/notificacoes`, `npm.cmd run typecheck:identidade`

- [ ] **Step 1: Add permissions**

Add to `Permission`:

```ts
NOTIFICACOES_READ = "notificacoes:read",
NOTIFICACOES_WRITE = "notificacoes:write",
NOTIFICACOES_DELETE = "notificacoes:delete",
```

- [ ] **Step 2: Update JWT permission mapping**

In `identidade` auth service, administrator receives event and notification read/write/delete permissions. Member receives `EVENTOS_READ` and `NOTIFICACOES_READ`.

- [ ] **Step 3: Implement services**

`NotificacaoService` wraps repository methods and creates manual notifications. `DeviceTokenService` registers and deactivates tokens using authenticated user context.

- [ ] **Step 4: Implement controllers**

Routes:

```ts
GET /v1/notificacoes
GET /v1/notificacoes/nao-lidas/count
POST /v1/notificacoes
PATCH /v1/notificacoes/:id/lida
PATCH /v1/notificacoes/lidas
POST /v1/device-tokens
DELETE /v1/device-tokens/:token
```

- [ ] **Step 5: Wire providers**

Register services, controllers, repositories and symbol providers in `NotificacoesModule`.

- [ ] **Step 6: Verify compile**

Run:

```powershell
npm.cmd run typecheck --prefix services/notificacoes
npm.cmd run typecheck:identidade
```

Expected: both PASS.

## Task 6: Add RabbitMQ Consumers

**Files:**
- Create: `services/notificacoes/src/modules/notificacoes/consumers/feed-evento-created.consumer.ts`
- Create: `services/notificacoes/src/modules/notificacoes/consumers/associado-status-changed.consumer.ts`
- Create: `services/notificacoes/src/modules/notificacoes/consumers/associado-updated.consumer.ts`
- Modify: `services/notificacoes/src/modules/notificacoes/notificacoes.module.ts`
- Test: `npm.cmd run typecheck --prefix services/notificacoes`

- [ ] **Step 1: Implement feed consumer**

Bind queue `notificacoes.feed.eventos.created` to `FeedExchangeName.EVENTO_CREATED` with routing key `FeedRoutingKey.EVENTO_CREATED`. Create collective notification:

```ts
tipo: NotificacaoTipo.EVENTO_PUBLICADO
titulo: "Novo evento publicado"
mensagem: `${payload.title} foi publicado na agenda.`
atleticaId: payload.atleticaId
metadata: { eventoId: payload.id, type: payload.type }
```

- [ ] **Step 2: Implement associado status consumer**

Bind queue `notificacoes.associados.status-changed` to `AssociacaoExchangeName.ASSOCIADO_STATUS_CHANGED`. Create directed notification to `payload.id`:

```ts
tipo: NotificacaoTipo.ASSOCIACAO_ATUALIZADA
titulo: "Associacao atualizada"
mensagem: `Seu status de associacao foi alterado para ${payload.status}.`
```

- [ ] **Step 3: Implement associado updated consumer**

Bind queue `notificacoes.associados.updated` to `AssociacaoExchangeName.ASSOCIADO_UPDATED`. Create directed notification to `payload.id` with a generic cadastro update message.

- [ ] **Step 4: Handle errors safely**

Each consumer parses JSON, persists via `NotificacaoService`, `ack`s after success and `nack`s without requeue on malformed payload.

- [ ] **Step 5: Verify compile**

Run: `npm.cmd run typecheck --prefix services/notificacoes`

Expected: PASS.

## Task 7: Add Migrations, Docker And Root Scripts

**Files:**
- Create: `services/notificacoes/drizzle/0000_init_notificacoes.sql`
- Create: `services/notificacoes/drizzle/meta/_journal.json`
- Modify: `package.json`
- Modify: `docker/postgres/init/01-create-databases.sql`
- Modify: `docker-compose.yml`
- Test: `docker-compose config`

- [ ] **Step 1: Add migration SQL**

Create enums `notificacao_tipo` and `device_platform`, tables `notificacoes`, `notificacao_leituras`, and `device_tokens`.

- [ ] **Step 2: Add root scripts**

Add:

```json
"start:notificacoes": "npm run start:dev --prefix services/notificacoes",
"typecheck:notificacoes": "npm run typecheck --prefix services/notificacoes"
```

- [ ] **Step 3: Add database init**

Add `athlos_notificacoes` to `docker/postgres/init/01-create-databases.sql`.

- [ ] **Step 4: Add Docker service**

Add service `notificacoes`, port `4006`, `SERVICE_NAME=notificacoes`, and `DATABASE_URL` for `athlos_notificacoes`.

- [ ] **Step 5: Validate compose**

Run: `docker-compose config`

Expected: PASS and output includes `notificacoes`.

## Task 8: Update README And Verify

**Files:**
- Modify: `README.md`
- Test: typechecks/builds/Docker smoke

- [ ] **Step 1: Document service**

Add Notificacoes API URL, Swagger URL, database, permissions, endpoints, context map status, and commands.

- [ ] **Step 2: Run local verification**

Run:

```powershell
npm.cmd run typecheck:notificacoes
npm.cmd run build --prefix services/notificacoes
npm.cmd run typecheck:feed
npm.cmd run typecheck:identidade
docker-compose config
```

Expected: all PASS.

- [ ] **Step 3: Run Docker smoke**

Run:

```powershell
docker-compose up --build notificacoes
```

Expected: Postgres and RabbitMQ healthy, migrations applied, `notificacoes` listening on port `4006`.

## Self-Review

- Spec coverage: inbox, device tokens, consumers, feed event publishing, permissions, identity JWT update, Docker, README and verification are covered.
- Marker scan: no undefined future steps remain.
- Type consistency: `Notificacao`, `NotificacaoTipo`, `DeviceToken`, `DevicePlatform`, route names, permission names and exchange names are consistent across tasks.
