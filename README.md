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

| Serviço | URL |
|---------|-----|
| **Associação API** | http://localhost:4001 |
| **Swagger — Associação** | http://localhost:4001/docs |
| **User Auth API** | http://localhost:4007 |
| **Swagger — User Auth** | http://localhost:4007/docs |
| **Adminer (DB)** | http://localhost:8080 |
| **RabbitMQ UI** | http://localhost:15672 (admin / admin) |

> As migrations rodam automaticamente antes de cada serviço iniciar.

---

## Autenticação

O serviço `user-auth` é responsável por autenticação, geração de JWT e controle de permissões.

### Login

```http
POST http://localhost:4007/v1/auth/login
Content-Type: application/json

{
  "email": "admin@school.com",
  "password": "senha123"
}
```

Retorna:

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Use o token nos demais endpoints:

```
Authorization: Bearer <accessToken>
```

### Usuário admin padrão

| Campo | Valor |
|-------|-------|
| Email | `admin@school.com` |
| Senha | `senha123` |
| Permissões | todas (`associados:*`, `users:*`) |

> Criado automaticamente via migration ao subir o ambiente.

### Permissões disponíveis

| Permissão | Descrição |
|-----------|-----------|
| `associados:read` | Listar e buscar associados |
| `associados:write` | Criar e editar associados |
| `associados:delete` | Remover associados |
| `users:read` | Listar e buscar usuários |
| `users:write` | Criar e editar usuários |
| `users:delete` | Remover usuários |

---

## Endpoints — Microsserviço de Associação (porta 4001)

Todos os endpoints exigem `Authorization: Bearer <token>`.

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

## Endpoints — Microsserviço de User Auth (porta 4007)

### Auth

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/v1/auth/login` | Público | Autenticar e obter JWT |

### Usuários

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| `GET` | `/v1/users?_page=1&_size=10` | `users:read` | Listar paginado |
| `GET` | `/v1/users/:id` | `users:read` | Buscar por ID |
| `POST` | `/v1/users` | `users:write` | Criar usuário |
| `PUT` | `/v1/users/:id` | `users:write` | Atualizar usuário |
| `DELETE` | `/v1/users/:id` | `users:delete` | Remover usuário |

---

## Validação de token entre microsserviços (RabbitMQ)

Os microsserviços validam tokens JWT via RabbitMQ RPC, sem chamadas HTTP diretas ao `user-auth`.

**Exchange:** `auth.exchange`  
**Routing key:** `auth.validate-token`  
**Payload:** `{ "token": "<jwt>" }`  
**Resposta:** `{ "valid": true, "sub": "...", "email": "...", "permissions": [...] }` ou `{ "valid": false, "reason": "..." }`

Use o `AuthRpcService` disponível no `SharedModule`:

```typescript
const user = await this.authRpcService.validateToken(token);
// lança UnauthorizedException automaticamente se inválido
```

---

## Microsserviços planejados (Context Map)

| Serviço | Porta | Domínio | Status |
|---------|-------|---------|--------|
| `associacao` | 4001 | Associados, hierarquia (Core Domain) | ✅ Implementado |
| `user-auth` | 4007 | Autenticação e segurança (Core Domain) | ✅ Implementado |
| `feed` | 4003 | Eventos e treinos (Supporting A) | 🔜 Planejado |
| `financeiro` | 4004 | Controle financeiro (Supporting B) | 🔜 Planejado |
| `lojinha` | 4005 | Loja atlética (Supporting B) | 🔜 Planejado |
| `notificacoes` | 4006 | Notificações push (Generic) | 🔜 Planejado |

---

## Rodar em modo desenvolvimento (sem Docker)

```bash
# 1. Sobe apenas a infraestrutura
docker compose up -d postgres rabbitmq

# 2. Instala dependências
npm install --prefix services/associacao
npm install --prefix services/user-auth

# 3. Roda as migrations
cd services/associacao && npx drizzle-kit migrate && cd ../..
cd services/user-auth && npx drizzle-kit migrate && cd ../..

# 4. Sobe os serviços
npm run start:dev --prefix services/associacao
npm run start:dev --prefix services/user-auth
```

---

## Comandos úteis

```bash
# Rebuild de um serviço específico
docker compose up --build associacao
docker compose up --build user-auth

# Ver logs em tempo real
docker compose logs -f user-auth
docker compose logs -f associacao
docker compose logs -f identidade
docker compose logs -f user-auth

# Recriar banco do zero (apaga todos os dados)
docker compose down -v && docker compose up --build

# Acessar banco via psql
docker compose exec postgres psql -U postgres -d athlos_associacao
docker compose exec postgres psql -U postgres -d athlos_user_auth
```