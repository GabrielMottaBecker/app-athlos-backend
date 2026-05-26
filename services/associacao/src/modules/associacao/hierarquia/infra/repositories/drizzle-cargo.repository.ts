import { Cargo } from "@hierarquia/domain/models/cargo.entity";
import { TipoCargo } from "@hierarquia/domain/models/tipo-cargo.enum";
import type { CargoRepository } from "@hierarquia/domain/repositories/cargo-repository.interface";
import { cargosSchema } from "@hierarquia/infra/database/schemas/cargo.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleCargoRepository implements CargoRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(cargo: Cargo): Promise<void> {
    await this.drizzleService.db.insert(cargosSchema).values({
      nome: cargo.nome,
      tipo: cargo.tipo,
      atleticaId: cargo.atleticaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(cargo: Cargo): Promise<void> {
    await this.drizzleService.db
      .update(cargosSchema)
      .set({
        nome: cargo.nome,
        tipo: cargo.tipo,
        updatedAt: new Date(),
      })
      .where(eq(cargosSchema.id, cargo.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(cargosSchema)
      .where(eq(cargosSchema.id, id));
  }

  async findById(id: string): Promise<Cargo | null> {
    const result = await this.drizzleService.db
      .select()
      .from(cargosSchema)
      .where(eq(cargosSchema.id, id))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findAll(): Promise<Cargo[]> {
    const rows = await this.drizzleService.db.select().from(cargosSchema);
    return rows.map((row) => this.toEntity(row)!);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Cargo[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(cargosSchema)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(cargosSchema),
    ]);

    return {
      rows: rows.map((row) => this.toEntity(row)!),
      total: countResult.count,
    };
  }

  async findByAtletica(atleticaId: string): Promise<Cargo[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(cargosSchema)
      .where(eq(cargosSchema.atleticaId, atleticaId));

    return rows.map((row) => this.toEntity(row)!);
  }

  private toEntity(row: typeof cargosSchema.$inferSelect | undefined): Cargo | null {
    if (!row) return null;
    return Cargo.restore({
      id: row.id,
      nome: row.nome,
      tipo: row.tipo as TipoCargo,
      atleticaId: row.atleticaId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
