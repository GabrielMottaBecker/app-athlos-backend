import type { Cargo } from "@hierarquia/domain/models/cargo.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const CARGO_REPOSITORY = Symbol("CARGO_REPOSITORY");

export interface CargoRepository {
  create(cargo: Cargo): Promise<void>;
  update(cargo: Cargo): Promise<void>;
  delete(id: string): Promise<void>;
  findById(id: string): Promise<Cargo | null>;
  findAll(): Promise<Cargo[]>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: Cargo[]; total: number }>;
  findByAtletica(atleticaId: string): Promise<Cargo[]>;
}
