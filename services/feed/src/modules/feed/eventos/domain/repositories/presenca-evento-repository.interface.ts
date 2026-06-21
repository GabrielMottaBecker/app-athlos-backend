import type { PresencaEvento } from "@feed/eventos/domain/models/presenca-evento.entity";

export const PRESENCA_EVENTO_REPOSITORY = Symbol("PRESENCA_EVENTO_REPOSITORY");

export interface PresencaEventoRepository {
  confirm(presenca: PresencaEvento): Promise<void>;
  delete(eventoId: string, usuarioId: string): Promise<void>;
  findByEventoAndUsuario(eventoId: string, usuarioId: string): Promise<PresencaEvento | null>;
  /** Retorna o subconjunto de `eventoIds` em que `usuarioId` ja confirmou presenca. */
  findConfirmedEventIds(usuarioId: string, eventoIds: string[]): Promise<Set<string>>;
  /** Lista todas as presencas confirmadas de um evento (uso administrativo). */
  findByEvento(eventoId: string): Promise<PresencaEvento[]>;
}