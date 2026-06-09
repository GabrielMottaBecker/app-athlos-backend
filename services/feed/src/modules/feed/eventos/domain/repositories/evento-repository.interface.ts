import type { Evento, TipoEvento } from "@feed/eventos/domain/models/evento.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const EVENTO_REPOSITORY = Symbol("EVENTO_REPOSITORY");

export interface EventoRepository {
  create(evento: Evento): Promise<Evento | null>;
  update(evento: Evento): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Evento | null>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: Evento[]; total: number }>;
  findByAtletica(atleticaId: string): Promise<Evento[]>;
  findByAtleticaAndType(atleticaId: string, type: TipoEvento): Promise<Evento[]>;
}
