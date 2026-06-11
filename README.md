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

Aguarde os healthchecks passarem (≈ 30s). As migrations rodam automaticamente antes de cada serviço iniciar.

| Serviço | URL |
|---------|-----|
| **Identidade API** | http://localhost:4002 |
| **Swagger — Identidade** | http://localhost:4002/docs |
| **Associação API** | http://localhost:4001 |
| **Swagger — Associação** | http://localhost:4001/docs |
| **Feed API** | http://localhost:4003 |
| **Swagger — Feed** | http://localhost:4003/docs |
| **Financeiro API** | http://localhost:4004 |
| **Swagger — Financeiro** | http://localhost:4004/docs |
| **Lojinha API** | http://localhost:4005 |
| **Swagger — Lojinha** | http://localhost:4005/docs |
| **Notificações API** | http://localhost:4006 |
| **Swagger — Notificações** | http://localhost:4006/docs |
| **User Auth API** *(legado)* | http://localhost:4007 |
| **Swagger — User Auth** *(legado)* | http://localhost:4007/docs |
| **Adminer (DB)** | http://localhost:8080 |
| **RabbitMQ UI** | http://localhost:15672 (admin / admin) |

---

## Criar usuário administrador (primeiro acesso)

As migrations **não criam usuário padrão** no serviço `identidade`. É necessário criar manualmente via Adminer ou psql.

**Passo 1 — Criar a atlética:**

```sql
INSERT INTO atleticas (nome, nome_presidente, cor_primaria, cor_fundo)
VALUES ('Nome da Atlética', 'Nome do Presidente', '#2563EB', '#F8FAFC')
RETURNING id;
```

**Passo 2 — Criar o usuário admin** (substitua o `atletica_id` pelo `id` retornado acima):

```sql
INSERT INTO usuarios (nome, email, senha_hash, role, status, atletica_id, created_at, updated_at)
VALUES (
  'Nome do Admin',
  'admin@atletica.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'ADMINISTRADOR',
  'ATIVO',
  'UUID_DA_ATLETICA_AQUI',
  NOW(),
  NOW()
);
```

> O hash acima corresponde à senha `password`. Troque após o primeiro login.

---

## Autenticação

O serviço `identidade` (porta 4002) é responsável por autenticação, geração de JWT e controle de permissões de todos os microsserviços do app Flutter.

> O serviço `user-auth` (porta 4007) é um serviço legado com suporte a HATEOAS, mantido para fins acadêmicos. O app Flutter **não** consome esse serviço.

Use o token retornado pelo login em todos os endpoints protegidos:

```
Authorization: Bearer <accessToken>
```

### Permissões disponíveis

| Permissão              | Descrição                                        |
|------------------------|--------------------------------------------------|
| `associados:read`      | Visualizar associados                            |
| `associados:write`     | Criar e editar associados                        |
| `cargos:read`          | Visualizar cargos                                |
| `cargos:write`         | Criar e editar cargos                            |
| `eventos:read`         | Visualizar eventos e confirmar presença          |
| `eventos:write`        | Criar e editar eventos                           |
| `eventos:delete`       | Remover eventos                                  |
| `notificacoes:read`    | Visualizar notificações e gerenciar device tokens|
| `notificacoes:write`   | Criar notificações manuais                       |
| `users:read`           | Visualizar usuários do sistema                   |
| `users:write`          | Criar e editar usuários do sistema               |
| `lojinha:read`         | Visualizar produtos e gerar link do carrinho     |
| `lojinha:write`        | Criar e editar produtos                          |
| `financeiro:read`      | Visualizar categorias e transações               |
| `financeiro:write`     | Criar e editar categorias e transações           |
| `atletica:read`        | Visualizar dados da atlética                     |
| `atletica:write`       | Atualizar dados da atlética                      |

---

## Endpoints — Identidade (porta 4002)

### Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/v1/auth/login` | Pública | Login — retorna `accessToken` + `refreshToken` |
| `POST` | `/v1/auth/refresh` | Pública | Renovar access token via refresh token |
| `POST` | `/v1/auth/logout` | Pública | Revogar refresh token |

**Exemplo — Login:**
```json
POST /v1/auth/login
{
  "email": "admin@atletica.com",
  "senha": "password"
}
```

**Resposta:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "uuid-do-refresh-token"
}
```

> O `role`, `userId` e `atleticaId` são extraídos do payload JWT no frontend. Não são retornados diretamente no corpo da resposta.

### Usuários

| Método  | Rota | Permissão | Descrição |
|---------|------|-----------|-----------|
| `GET`   | `/v1/usuarios?_page=1&_size=10` | `users:read` | Listar paginado |
| `GET`   | `/v1/usuarios/:id` | `users:read` | Buscar por ID |
| `GET`   | `/v1/usuarios/atletica/:atleticaId` | `users:read` | Listar por atlética |
| `POST`  | `/v1/usuarios` | `users:write` | Criar usuário |
| `PATCH` | `/v1/usuarios/:id` | `users:write` | Atualizar dados do usuário |
| `PATCH` | `/v1/usuarios/:id/status` | `users:write` | Ativar / Inativar usuário |

### Atlética

| Método  | Rota | Auth | Descrição |
|---------|------|------|-----------|
| `POST`  | `/v1/atleticas` | Pública | Criar atlética (onboarding do presidente) |
| `GET`   | `/v1/atleticas/:id` | `atletica:read` | Buscar dados da atlética |
| `PATCH` | `/v1/atleticas/:id` | `atletica:write` | Atualizar nome, cores ou logo |

**Exemplo — Criar atlética:**
```json
POST /v1/atleticas
{
  "nome": "Pantheon Nexgen",
  "nomePresidente": "Gabriel Breier",
  "corPrimaria": "#2563EB",
  "corFundo": "#F8FAFC"
}
```

---

## Endpoints — Associação (porta 4001)

### Associados

| Método  | Rota | Permissão | Descrição |
|---------|------|-----------|-----------|
| `GET`   | `/v1/associados?_page=1&_size=10` | `associados:read` | Listar paginado |
| `GET`   | `/v1/associados/:id` | `associados:read` | Buscar por ID |
| `GET`   | `/v1/associados/atletica/:atleticaId` | `associados:read` | Listar por atlética |
| `POST`  | `/v1/associados` | `associados:write` | Cadastrar associado |
| `PATCH` | `/v1/associados/:id` | `associados:write` | Atualizar dados do associado |
| `PATCH` | `/v1/associados/:id/status` | `associados:write` | Ativar / Inativar associado |
| `PATCH` | `/v1/associados/:id/cargo` | `associados:write` | Atribuir ou remover cargo |

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

> O campo `taxaAthlos` é calculado automaticamente: `valorAssociacao × 0,5%`.

### Cargos

| Método  | Rota | Permissão | Descrição |
|---------|------|-----------|-----------|
| `GET`   | `/v1/cargos?_page=1&_size=10` | `cargos:read` | Listar paginado |
| `GET`   | `/v1/cargos/:id` | `cargos:read` | Buscar por ID |
| `GET`   | `/v1/cargos/atletica/:atleticaId` | `cargos:read` | Listar por atlética |
| `POST`  | `/v1/cargos` | `cargos:write` | Criar cargo |
| `PUT`   | `/v1/cargos/:id` | `cargos:write` | Atualizar cargo |

---

## Endpoints — Feed (porta 4003)

### Eventos

| Método   | Rota | Permissão | Descrição |
|----------|------|-----------|-----------|
| `GET`    | `/v1/eventos?_page=1&_size=10` | `eventos:read` | Listar paginado |
| `GET`    | `/v1/eventos/:id` | `eventos:read` | Buscar por ID |
| `GET`    | `/v1/eventos/atletica/:atleticaId` | `eventos:read` | Listar por atlética |
| `GET`    | `/v1/eventos/atletica/:atleticaId/tipo/:type` | `eventos:read` | Filtrar por tipo (`TREINO`, `EVENTO`, `EXTRA`) |
| `POST`   | `/v1/eventos` | `eventos:write` | Criar evento ou post |
| `PUT`    | `/v1/eventos/:id` | `eventos:write` | Atualizar evento ou post |
| `DELETE` | `/v1/eventos/:id` | `eventos:delete` | Remover evento ou post |
| `POST`   | `/v1/eventos/:id/presencas` | `eventos:read` | Confirmar presença |
| `DELETE` | `/v1/eventos/:id/presencas/:usuarioId` | `eventos:read` | Cancelar presença |

**Exemplo — Criar evento:**
```json
POST /v1/eventos
{
  "date": "JUN 14",
  "type": "TREINO",
  "title": "TREINO DE FUTEBOL",
  "time": "19:00 - 21:00",
  "place": "Campo de Treinamento Alpha",
  "atleticaId": "uuid-da-atletica"
}
```

---

## Endpoints — Financeiro (porta 4004)

> Módulo planejado — sem tela no app Flutter ainda. Disponível para integração futura.

### Categorias

| Método  | Rota | Permissão | Descrição |
|---------|------|-----------|-----------|
| `GET`   | `/v1/categorias?_page=1&_size=10` | `financeiro:read` | Listar paginado |
| `GET`   | `/v1/categorias/:id` | `financeiro:read` | Buscar por ID |
| `GET`   | `/v1/categorias/atletica/:atleticaId` | `financeiro:read` | Listar por atlética |
| `POST`  | `/v1/categorias` | `financeiro:write` | Criar categoria |
| `PUT`   | `/v1/categorias/:id` | `financeiro:write` | Atualizar categoria |

### Transações

| Método  | Rota | Permissão | Descrição |
|---------|------|-----------|-----------|
| `GET`   | `/v1/transacoes?_page=1&_size=10` | `financeiro:read` | Listar paginado |
| `GET`   | `/v1/transacoes/:id` | `financeiro:read` | Buscar por ID |
| `GET`   | `/v1/transacoes/atletica/:atleticaId` | `financeiro:read` | Listar por atlética |
| `POST`  | `/v1/transacoes` | `financeiro:write` | Registrar transação |
| `PUT`   | `/v1/transacoes/:id` | `financeiro:write` | Atualizar transação |

---

## Endpoints — Lojinha (porta 4005)

### Produtos

| Método  | Rota | Permissão | Descrição |
|---------|------|-----------|-----------|
| `GET`   | `/v1/produtos?_page=1&_size=10` | `lojinha:read` | Listar paginado |
| `GET`   | `/v1/produtos/:id` | `lojinha:read` | Buscar por ID |
| `GET`   | `/v1/produtos/atletica/:atleticaId` | `lojinha:read` | Listar por atlética |
| `POST`  | `/v1/produtos` | `lojinha:write` | Criar produto |
| `PUT`   | `/v1/produtos/:id` | `lojinha:write` | Atualizar produto |
| `PATCH` | `/v1/produtos/:id/status` | `lojinha:write` | Alterar status (`DISPONIVEL`, `ESGOTADO`, `INATIVO`) |

### Carrinho

| Método | Rota | Permissão | Descrição |
|--------|------|-----------|-----------|
| `POST` | `/v1/carrinho/whatsapp` | `lojinha:read` | Gerar link WhatsApp com itens do carrinho |

**Exemplo — Gerar link WhatsApp:**
```json
POST /v1/carrinho/whatsapp
{
  "itens": [
    { "produtoId": "uuid-do-produto", "quantidade": 2 }
  ]
}
```

---

## Endpoints — Notificações (porta 4006)

### Inbox

| Método  | Rota | Permissão | Descrição |
|---------|------|-----------|-----------|
| `GET`   | `/v1/notificacoes?_page=1&_size=10` | `notificacoes:read` | Inbox do usuário autenticado |
| `GET`   | `/v1/notificacoes/nao-lidas/count` | `notificacoes:read` | Contar notificações não lidas |
| `POST`  | `/v1/notificacoes` | `notificacoes:write` | Criar notificação manual |
| `PATCH` | `/v1/notificacoes/:id/lida` | `notificacoes:read` | Marcar uma como lida |
| `PATCH` | `/v1/notificacoes/lidas` | `notificacoes:read` | Marcar todas como lidas |

### Device Tokens

| Método   | Rota | Permissão | Descrição |
|----------|------|-----------|-----------|
| `POST`   | `/v1/device-tokens` | `notificacoes:read` | Registrar token FCM (ao fazer login) |
| `DELETE` | `/v1/device-tokens/:token` | `notificacoes:read` | Desativar token (ao fazer logout) |

---

## Mensageria — Eventos RabbitMQ

### Publicadores

| Exchange | Routing Key | Serviço | Descrição |
|----------|-------------|---------|-----------|
| `associacao.associados.created.exchange` | `associado.created` | associacao | Novo associado cadastrado |
| `associacao.associados.updated.exchange` | `associado.updated` | associacao | Associado atualizado |
| `associacao.associados.status-changed.exchange` | `associado.status-changed` | associacao | Status do associado alterado |
| `identidade.usuarios.created.exchange` | `usuario.created` | identidade | Novo usuário cadastrado |
| `identidade.usuarios.updated.exchange` | `usuario.updated` | identidade | Usuário atualizado |
| `identidade.usuarios.status-changed.exchange` | `usuario.status-changed` | identidade | Status do usuário alterado |
| `feed.eventos.created.exchange` | `evento.created` | feed | Novo evento publicado |
| `feed.eventos.updated.exchange` | `evento.updated` | feed | Evento atualizado |
| `feed.eventos.deleted.exchange` | `evento.deleted` | feed | Evento removido |

### Consumers (Notificações)

| Queue | Exchange | Descrição |
|-------|----------|-----------|
| `notificacoes.feed.eventos.created` | `feed.eventos.created.exchange` | Gera notificação push de novo evento |
| `notificacoes.associados.status-changed` | `associacao.associados.status-changed.exchange` | Notifica mudança de status da associação |
| `notificacoes.associados.updated` | `associacao.associados.updated.exchange` | Notifica atualização de cadastro |

### Validação de token entre serviços

Os microsserviços validam tokens JWT via RabbitMQ RPC, sem chamadas HTTP diretas.

**Exchange:** `auth.exchange` | **Routing key:** `auth.validate-token`

```typescript
const user = await this.authRpcService.validateToken(token);
// lança UnauthorizedException automaticamente se inválido
```

---

## Estrutura do Projeto

```
athlos/
├── docker/
│   └── postgres/init/
│       └── 01-create-databases.sql         # Criação dos bancos de cada serviço
├── shared/src/
│   ├── contracts/events/                   # Enums de exchanges e routing keys RabbitMQ
│   ├── domain/enums/
│   │   └── permission.enum.ts              # Enum central de permissões
│   └── infra/
│       ├── auth/                           # Guards JWT, RPC de validação, decorators
│       ├── database/drizzle.service.ts     # Conexão base com Drizzle ORM
│       ├── decorators/                     # @CurrentUser, @RequirePermissions, @Public
│       ├── hateoas/                        # Interceptor e decorators HATEOAS
│       ├── http/bootstrap-http-app.ts      # Bootstrap compartilhado (CORS, Swagger, pipes, prefixo v1)
│       └── messaging/                      # RabbitMQ publisher e consumer base
├── services/
│   ├── associacao/    # Porta 4001 — Associados e Hierarquia (Core Domain)
│   ├── identidade/    # Porta 4002 — Auth, Usuários e Atlética
│   ├── feed/          # Porta 4003 — Eventos, Posts e Presenças
│   ├── financeiro/    # Porta 4004 — Categorias e Transações (planejado)
│   ├── lojinha/       # Porta 4005 — Produtos e Carrinho (planejado)
│   ├── notificacoes/  # Porta 4006 — Inbox e Device Tokens
│   └── user-auth/     # Porta 4007 — Auth legado com HATEOAS (não usado pelo app)
├── docker-compose.yml
├── Dockerfile.service
└── tsconfig.base.json
```

---

## Microsserviços

| Serviço | Porta | Domínio | Status |
|---------|-------|---------|--------|
| `associacao` | 4001 | Associados e hierarquia (Core Domain) | ✅ Implementado |
| `identidade` | 4002 | Autenticação, usuários e atlética | ✅ Implementado |
| `feed` | 4003 | Eventos, posts e presenças | ✅ Implementado |
| `financeiro` | 4004 | Controle financeiro | ✅ Implementado |
| `lojinha` | 4005 | Loja atlética | ✅ Implementado |
| `notificacoes` | 4006 | Notificações push e device tokens | ✅ Implementado |
| `user-auth` | 4007 | Auth legado com HATEOAS | ⚠️ Legado |

---

## Comandos úteis

```bash
# Rebuild de um serviço específico
docker compose build --no-cache identidade && docker compose up identidade

# Ver logs em tempo real
docker compose logs -f identidade
docker compose logs -f associacao
docker compose logs -f feed
docker compose logs -f notificacoes
docker compose logs -f lojinha
docker compose logs -f financeiro

# Recriar banco do zero (apaga todos os dados)
docker compose down -v && docker compose up --build

# Acessar banco via psql
docker compose exec postgres psql -U postgres -d athlos_identidade
docker compose exec postgres psql -U postgres -d athlos_associacao
docker compose exec postgres psql -U postgres -d athlos_feed
docker compose exec postgres psql -U postgres -d athlos_notificacoes
docker compose exec postgres psql -U postgres -d athlos_lojinha
docker compose exec postgres psql -U postgres -d athlos_financeiro
```