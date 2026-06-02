import type { Usuario } from "@identidade/usuarios/domain/models/usuario.entity";
import type { UsuarioStatus } from "@identidade/usuarios/domain/models/usuario-status.enum";
import type { PaginationParams } from "@shared/infra/hateoas";

export const USUARIO_REPOSITORY = Symbol("USUARIO_REPOSITORY");

export interface UsuarioRepository {
  create(usuario: Usuario): Promise<void>;
  update(usuario: Usuario): Promise<void>;
  delete(id: string): Promise<void>;
  updateStatus(id: string, status: UsuarioStatus): Promise<void>;
  findById(id: string): Promise<Usuario | null>;
  findByEmail(email: string): Promise<Usuario | null>;
  findAll(): Promise<Usuario[]>;
  findAllPaginated(params: PaginationParams): Promise<{ rows: Usuario[]; total: number }>;
  findByAtletica(atleticaId: string): Promise<Usuario[]>;
}
