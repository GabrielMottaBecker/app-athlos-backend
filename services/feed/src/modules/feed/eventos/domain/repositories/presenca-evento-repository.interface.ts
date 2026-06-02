import type { PresencaEvento } from "@feed/eventos/domain/models/presenca-evento.entity";

export const PRESENCA_EVENTO_REPOSITORY = Symbol("PRESENCA_EVENTO_REPOSITORY");

export interface PresencaEventoRepository {
  confirm(presenca: PresencaEvento): Promise<void>;
  delete(eventoId: string, usuarioId: string): Promise<void>;
  findByEventoAndUsuario(eventoId: string, usuarioId: string): Promise<PresencaEvento | null>;
}
