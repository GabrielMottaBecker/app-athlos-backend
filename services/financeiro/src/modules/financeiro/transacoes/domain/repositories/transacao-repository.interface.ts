import type { Transacao } from "@financeiro/transacoes/domain/models/transacao.entity";
import type { TipoTransacao } from "@financeiro/transacoes/domain/models/tipo-transacao.enum";
import type { PaginationParams } from "@shared/infra/hateoas";

export const TRANSACAO_REPOSITORY = Symbol("TRANSACAO_REPOSITORY");

export interface TransacaoRepository {
  create(transacao: Transacao): Promise<void>;
  update(transacao: Transacao): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Transacao | null>;
  findByAtletica(atleticaId: string): Promise<Transacao[]>;
  findByCategoria(categoriaId: string): Promise<Transacao[]>;
  findByTipo(atleticaId: string, tipo: TipoTransacao): Promise<Transacao[]>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: Transacao[]; total: number }>;
}
