import type { Associado, StatusAssociado } from "../models/associado.entity";
import type { PaginationParams } from "@shared/infra/hateoas";

export const ASSOCIADO_REPOSITORY = Symbol("ASSOCIADO_REPOSITORY");

export interface AssociadoRepository {
  create(associado: Associado): Promise<void>;
  update(associado: Associado): Promise<void>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: StatusAssociado): Promise<void>;
  assignCargo(id: string, cargoId: string | null): Promise<void>;
  findById(id: string): Promise<Associado | null>;
  findByEmail(email: string): Promise<Associado | null>;
  findByDocumento(documento: string): Promise<Associado | null>;
  findAll(): Promise<Associado[]>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: Associado[]; total: number }>;
  findByAtletica(atleticaId: string): Promise<Associado[]>;
}
