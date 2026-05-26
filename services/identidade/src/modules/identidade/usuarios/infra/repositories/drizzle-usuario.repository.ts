import { Usuario } from "@identidade/usuarios/domain/models/usuario.entity";
import { UsuarioRole } from "@identidade/usuarios/domain/models/usuario-role.enum";
import { UsuarioStatus } from "@identidade/usuarios/domain/models/usuario-status.enum";
import type { UsuarioRepository } from "@identidade/usuarios/domain/repositories/usuario-repository.interface";
import { usuariosSchema } from "@identidade/usuarios/infra/database/schemas/usuario.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleUsuarioRepository implements UsuarioRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(usuario: Usuario): Promise<void> {
    await this.drizzleService.db.insert(usuariosSchema).values({
      nome: usuario.nome,
      email: usuario.email,
      senhaHash: usuario.senhaHash,
      role: usuario.role,
      status: usuario.status,
      atleticaId: usuario.atleticaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(usuario: Usuario): Promise<void> {
    await this.drizzleService.db
      .update(usuariosSchema)
      .set({
        nome: usuario.nome,
        email: usuario.email,
        senhaHash: usuario.senhaHash,
        role: usuario.role,
        updatedAt: new Date(),
      })
      .where(eq(usuariosSchema.id, usuario.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(usuariosSchema)
      .where(eq(usuariosSchema.id, id));
  }

  async updateStatus(id: string, status: UsuarioStatus): Promise<void> {
    await this.drizzleService.db
      .update(usuariosSchema)
      .set({ status, updatedAt: new Date() })
      .where(eq(usuariosSchema.id, id));
  }

  async findById(id: string): Promise<Usuario | null> {
    const result = await this.drizzleService.db
      .select()
      .from(usuariosSchema)
      .where(eq(usuariosSchema.id, id))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    const result = await this.drizzleService.db
      .select()
      .from(usuariosSchema)
      .where(eq(usuariosSchema.email, email.toLowerCase()))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findAll(): Promise<Usuario[]> {
    const rows = await this.drizzleService.db.select().from(usuariosSchema);
    return rows.map((row) => this.toEntity(row)!);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Usuario[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(usuariosSchema)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(usuariosSchema),
    ]);

    return {
      rows: rows.map((row) => this.toEntity(row)!),
      total: countResult.count,
    };
  }

  async findByAtletica(atleticaId: string): Promise<Usuario[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(usuariosSchema)
      .where(eq(usuariosSchema.atleticaId, atleticaId));

    return rows.map((row) => this.toEntity(row)!);
  }

  private toEntity(row: typeof usuariosSchema.$inferSelect | undefined): Usuario | null {
    if (!row) return null;
    return Usuario.restore({
      id: row.id,
      nome: row.nome,
      email: row.email,
      senhaHash: row.senhaHash,
      role: row.role as UsuarioRole,
      status: row.status as UsuarioStatus,
      atleticaId: row.atleticaId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
