import type { Notificacao } from "@notificacoes/notificacoes/domain/models/notificacao.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const NOTIFICACAO_REPOSITORY = Symbol("NOTIFICACAO_REPOSITORY");

export interface NotificacaoRepository {
  create(notificacao: Notificacao): Promise<void>;
  findInboxPaginated(
    usuarioId: string,
    atleticaId: string,
    params: PaginationParams,
  ): Promise<{ rows: Notificacao[]; total: number }>;
  countUnread(usuarioId: string, atleticaId: string): Promise<number>;
  markAsRead(notificacaoId: string, usuarioId: string): Promise<void>;
  markAllAsRead(usuarioId: string, atleticaId: string): Promise<void>;
}
