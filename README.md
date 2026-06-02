# Athlos — Backend

Plataforma digital para gerenciamento de Atléticas Universitárias.

## Stack

- **NestJS 11** + TypeScript
- **Drizzle ORM** + **PostgreSQL 16**
- **RabbitMQ 3** (mensageria entre microsserviços)
- **Docker** + **Docker Compose**
- Arquitetura: **DDD + Microsserviços**

---

## Subir tudo com Docker (recomendado)

```bash
# 1. Clone / extraia o projeto
cd athlos

# 2. Sobe tudo: Postgres, RabbitMQ, Adminer e todos os microsserviços
docker compose up --build
```

Aguarde os healthchecks passarem (≈ 30s). Depois acesse:

| Serviço              | URL                                           |
|----------------------|-----------------------------------------------|
| **Associação API**   | http://localhost:4001                         |
| **Swagger (docs)**   | http://localhost:4001/docs                    |
| **Identidade API**   | http://localhost:4002                         |
| **Swagger (docs)**   | http://localhost:4002/docs                    |
| **Feed API**         | http://localhost:4003                         |
| **Swagger (docs)**   | http://localhost:4003/docs                    |
| **User-Auth API**    | http://localhost:4007                         |
| **Swagger (docs)**   | http://localhost:4007/docs                    |
| **Adminer (DB)**     | http://localhost:8080                         |
| **RabbitMQ UI**      | http://localhost:15672 (admin / admin)        |

> As migrations rodam automaticamente antes de cada serviço iniciar.

---

## Rodar em modo desenvolvimento (sem Docker)

```bash
# 1. Sobe apenas a infraestrutura
docker compose up -d postgres rabbitmq

# 2. Copia os .env de cada serviço
cp services/associacao/.env.example services/associacao/.env
cp services/identidade/.env.example services/identidade/.env
cp services/feed/.env.example services/feed/.env
cp services/user-auth/.env.example services/user-auth/.env

# 3. Instala dependências
npm install --prefix services/associacao
npm install --prefix services/identidade
npm install --prefix services/feed
npm install --prefix services/user-auth

# 4. Roda as migrations
cd services/associacao && npx drizzle-kit migrate && cd ../..
cd services/identidade && npx drizzle-kit migrate && cd ../..
cd services/feed       && npx drizzle-kit migrate && cd ../..
cd services/user-auth  && npx drizzle-kit migrate && cd ../..

# 5. Sobe os serviços em watch mode (em terminais separados)
npm run start:associacao
npm run start:identidade
npm run start:feed
npm run start:user-auth
```

---

## Estrutura do Projeto

```
athlos/
├── docker/
│   └── postgres/
│       └── init/
│           └── 01-create-databases.sql     # Criação dos bancos (athlos_associacao, athlos_identidade, athlos_feed, athlos_user_auth)
├── shared/
│   └── src/
│       ├── contracts/
│       │   └── events/
│       │       ├── associacao-events.enum.ts  # Exchanges e routing keys do microsserviço de Associação
│       │       └── identidade-events.enum.ts  # Exchanges e routing keys do microsserviço de Identidade
│       ├── domain/
│       │   └── enums/
│       │       └── permission.enum.ts         # Enum central de permissões (associados, users, cargos)
│       └── infra/
│           ├── auth/
│           │   ├── auth-rpc.service.ts        # Comunicação RPC com o serviço de autenticação via RabbitMQ
│           │   ├── guards/
│           │   │   ├── jwt-auth.guard.ts      # Guard JWT global (valida Bearer token)
│           │   │   └── permissions.guard.ts   # Guard de permissões granulares
│           │   ├── interfaces/
│           │   │   └── authenticated-user.interface.ts  # Interface do usuário autenticado no request
│           │   └── shared-auth.module.ts      # Módulo compartilhado de autenticação
│           ├── database/
│           │   └── drizzle.service.ts         # Serviço base de conexão com o Drizzle ORM
│           ├── decorators/
│           │   ├── current-user.decorator.ts  # @CurrentUser() — extrai usuário autenticado do request
│           │   ├── permissions.decorator.ts   # @RequirePermissions() — define permissões necessárias
│           │   └── public.decorator.ts        # @Public() — marca rota como pública (sem JWT)
│           ├── hateoas/
│           │   ├── hateoas.decorators.ts      # @HateoasItem / @HateoasList — decorators de links HATEOAS
│           │   ├── hateoas.interceptor.ts     # Interceptor que injeta _links nas respostas
│           │   ├── hateoas.types.ts           # Tipos e interfaces do padrão HATEOAS
│           │   └── index.ts                   # Barrel export do módulo HATEOAS
│           ├── http/
│           │   └── bootstrap-http-app.ts      # Função utilitária de bootstrap (Swagger, pipes, prefixo v1)
│           └── messaging/
│               ├── rabbitmq.service.ts        # Serviço de publicação de eventos no RabbitMQ
│               └── shared-messaging.service.ts # Abstração de mensageria compartilhada
├── services/
│   ├── associacao/                            # Microsserviço — Core Domain (porta 4001)
│   │   ├── drizzle/                           # Migrations SQL do banco athlos_associacao
│   │   └── src/
│   │       └── modules/
│   │           └── associacao/
│   │               ├── associados/            # Módulo de Associados
│   │               │   ├── application/
│   │               │   │   ├── dto/
│   │               │   │   │   ├── associado.dto.ts                  # DTO de resposta de associado
│   │               │   │   │   ├── create-associado.dto.ts           # DTO de criação
│   │               │   │   │   ├── update-associado.dto.ts           # DTO de atualização
│   │               │   │   │   ├── change-status-associado.dto.ts    # DTO de mudança de status
│   │               │   │   │   └── assign-cargo-associado.dto.ts     # DTO de atribuição de cargo
│   │               │   │   └── services/
│   │               │   │       ├── associado.service.ts              # Casos de uso de associados
│   │               │   │       └── associado-messaging.service.ts    # Publicação de eventos de associado
│   │               │   ├── domain/
│   │               │   │   ├── models/
│   │               │   │   │   └── associado.entity.ts               # Entidade de domínio Associado
│   │               │   │   └── repositories/
│   │               │   │       └── associado-repository.interface.ts # Interface do repositório
│   │               │   └── infra/
│   │               │       ├── controllers/
│   │               │       │   └── associados.controller.ts          # Controller HTTP de associados
│   │               │       ├── database/schemas/
│   │               │       │   └── associado.schema.ts               # Schema Drizzle da tabela associados
│   │               │       └── repositories/
│   │               │           └── drizzle-associado.repository.ts   # Implementação do repositório com Drizzle
│   │               └── hierarquia/            # Módulo de Hierarquia (Cargos)
│   │                   ├── application/
│   │                   │   ├── dto/
│   │                   │   │   ├── cargo.dto.ts                      # DTO de resposta de cargo
│   │                   │   │   ├── create-cargo.dto.ts               # DTO de criação
│   │                   │   │   └── update-cargo.dto.ts               # DTO de atualização
│   │                   │   └── services/
│   │                   │       └── cargo.service.ts                  # Casos de uso de cargos
│   │                   ├── domain/
│   │                   │   ├── models/
│   │                   │   │   ├── cargo.entity.ts                   # Entidade de domínio Cargo
│   │                   │   │   └── tipo-cargo.enum.ts                # Enum de tipos de cargo
│   │                   │   └── repositories/
│   │                   │       └── cargo-repository.interface.ts     # Interface do repositório
│   │                   └── infra/
│   │                       ├── controllers/
│   │                       │   └── cargos.controller.ts              # Controller HTTP de cargos
│   │                       ├── database/schemas/
│   │                       │   └── cargo.schema.ts                   # Schema Drizzle da tabela cargos
│   │                       └── repositories/
│   │                           └── drizzle-cargo.repository.ts       # Implementação do repositório com Drizzle
│   ├── identidade/                            # Microsserviço — Identidade (porta 4002)
│   │   ├── drizzle/                           # Migrations SQL do banco athlos_identidade
│   │   └── src/
│   │       └── modules/
│   │           └── identidade/
│   │               └── usuarios/              # Módulo de Usuários com autenticação completa
│   │                   ├── application/
│   │                   │   ├── dto/
│   │                   │   │   ├── usuario.dto.ts                    # DTO de resposta de usuário
│   │                   │   │   ├── create-usuario.dto.ts             # DTO de criação
│   │                   │   │   ├── update-usuario.dto.ts             # DTO de atualização
│   │                   │   │   ├── change-status-usuario.dto.ts      # DTO de mudança de status
│   │                   │   │   ├── login.dto.ts                      # DTO de login (email + senha)
│   │                   │   │   ├── auth-response.dto.ts              # DTO de resposta de autenticação (tokens)
│   │                   │   │   └── refresh-token-request.dto.ts      # DTO de renovação de token
│   │                   │   └── services/
│   │                   │       ├── usuario.service.ts                # Casos de uso de usuários
│   │                   │       └── auth.service.ts                   # Login, refresh e logout
│   │                   ├── domain/
│   │                   │   ├── models/
│   │                   │   │   └── usuario.entity.ts                 # Entidade de domínio Usuario
│   │                   │   └── repositories/
│   │                   │       ├── usuario-repository.interface.ts   # Interface do repositório de usuários
│   │                   │       └── refresh-token-repository.interface.ts # Interface do repositório de tokens
│   │                   └── infra/
│   │                       ├── controllers/
│   │                       │   ├── usuarios.controller.ts            # Controller HTTP de usuários
│   │                       │   └── auth.controller.ts                # Controller HTTP de autenticação
│   │                       ├── database/schemas/
│   │                       │   ├── usuario.schema.ts                 # Schema Drizzle da tabela usuarios
│   │                       │   └── refresh-token.schema.ts          # Schema Drizzle da tabela refresh_tokens
│   │                       └── repositories/
│   │                           ├── drizzle-usuario.repository.ts     # Implementação do repositório de usuários
│   │                           └── drizzle-refresh-token.repository.ts # Implementação do repositório de tokens
│   └── user-auth/                             # Microsserviço — Autenticação legada (porta 4007)
│       ├── drizzle/                           # Migrations SQL do banco athlos_user_auth
│       └── src/
│           └── modules/
│               ├── auth/                      # Módulo de Autenticação
│               │   ├── application/
│               │   │   ├── dto/
│               │   │   │   └── login.dto.ts                         # DTO de login
│               │   │   └── services/
│               │   │       └── auth.service.ts                      # Serviço de autenticação JWT
│               │   ├── auth.module.ts
│               │   └── infra/
│               │       ├── controllers/
│               │       │   └── auth.controller.ts                   # Controller HTTP de autenticação
│               │       └── messaging/
│               │           └── auth-token-validation.consumer.ts    # Consumer RabbitMQ para validação de token
│               └── users/                     # Módulo de Usuários
│                   ├── application/
│                   │   ├── dto/
│                   │   │   ├── create-user.dto.ts                   # DTO de criação
│                   │   │   ├── update-user.dto.ts                   # DTO de atualização
│                   │   │   ├── user-payload.interface.ts            # Interface do payload JWT
│                   │   │   └── user-response.dto.ts                 # DTO de resposta com HATEOAS
│                   │   └── services/
│                   │       └── user.service.ts                      # Casos de uso de usuários
│                   ├── domain/
│                   │   ├── models/
│                   │   │   └── user.entity.ts                       # Entidade de domínio User
│                   │   └── repositories/
│                   │       └── user-repository.interface.ts         # Interface do repositório
│                   └── infra/
│                       ├── controllers/
│                       │   └── users.controller.ts                  # Controller HTTP de usuários (com HATEOAS)
│                       ├── database/schemas/
│                       │   └── user.schema.ts                       # Schema Drizzle da tabela users
│                       └── repositories/
│                           └── drizzle-user.repository.ts           # Implementação do repositório com Drizzle
├── docker-compose.yml
├── Dockerfile.service
├── tsconfig.base.json
└── package.json
```

---

## Autenticação

Todos os endpoints protegidos exigem `Authorization: Bearer <token>`.

### Fluxo de autenticação (via serviço `identidade`, porta 4002)

```
POST /v1/auth/login   → retorna accessToken + refreshToken
POST /v1/auth/refresh → renova o accessToken usando o refreshToken
POST /v1/auth/logout  → revoga o refreshToken
```

O `accessToken` é um JWT assinado com o secret `JWT_SECRET` contendo:

```json
{
  "sub": "uuid-do-usuario",
  "email": "usuario@atletica.com",
  "permissions": ["associados:read", "associados:write", "cargos:read", ...]
}
```

### Permissões disponíveis

| Permissão           | Descrição                          |
|---------------------|------------------------------------|
| `associados:read`   | Visualizar associados              |
| `associados:write`  | Criar e editar associados          |
| `associados:delete` | Remover associados                 |
| `cargos:read`       | Visualizar cargos                  |
| `cargos:write`      | Criar e editar cargos              |
| `cargos:delete`     | Remover cargos                     |
| `eventos:read`      | Visualizar eventos e confirmar presenca |
| `eventos:write`     | Criar e editar eventos             |
| `eventos:delete`    | Remover eventos                    |
| `users:read`        | Visualizar usuários do sistema     |
| `users:write`       | Criar e editar usuários do sistema |
| `users:delete`      | Remover usuários do sistema        |

---

## Endpoints — Microsserviço de Associação (porta 4001)

### Associados

| Método   | Rota                                        | Permissão            | Descrição                                      |
|----------|---------------------------------------------|----------------------|------------------------------------------------|
| `GET`    | `/v1/associados?_page=1&_size=10`           | `associados:read`    | Listar paginado                                |
| `GET`    | `/v1/associados/:id`                        | `associados:read`    | Buscar por ID                                  |
| `GET`    | `/v1/associados/atletica/:atleticaId`       | `associados:read`    | Listar por Atlética                            |
| `POST`   | `/v1/associados`                            | `associados:write`   | Cadastrar (calcula taxa 0,5% automaticamente)  |
| `PUT`    | `/v1/associados/:id`                        | `associados:write`   | Atualizar dados                                |
| `PATCH`  | `/v1/associados/:id/status`                 | `associados:write`   | Ativar / Inativar                              |
| `PATCH`  | `/v1/associados/:id/cargo`                  | `associados:write`   | Atribuir ou remover cargo do associado         |
| `DELETE` | `/v1/associados/:id`                        | `associados:delete`  | Remover                                        |

**Exemplo — Criar associado:**

```json
POST /v1/associados
{
  "nome": "João Silva",
  "email": "joao@atletica.com",
  "documento": "123.456.789-00",
  "telefone": "(44) 99999-9999",
  "atleticaId": "uuid-da-atletica",
  "valorAssociacao": 500
}
```

> O campo `taxaAthlos` é calculado automaticamente: `500 × 0,5% = R$ 2,50` (RF08)

**Exemplo — Atribuir cargo:**

```json
PATCH /v1/associados/:id/cargo
{
  "cargoId": "uuid-do-cargo"
}
```

### Cargos (Hierarquia)

| Método   | Rota                                        | Permissão        | Descrição                     |
|----------|---------------------------------------------|------------------|-------------------------------|
| `GET`    | `/v1/cargos?_page=1&_size=10`               | `cargos:read`    | Listar paginado               |
| `GET`    | `/v1/cargos/:id`                            | `cargos:read`    | Buscar por ID                 |
| `GET`    | `/v1/cargos/atletica/:atleticaId`           | `cargos:read`    | Listar cargos de uma Atlética |
| `POST`   | `/v1/cargos`                                | `cargos:write`   | Criar cargo                   |
| `PUT`    | `/v1/cargos/:id`                            | `cargos:write`   | Atualizar cargo               |
| `DELETE` | `/v1/cargos/:id`                            | `cargos:delete`  | Remover cargo                 |

---

## Endpoints — Microsserviço de Identidade (porta 4002)

### Autenticação

| Método  | Rota               | Auth    | Descrição                              |
|---------|--------------------|---------|----------------------------------------|
| `POST`  | `/v1/auth/login`   | Pública | Autenticar e obter access + refresh token |
| `POST`  | `/v1/auth/refresh` | Pública | Renovar access token via refresh token |
| `POST`  | `/v1/auth/logout`  | Pública | Revogar refresh token (logout)         |

**Exemplo — Login:**

```json
POST /v1/auth/login
{
  "email": "admin@atletica.com",
  "senha": "sua-senha"
}
```

**Resposta:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
  "refreshToken": "uuid-do-refresh-token"
}
```

### Usuários

| Método   | Rota                                        | Permissão      | Descrição                     |
|----------|---------------------------------------------|----------------|-------------------------------|
| `GET`    | `/v1/usuarios?_page=1&_size=10`             | `users:read`   | Listar paginado               |
| `GET`    | `/v1/usuarios/:id`                          | `users:read`   | Buscar por ID                 |
| `GET`    | `/v1/usuarios/atletica/:atleticaId`         | `users:read`   | Listar usuários de uma Atlética |
| `POST`   | `/v1/usuarios`                              | `users:write`  | Criar usuário                 |
| `PUT`    | `/v1/usuarios/:id`                          | `users:write`  | Atualizar usuário             |
| `PATCH`  | `/v1/usuarios/:id/status`                   | `users:write`  | Ativar / Inativar usuário     |
| `DELETE` | `/v1/usuarios/:id`                          | `users:delete` | Remover usuário               |

---

## Endpoints — Microsserviço de Feed (porta 4003)

### Eventos

| Método   | Rota                                                   | Permissão        | Descrição                                |
|----------|---------------------------------------------------------|------------------|------------------------------------------|
| `GET`    | `/v1/eventos?_page=1&_size=10`                         | `eventos:read`   | Listar paginado                          |
| `GET`    | `/v1/eventos/:id`                                      | `eventos:read`   | Buscar por ID                            |
| `GET`    | `/v1/eventos/atletica/:atleticaId`                     | `eventos:read`   | Listar eventos de uma Atlética           |
| `GET`    | `/v1/eventos/atletica/:atleticaId/tipo/:type`          | `eventos:read`   | Filtrar eventos por tipo                 |
| `POST`   | `/v1/eventos`                                          | `eventos:write`  | Criar evento ou treino                   |
| `PUT`    | `/v1/eventos/:id`                                      | `eventos:write`  | Atualizar evento ou treino               |
| `DELETE` | `/v1/eventos/:id`                                      | `eventos:delete` | Remover evento ou treino                 |
| `POST`   | `/v1/eventos/:id/presencas`                            | `eventos:read`   | Confirmar presença do usuário autenticado |
| `DELETE` | `/v1/eventos/:id/presencas/:usuarioId`                 | `eventos:read`   | Remover confirmação de presença          |

**Exemplo — Criar evento:**

```json
POST /v1/eventos
{
  "date": "JUN 14",
  "type": "TREINO",
  "typeColor": 4279282049,
  "title": "TREINO DE FUTEBOL",
  "time": "19:00 - 21:00",
  "place": "Campo de Treinamento Alpha",
  "bgColor": 4280179295,
  "atleticaId": "uuid-da-atletica"
}
```

---

## Endpoints — Microsserviço User-Auth (porta 4007)

> Serviço legado de autenticação e gestão de usuários com suporte a HATEOAS.

### Autenticação

| Método | Rota             | Auth    | Descrição              |
|--------|------------------|---------|------------------------|
| `POST` | `/v1/auth/login` | Pública | Autenticar via JWT     |

### Usuários

| Método   | Rota                                  | Auth    | Descrição                           |
|----------|---------------------------------------|---------|-------------------------------------|
| `GET`    | `/v1/users?_page=1&_size=10`          | Pública | Listar paginado (com links HATEOAS) |
| `GET`    | `/v1/users/:id`                       | Pública | Buscar por ID (com links HATEOAS)   |
| `POST`   | `/v1/users`                           | Pública | Criar usuário                       |
| `PUT`    | `/v1/users/:id`                       | Pública | Atualizar usuário                   |
| `DELETE` | `/v1/users/:id`                       | Pública | Remover usuário                     |

> As rotas do serviço `user-auth` retornam links HATEOAS (`_links`) nas respostas de listagem e detalhe.

---

## Mensageria — Eventos RabbitMQ

### Eventos do Microsserviço de Associação

| Exchange                                       | Routing Key               | Descrição                          |
|------------------------------------------------|---------------------------|------------------------------------|
| `associacao.associados.created.exchange`       | `associado.created`       | Novo associado cadastrado          |
| `associacao.associados.updated.exchange`       | `associado.updated`       | Dados do associado atualizados     |
| `associacao.associados.deleted.exchange`       | `associado.deleted`       | Associado removido                 |
| `associacao.associados.status-changed.exchange`| `associado.status-changed`| Status do associado alterado       |

### Eventos do Microsserviço de Identidade

| Exchange                                       | Routing Key               | Descrição                          |
|------------------------------------------------|---------------------------|------------------------------------|
| `identidade.usuarios.created.exchange`         | `usuario.created`         | Novo usuário cadastrado            |
| `identidade.usuarios.updated.exchange`         | `usuario.updated`         | Dados do usuário atualizados       |
| `identidade.usuarios.deleted.exchange`         | `usuario.deleted`         | Usuário removido                   |
| `identidade.usuarios.status-changed.exchange`  | `usuario.status-changed`  | Status do usuário alterado         |

---

## Microsserviços planejados (Context Map)

| Serviço          | Porta | Domínio                                  | Status         |
|------------------|-------|------------------------------------------|----------------|
| `associacao`     | 4001  | Associados, hierarquia (Core Domain)     | ✅ Implementado |
| `identidade`     | 4002  | Autenticação e gestão de usuários        | ✅ Implementado |
| `user-auth`      | 4007  | Autenticação legada com HATEOAS          | ✅ Implementado |
| `feed`           | 4003  | Eventos e treinos (Supporting A)         | ✅ Implementado |
| `financeiro`     | 4004  | Controle financeiro (Supporting B)       | 🔜 Planejado    |
| `lojinha`        | 4005  | Loja atlética (Supporting B)             | 🔜 Planejado    |
| `notificacoes`   | 4006  | Notificações push (Generic)              | 🔜 Planejado    |

---

## Comandos úteis

```bash
# Rebuild de um serviço específico
docker compose up --build associacao
docker compose up --build identidade
docker compose up --build feed
docker compose up --build user-auth

# Ver logs em tempo real
docker compose logs -f associacao
docker compose logs -f identidade
docker compose logs -f feed
docker compose logs -f user-auth

# Recriar banco do zero
docker compose down -v && docker compose up --build

# Acessar banco via psql
docker compose exec postgres psql -U postgres -d athlos_associacao
docker compose exec postgres psql -U postgres -d athlos_identidade
docker compose exec postgres psql -U postgres -d athlos_feed
docker compose exec postgres psql -U postgres -d athlos_user_auth
```
