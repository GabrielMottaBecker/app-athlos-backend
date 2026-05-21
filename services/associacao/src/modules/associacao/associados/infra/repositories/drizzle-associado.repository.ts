import { Associado, StatusAssociado } from "@associacao/associados/domain/models/associado.entity";
import type { AssociadoRepository } from "@associacao/associados/domain/repositories/associado-repository.interface";
import { associadosSchema } from "@associacao/associados/infra/database/schemas/associado.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleAssociadoRepository implements AssociadoRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(associado: Associado): Promise<void> {
    await this.drizzleService.db.insert(associadosSchema).values({
      nome: associado.nome,
      email: associado.email.toLowerCase(),
      documento: associado.documento,
      telefone: associado.telefone,
      status: associado.status,
      atleticaId: associado.atleticaId,
      taxaAthlos: String(associado.taxaAthlos),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(associado: Associado): Promise<void> {
    await this.drizzleService.db
      .update(associadosSchema)
      .set({
        nome: associado.nome,
        email: associado.email.toLowerCase(),
        documento: associado.documento,
        telefone: associado.telefone,
        updatedAt: new Date(),
      })
      .where(eq(associadosSchema.id, associado.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(associadosSchema)
      .where(eq(associadosSchema.id, id));
  }

  async updateStatus(id: string, status: StatusAssociado): Promise<void> {
    await this.drizzleService.db
      .update(associadosSchema)
      .set({ status, updatedAt: new Date() })
      .where(eq(associadosSchema.id, id));
  }

  async findById(id: string): Promise<Associado | null> {
    const result = await this.drizzleService.db
      .select()
      .from(associadosSchema)
      .where(eq(associadosSchema.id, id))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findByEmail(email: string): Promise<Associado | null> {
    const result = await this.drizzleService.db
      .select()
      .from(associadosSchema)
      .where(eq(associadosSchema.email, email.toLowerCase()))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findByDocumento(documento: string): Promise<Associado | null> {
    const result = await this.drizzleService.db
      .select()
      .from(associadosSchema)
      .where(eq(associadosSchema.documento, documento))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findAll(): Promise<Associado[]> {
    const rows = await this.drizzleService.db.select().from(associadosSchema);
    return rows.map((row) => this.toEntity(row)!);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Associado[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(associadosSchema)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(associadosSchema),
    ]);

    return {
      rows: rows.map((row) => this.toEntity(row)!),
      total: countResult.count,
    };
  }

  async findByAtletica(atleticaId: string): Promise<Associado[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(associadosSchema)
      .where(eq(associadosSchema.atleticaId, atleticaId));

    return rows.map((row) => this.toEntity(row)!);
  }

  private toEntity(row: typeof associadosSchema.$inferSelect | undefined): Associado | null {
    if (!row) return null;
    return Associado.restore({
      id: row.id,
      nome: row.nome,
      email: row.email,
      documento: row.documento,
      telefone: row.telefone,
      status: row.status as StatusAssociado,
      atleticaId: row.atleticaId,
      taxaAthlos: Number(row.taxaAthlos),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
