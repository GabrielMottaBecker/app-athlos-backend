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

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| `GET` | `/v1/associados?_page=1&_size=10` | `associados:read` | Listar paginado |
| `GET` | `/v1/associados/:id` | `associados:read` | Buscar por ID |
| `GET` | `/v1/associados/atletica/:atleticaId` | `associados:read` | Listar por Atlética |
| `POST` | `/v1/associados` | `associados:write` | Cadastrar (calcula taxa 0,5% automaticamente) |
| `PUT` | `/v1/associados/:id` | `associados:write` | Atualizar dados |
| `PATCH` | `/v1/associados/:id/status` | `associados:write` | Ativar / Inativar |
| `DELETE` | `/v1/associados/:id` | `associados:delete` | Remover |

### Exemplo de criação

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

> O campo `taxaAthlos` será calculado automaticamente: `500 × 0,5% = R$ 2,50` (RF08)

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

# Recriar banco do zero (apaga todos os dados)
docker compose down -v && docker compose up --build

# Acessar banco via psql
docker compose exec postgres psql -U postgres -d athlos_associacao
docker compose exec postgres psql -U postgres -d athlos_user_auth
```