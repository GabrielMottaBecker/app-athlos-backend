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
