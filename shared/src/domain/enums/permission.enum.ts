export enum Permission {
  // Super Admin
  SUPER_ADMIN = "super_admin",

  // Associados
  ASSOCIADOS_READ   = "associados:read",
  ASSOCIADOS_WRITE  = "associados:write",
  ASSOCIADOS_DELETE = "associados:delete",

  // Users
  USERS_READ   = "users:read",
  USERS_WRITE  = "users:write",
  USERS_DELETE = "users:delete",

  // Cargos
  CARGOS_READ   = "cargos:read",
  CARGOS_WRITE  = "cargos:write",
  CARGOS_DELETE = "cargos:delete",

  // Eventos
  EVENTOS_READ   = "eventos:read",
  EVENTOS_WRITE  = "eventos:write",
  EVENTOS_DELETE = "eventos:delete",

  // Notificações
  NOTIFICACOES_READ   = "notificacoes:read",
  NOTIFICACOES_WRITE  = "notificacoes:write",
  NOTIFICACOES_DELETE = "notificacoes:delete",

  // Financeiro
  FINANCEIRO_READ   = "financeiro:read",
  FINANCEIRO_WRITE  = "financeiro:write",
  FINANCEIRO_DELETE = "financeiro:delete",

  // Lojinha
  LOJINHA_READ   = "lojinha:read",
  LOJINHA_WRITE  = "lojinha:write",
  LOJINHA_DELETE = "lojinha:delete",

  // Atlética
  ATLETICA_READ  = "atletica:read",
  ATLETICA_WRITE = "atletica:write",
}