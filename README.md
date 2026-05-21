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

# 2. Sobe tudo: Postgres, RabbitMQ, Adminer e o serviço de Associação
docker compose up --build
```

Aguarde os healthchecks passarem (≈ 30s). Depois acesse:

| Serviço | URL |
|---------|-----|
| **Associação API** | http://localhost:4001 |
| **Swagger (docs)** | http://localhost:4001/docs |
| **Adminer (DB)** | http://localhost:8080 |
| **RabbitMQ UI** | http://localhost:15672 (admin / admin) |

> A migration roda automaticamente antes do serviço iniciar.

---

## Rodar em modo desenvolvimento (sem Docker)

```bash
# 1. Sobe apenas a infraestrutura
docker compose up -d postgres rabbitmq

# 2. Copia o .env
cp services/associacao/.env.example services/associacao/.env

# 3. Instala dependências
npm install --prefix services/associacao

# 4. Roda a migration
cd services/associacao && npx drizzle-kit migrate && cd ../..

# 5. Sobe o serviço em watch mode
npm run start:associacao
```

---

## Endpoints — Microsserviço de Associação (porta 4001)

Todos os endpoints exigem `Authorization: Bearer <token>`.  
Por enquanto, gere um JWT manualmente com o secret `athlos-super-secret-change-in-prod` e os campos:

```json
{
  "sub": "uuid-qualquer",
  "email": "admin@athlos.com",
  "permissions": ["associados:read", "associados:write", "associados:delete"]
}
```

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

## Microsserviços planejados (Context Map)

| Serviço | Porta | Domínio |
|---------|-------|---------|
| `associacao` | 4001 | Associados, hierarquia (Core Domain) |
| `identidade` | 4002 | Autenticação e segurança |
| `feed` | 4003 | Eventos e treinos (Supporting A) |
| `financeiro` | 4004 | Controle financeiro (Supporting B) |
| `lojinha` | 4005 | Loja atlética (Supporting B) |
| `notificacoes` | 4006 | Notificações push (Generic) |

---

## Comandos úteis

```bash
# Rebuild apenas o serviço de associação
docker compose up --build associacao

# Ver logs em tempo real
docker compose logs -f associacao

# Recriar banco do zero
docker compose down -v && docker compose up --build

# Acessar banco via psql
docker compose exec postgres psql -U postgres -d athlos_associacao
```
