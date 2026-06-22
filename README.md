# Athlos — Backend

Plataforma digital para gerenciamento de Atléticas Universitárias, composta por microsserviços REST consumidos pelo [app Flutter (app-athlos)](https://github.com/GabrielMottaBecker/app-athlos).

## Stack

- **NestJS 11** + TypeScript
- **Drizzle ORM** + **PostgreSQL 16**
- **RabbitMQ 3** (mensageria entre microsserviços + validação de token via RPC)
- **Docker** + **Docker Compose**
- Arquitetura: **DDD + Microsserviços**, com um pacote `shared/` compartilhado entre todos os serviços

---

## Subir tudo com Docker (recomendado)

```bash
# 1. Clone o projeto
git clone https://github.com/GabrielMottaBecker/app-athlos-backend.git
cd app-athlos-backend

# 2. Sobe tudo: Postgres, RabbitMQ, Adminer e todos os microsserviços
docker compose up --build
```

Aguarde os healthchecks passarem (≈ 30s). As migrations rodam automaticamente (`drizzle-kit migrate`) antes de cada serviço iniciar.

> Sempre que alterar variáveis de ambiente, Dockerfile ou `docker-compose.yml`, use `docker compose down` seguido de `docker compose up -d` (ou `--build`) para garantir a recriação completa dos containers — um simples `restart` pode não aplicar as mudanças.

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

## Criar o primeiro Super Admin (bootstrap)

As migrations **não criam usuário padrão**. O primeiro acesso à plataforma precisa ser feito manualmente via Adminer ou `psql`, criando um usuário com a permissão `super_admin` — esse usuário poderá então cadastrar atléticas e administradores pela própria API (`POST /v1/atleticas` exige `super_admin`).

**Passo único — Criar o usuário Super Admin** (sem `atletica_id`, pois não pertence a nenhuma atlética):

```sql
INSERT INTO usuarios (nome, email, senha_hash, role, status, created_at, updated_at)
VALUES (
  'Super Admin Athlos',
  'superadmin@athlos.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
  'SUPER_ADMIN',
  'ATIVO',
  NOW(),
  NOW()
);
```

> O hash acima corresponde à senha `password`. Troque após o primeiro login.

A partir daí, o fluxo normal de criação de uma atlética é:

1. Login do Super Admin (`POST /v1/auth/login`).
2. Criação da atlética e do presidente (`POST /v1/atleticas`, ver seção de Identidade abaixo).
3. Cadastro dos demais membros pelo presidente/admin (`POST /v1/associados` + `POST /v1/usuarios`).
4. Cada membro ativa a própria conta pelo app com **"Primeiro acesso"** (`POST /v1/auth/verificar-associado` → `POST /v1/auth/definir-senha`).

---

## Autenticação

O serviço `identidade` (porta 4002) é responsável por autenticação, geração de JWT e controle de permissões de todos os microsserviços do app Flutter.

> O serviço `user-auth` (porta 4007) é um serviço legado com suporte a HATEOAS, mantido para fins acadêmicos. O app Flutter **não** consome esse serviço.

Use o token retornado pelo login em todos os endpoints protegidos:

```
Authorization: Bearer <accessToken>
```

A validação do JWT entre os demais microsserviços (associação, feed, financeiro, lojinha, notificações) é feita via **RPC sobre RabbitMQ**, sem chamadas HTTP diretas ao serviço de identidade (ver seção de Mensageria).

> Após alterar as permissões de um usuário (ex.: trocar de cargo ou de role), é necessário um novo login no app — as permissões ficam embutidas no JWT vigente e só são recalculadas na emissão de um novo token.

### Permissões disponíveis

| Permissão              | Descrição                                        |
|------------------------|---------------------------------------------------|
| `super_admin`          | Acesso total à administração da plataforma (CRUD de atléticas) |
| `associados:read`      | Visualizar associados                            |
| `associados:write`     | Criar e editar associados                        |
| `cargos:read`          | Visualizar cargos                                |
| `cargos:write`         | Criar e editar cargos                            |
| `eventos:read`         | Visualizar eventos, confirmar/cancelar presença   |
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

> O enum `Permission` (`shared/src/domain/enums/permission.enum.ts`) também define `associados:delete`, `cargos:delete`, `users:delete`, `notificacoes:delete`, `financeiro:delete` e `lojinha:delete` para uso futuro; atualmente nenhum endpoint exige essas permissões além de `users:delete` e `eventos:delete`, que já estão em uso.

---

## Endpoints — Identidade (porta 4002)

### Autenticação

| Método | Rota | Auth | Descrição |
|--------|------|------|-----------|
| `POST` | `/v1/auth/login` | Pública | Login — retorna `accessToken` + `refreshToken` |
| `POST` | `/v1/auth/refresh` | Pública | Renovar access token via refresh token |
| `POST` | `/v1/auth/logout` | Pública | Revogar refresh token |
| `POST` | `/v1/auth/verificar-associado` | Pública | Primeiro acesso (etapa 1): confirma e-mail + telefone cadastrados pelo presidente/admin |
| `POST` | `/v1/auth/definir-senha` | Pública | Primeiro acesso (etapa 2): define a senha definitiva e ativa a conta — já retorna os tokens de sessão |

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

**Exemplo — Primeiro acesso (etapa 1):**
```json
POST /v1/auth/verificar-associado
{
  "email": "joao@atletica.com",
  "telefone": "(44) 99999-9999"
}
```

**Resposta** (token de sessão válido por 10 minutos):
```json
{
  "tokenSessao": "...",
  "nome": "João Silva"
}
```

**Exemplo — Primeiro acesso (etapa 2):**
```json
POST /v1/auth/definir-senha
{
  "tokenSessao": "...",
  "senha": "Senha@123"
}
```

### Usuários

| Método  | Rota | Permissão | Descrição |
|---------|------|-----------|-----------|
| `GET`   | `/v1/usuarios?_page=1&_size=10` | `users:read` | Listar paginado |
| `GET`   | `/v1/usuarios/atletica/:atleticaId` | `users:read` | Listar por atlética |
| `GET`   | `/v1/usuarios/me` | Autenticado | Buscar dados do próprio usuário logado |
| `POST`  | `/v1/usuarios/me/foto` | Autenticado (`multipart/form-data`) | Enviar/atualizar a foto de perfil do usuário logado |
| `GET`   | `/v1/usuarios/:id` | `users:read` | Buscar por ID |
| `POST`  | `/v1/usuarios` | `users:write` | Criar usuário |
| `PATCH` | `/v1/usuarios/:id` | `users:write` | Atualizar dados do usuário |
| `PATCH` | `/v1/usuarios/:id/status` | `users:write` | Ativar / Inativar usuário |

**Exemplo — Upload de foto de perfil:**
```
POST /v1/usuarios/me/foto
Content-Type: multipart/form-data

foto: <arquivo de imagem>
```
Resposta:
```json
{ "fotoUrl": "http://localhost:4002/uploads/usuarios/<arquivo>" }
```
> A URL pública usada para montar o link da foto é controlada pela variável de ambiente `PUBLIC_URL` do serviço `identidade` (`http://localhost:4002` em ambiente local). Os arquivos são persistidos no volume Docker `identidade_uploads`, sobrevivendo a restarts/rebuilds dos containers.

### Atlética

| Método   | Rota | Permissão | Descrição |
|----------|------|-----------|-----------|
| `POST`   | `/v1/atleticas` | `super_admin` | Criar atlética (cadastro feito pelo Super Admin Athlos) |
| `GET`    | `/v1/atleticas` | `super_admin` | Listar todas as atléticas |
| `GET`    | `/v1/atleticas/:id` | `atletica:read` | Buscar dados de uma atlética |
| `PATCH`  | `/v1/atleticas/:id` | `atletica:write` | Atualizar nome, cores ou logo |
| `PATCH`  | `/v1/atleticas/:id/status` | `super_admin` | Ativar ou inativar atlética |
| `DELETE` | `/v1/atleticas/:id` | `super_admin` | Excluir atlética permanentemente |

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

Tipos disponíveis (`TipoEvento`, enum `tipo_evento` no Postgres): `TREINO`, `EVENTO_SOCIAL`, `EXTRAS`, `COMPETICAO`, `AVISO`. O tipo `AVISO` é usado para posts informativos sem data/hora de compromisso, exibidos junto aos eventos no Feed.

| Método   | Rota | Permissão | Descrição |
|----------|------|-----------|-----------|
| `GET`    | `/v1/eventos?_page=1&_size=10` | `eventos:read` | Listar paginado |
| `GET`    | `/v1/eventos/:id` | `eventos:read` | Buscar por ID |
| `GET`    | `/v1/eventos/atletica/:atleticaId` | `eventos:read` | Listar por atlética |
| `GET`    | `/v1/eventos/atletica/:atleticaId/tipo/:type` | `eventos:read` | Filtrar por tipo |
| `POST`   | `/v1/eventos` | `eventos:write` | Criar evento ou post/aviso |
| `PUT`    | `/v1/eventos/:id` | `eventos:write` | Atualizar evento ou post/aviso |
| `DELETE` | `/v1/eventos/:id` | `eventos:delete` | Remover evento ou post/aviso |
| `POST`   | `/v1/eventos/:id/presencas` | `eventos:read` | Confirmar presença |
| `DELETE` | `/v1/eventos/:id/presencas/:usuarioId` | `eventos:read` | Cancelar presença |
| `GET`    | `/v1/eventos/:id/presencas` | `eventos:write` | Listar quem confirmou presença (uso administrativo) |

**Exemplo — Criar evento:**
```json
POST /v1/eventos
{
  "title": "TREINO DE FUTEBOL",
  "date": "JUN 14",
  "type": "TREINO",
  "typeColor": 4283215473,
  "time": "19:00 - 21:00",
  "place": "Campo de Treinamento Alpha",
  "bgColor": 4281609055,
  "atleticaId": "uuid-da-atletica"
}
```

> `title`, `date`, `type`, `typeColor`, `time`, `place`, `bgColor` e `atleticaId` são **todos obrigatórios** — omitir qualquer um deles resulta em `400 Bad Request` (`class-validator`). `typeColor` e `bgColor` são valores inteiros de cor (ARGB), gerados no app a partir do tipo selecionado.

---

## Endpoints — Financeiro (porta 4004)

> Módulo disponível no backend; ainda sem tela correspondente no app Flutter (integração planejada).

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
| `feed.eventos.created.exchange` | `evento.created` | feed | Novo evento/post publicado |
| `feed.eventos.updated.exchange` | `evento.updated` | feed | Evento/post atualizado |
| `feed.eventos.deleted.exchange` | `evento.deleted` | feed | Evento/post removido |

### Consumers (Notificações)

| Queue | Exchange | Descrição |
|-------|----------|-----------|
| `notificacoes.feed.eventos.created` | `feed.eventos.created.exchange` | Gera notificação push de novo evento/post |
| `notificacoes.associados.status-changed` | `associacao.associados.status-changed.exchange` | Notifica mudança de status da associação |
| `notificacoes.associados.updated` | `associacao.associados.updated.exchange` | Notifica atualização de cadastro |

### Validação de token entre serviços

Os microsserviços validam tokens JWT via RabbitMQ RPC, sem chamadas HTTP diretas ao serviço `identidade`.

**Exchange:** `auth.exchange` | **Routing key:** `auth.validate-token`

```typescript
const user = await this.authRpcService.validateToken(token);
// lança UnauthorizedException automaticamente se inválido
```

---

## Estrutura do projeto

```
app-athlos-backend/
├── docker/
│   └── postgres/init/
│       └── 01-create-databases.sql         # Cria um banco Postgres dedicado por serviço
├── docs/
│   └── superpowers/                        # Documentação de apoio adicional
├── shared/src/
│   ├── contracts/events/                    # Enums de exchanges e routing keys RabbitMQ por serviço
│   │   ├── associacao-events.enum.ts
│   │   ├── feed-events.enum.ts
│   │   ├── financeiro-events.enum.ts
│   │   ├── identidade-events.enum.ts
│   │   └── lojinha-events.enum.ts
│   ├── domain/enums/
│   │   └── permission.enum.ts               # Enum central de permissões (Permission)
│   ├── infra/
│   │   ├── auth/
│   │   │   ├── auth-rpc.service.ts          # Cliente RPC de validação de token via RabbitMQ
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts        # Guard global de autenticação
│   │   │   │   └── permissions.guard.ts     # Guard de autorização (@RequirePermissions)
│   │   │   ├── interfaces/authenticated-user.interface.ts
│   │   │   └── shared-auth.module.ts
│   │   ├── database/drizzle.service.ts      # Conexão base com Drizzle ORM (pool Postgres)
│   │   ├── decorators/
│   │   │   ├── current-user.decorator.ts    # @CurrentUser — injeta o usuário autenticado
│   │   │   ├── permissions.decorator.ts     # @RequirePermissions — exige permissão(ões)
│   │   │   └── public.decorator.ts          # @Public — libera rota do guard de autenticação
│   │   ├── hateoas/                         # Interceptor e decorators HATEOAS (usado pelo user-auth legado)
│   │   ├── http/bootstrap-http-app.ts       # Bootstrap compartilhado: CORS, Swagger, ValidationPipe, prefixo /v1
│   │   └── messaging/
│   │       ├── rabbitmq.service.ts          # Conexão e canal RabbitMQ
│   │       └── shared-messaging.service.ts  # Publish/consume genéricos
│   └── shared.module.ts                     # Módulo Nest que agrega toda a infraestrutura compartilhada
├── services/
│   ├── associacao/    # Porta 4001 — Associados e Hierarquia (Core Domain)
│   │   └── src/modules/associacao/
│   │       ├── associados/   # application (dto, services) · domain (entities, repositórios) · infra (controller, schema Drizzle, repositório)
│   │       └── hierarquia/   # Cargos — mesma estrutura DDD
│   ├── identidade/    # Porta 4002 — Auth, Usuários e Atlética
│   │   └── src/modules/identidade/
│   │       ├── usuarios/     # Auth, Usuários, ativação de conta (verificar-associado/definir-senha), upload de foto
│   │       └── atleticas/    # CRUD de atléticas (Super Admin)
│   ├── feed/          # Porta 4003 — Eventos, Posts e Presenças
│   │   └── src/modules/feed/eventos/
│   ├── financeiro/    # Porta 4004 — Categorias e Transações (planejado no app)
│   │   └── src/modules/financeiro/
│   │       ├── categorias/
│   │       └── transacoes/
│   ├── lojinha/       # Porta 4005 — Produtos e Carrinho
│   │   └── src/modules/lojinha/
│   │       ├── produtos/
│   │       └── carrinho/
│   ├── notificacoes/  # Porta 4006 — Inbox e Device Tokens
│   │   └── src/modules/notificacoes/
│   │       ├── notificacoes/
│   │       ├── device-tokens/
│   │       └── consumers/    # Listeners RabbitMQ que geram notificações a partir de eventos de outros serviços
│   └── user-auth/     # Porta 4007 — Auth legado com HATEOAS (não usado pelo app)
│       └── src/modules/
│           ├── auth/
│           └── users/
├── docker-compose.yml          # Orquestração de Postgres, RabbitMQ, Adminer e todos os microsserviços
├── Dockerfile.service          # Dockerfile genérico parametrizado por SERVICE_NAME (build arg)
├── tsconfig.base.json          # Configuração TS compartilhada (paths dos aliases @shared, @identidade, etc.)
└── package.json                # Scripts de start/typecheck/lint por serviço (monorepo)
```

Cada módulo de domínio (ex.: `associados`, `eventos`, `produtos`) segue o mesmo padrão DDD em três camadas:

```
<dominio>/
├── application/
│   ├── dto/        # DTOs de entrada/saída com validação (class-validator) e documentação (Swagger)
│   └── services/   # Casos de uso / regras de orquestração
├── domain/
│   ├── models/      # Entidades de domínio
│   └── repositories/# Contratos abstratos de repositório
└── infra/
    ├── controllers/ # Controllers NestJS (rotas REST)
    ├── database/schemas/   # Definição de tabelas Drizzle (pgTable, pgEnum)
    └── repositories/       # Implementação concreta dos repositórios (Drizzle)
```

> **Drizzle**: ao alterar um schema (`*.schema.ts`), gere a migration com `drizzle-kit generate` dentro do serviço correspondente e garanta que o arquivo de migration SQL **e** o `drizzle/meta/_journal.json` sejam commitados juntos — divergência entre eles impede o `drizzle-kit migrate` de rodar corretamente no container.

---

## Microsserviços

| Serviço | Porta | Domínio | Status |
|---------|-------|---------|--------|
| `associacao` | 4001 | Associados e hierarquia (Core Domain) | ✅ Implementado |
| `identidade` | 4002 | Autenticação, usuários e atlética | ✅ Implementado |
| `feed` | 4003 | Eventos, posts e presenças | ✅ Implementado |
| `financeiro` | 4004 | Controle financeiro | ✅ Implementado (sem tela no app ainda) |
| `lojinha` | 4005 | Loja da atlética | ✅ Implementado |
| `notificacoes` | 4006 | Notificações push e device tokens | ✅ Implementado |
| `user-auth` | 4007 | Auth legado com HATEOAS | ⚠️ Legado (não usado pelo app) |

---

## Comandos úteis

```bash
# Rebuild de um serviço específico
docker compose build --no-cache identidade && docker compose up identidade

# Recriar containers para garantir aplicação de mudanças de config/env
docker compose down && docker compose up -d

# Ver logs em tempo real
docker compose logs -f identidade
docker compose logs -f associacao
docker compose logs -f feed
docker compose logs -f notificacoes
docker compose logs -f lojinha
docker compose logs -f financeiro

# Recriar banco do zero (apaga todos os dados, inclusive uploads)
docker compose down -v && docker compose up --build

# Acessar banco via psql
docker compose exec postgres psql -U postgres -d athlos_identidade
docker compose exec postgres psql -U postgres -d athlos_associacao
docker compose exec postgres psql -U postgres -d athlos_feed
docker compose exec postgres psql -U postgres -d athlos_notificacoes
docker compose exec postgres psql -U postgres -d athlos_lojinha
docker compose exec postgres psql -U postgres -d athlos_financeiro

# Gerar uma nova migration Drizzle (rodar dentro do serviço alterado)
npm run typecheck --prefix services/<servico>
npx drizzle-kit generate --config services/<servico>/drizzle.config.ts
```

---

## App Flutter

Este backend é consumido pelo app mobile **Athlos**: [github.com/GabrielMottaBecker/app-athlos](https://github.com/GabrielMottaBecker/app-athlos).
