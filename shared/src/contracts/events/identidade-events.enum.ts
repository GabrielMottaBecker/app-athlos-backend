export enum IdentidadeExchangeName {
  USUARIO_CREATED = "identidade.usuarios.created.exchange",
  USUARIO_UPDATED = "identidade.usuarios.updated.exchange",
  USUARIO_DELETED = "identidade.usuarios.deleted.exchange",
  USUARIO_STATUS_CHANGED = "identidade.usuarios.status-changed.exchange",
}

export enum IdentidadeRoutingKey {
  USUARIO_CREATED = "usuario.created",
  USUARIO_UPDATED = "usuario.updated",
  USUARIO_DELETED = "usuario.deleted",
  USUARIO_STATUS_CHANGED = "usuario.status-changed",
}
