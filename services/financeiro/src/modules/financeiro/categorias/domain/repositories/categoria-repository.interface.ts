import type { Categoria } from "@financeiro/categorias/domain/models/categoria.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const CATEGORIA_REPOSITORY = Symbol("CATEGORIA_REPOSITORY");

export interface CategoriaRepository {
  create(categoria: Categoria): Promise<void>;
  update(categoria: Categoria): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Categoria | null>;
  findByAtletica(atleticaId: string): Promise<Categoria[]>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: Categoria[]; total: number }>;
}
