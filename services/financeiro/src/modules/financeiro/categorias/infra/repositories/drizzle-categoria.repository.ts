import { Categoria } from "@financeiro/categorias/domain/models/categoria.entity";
import { TipoCategoria } from "@financeiro/categorias/domain/models/tipo-categoria.enum";
import type { CategoriaRepository } from "@financeiro/categorias/domain/repositories/categoria-repository.interface";
import { categoriasSchema } from "@financeiro/categorias/infra/database/schemas/categoria.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleCategoriaRepository implements CategoriaRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(categoria: Categoria): Promise<void> {
    await this.drizzleService.db.insert(categoriasSchema).values({
      nome: categoria.nome,
      tipo: categoria.tipo,
      atleticaId: categoria.atleticaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(categoria: Categoria): Promise<void> {
    await this.drizzleService.db
      .update(categoriasSchema)
      .set({ nome: categoria.nome, tipo: categoria.tipo, updatedAt: new Date() })
      .where(eq(categoriasSchema.id, categoria.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db.delete(categoriasSchema).where(eq(categoriasSchema.id, id));
  }

  async findById(id: string): Promise<Categoria | null> {
    const result = await this.drizzleService.db
      .select()
      .from(categoriasSchema)
      .where(eq(categoriasSchema.id, id))
      .limit(1);
    return this.toEntity(result[0]);
  }

  async findByAtletica(atleticaId: string): Promise<Categoria[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(categoriasSchema)
      .where(eq(categoriasSchema.atleticaId, atleticaId));
    return rows.map((r) => this.toEntity(r)!);
  }

  async findAllPaginated(params: PaginationParams): Promise<{ rows: Categoria[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db.select().from(categoriasSchema).limit(limit).offset(offset),
      this.drizzleService.db.select({ count: sql<number>`count(*)::int` }).from(categoriasSchema),
    ]);
    return { rows: rows.map((r) => this.toEntity(r)!), total: countResult.count };
  }

  private toEntity(row: typeof categoriasSchema.$inferSelect | undefined): Categoria | null {
    if (!row) return null;
    return Categoria.restore({
      id: row.id,
      nome: row.nome,
      tipo: row.tipo as TipoCategoria,
      atleticaId: row.atleticaId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
