import type { Produto } from "@lojinha/produtos/domain/models/produto.entity";
import type { StatusProduto } from "@lojinha/produtos/domain/models/status-produto.enum";
import type { PaginationParams } from "@shared/infra/hateoas";

export const PRODUTO_REPOSITORY = Symbol("PRODUTO_REPOSITORY");

export interface ProdutoRepository {
  create(produto: Produto): Promise<void>;
  update(produto: Produto): Promise<void>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: StatusProduto): Promise<void>;
  findById(id: string): Promise<Produto | null>;
  findByAtletica(atleticaId: string): Promise<Produto[]>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: Produto[]; total: number }>;
}
