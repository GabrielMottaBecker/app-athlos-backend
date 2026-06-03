import { Transacao } from "@financeiro/transacoes/domain/models/transacao.entity";
import { TipoTransacao } from "@financeiro/transacoes/domain/models/tipo-transacao.enum";
import type { TransacaoRepository } from "@financeiro/transacoes/domain/repositories/transacao-repository.interface";
import { transacoesSchema } from "@financeiro/transacoes/infra/database/schemas/transacao.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { and, eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleTransacaoRepository implements TransacaoRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(transacao: Transacao): Promise<void> {
    await this.drizzleService.db.insert(transacoesSchema).values({
      descricao: transacao.descricao,
      valor: String(transacao.valor),
      tipo: transacao.tipo,
      categoriaId: transacao.categoriaId,
      atleticaId: transacao.atleticaId,
      dataTransacao: transacao.dataTransacao,
      observacao: transacao.observacao ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(transacao: Transacao): Promise<void> {
    await this.drizzleService.db
      .update(transacoesSchema)
      .set({
        descricao: transacao.descricao,
        valor: String(transacao.valor),
        observacao: transacao.observacao ?? null,
        updatedAt: new Date(),
      })
      .where(eq(transacoesSchema.id, transacao.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db.delete(transacoesSchema).where(eq(transacoesSchema.id, id));
  }

  async findById(id: string): Promise<Transacao | null> {
    const result = await this.drizzleService.db
      .select()
      .from(transacoesSchema)
      .where(eq(transacoesSchema.id, id))
      .limit(1);
    return this.toEntity(result[0]);
  }

  async findByAtletica(atleticaId: string): Promise<Transacao[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(transacoesSchema)
      .where(eq(transacoesSchema.atleticaId, atleticaId));
    return rows.map((r) => this.toEntity(r)!);
  }

  async findByCategoria(categoriaId: string): Promise<Transacao[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(transacoesSchema)
      .where(eq(transacoesSchema.categoriaId, categoriaId));
    return rows.map((r) => this.toEntity(r)!);
  }

  async findByTipo(atleticaId: string, tipo: TipoTransacao): Promise<Transacao[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(transacoesSchema)
      .where(and(eq(transacoesSchema.atleticaId, atleticaId), eq(transacoesSchema.tipo, tipo)));
    return rows.map((r) => this.toEntity(r)!);
  }

  async findAllPaginated(params: PaginationParams): Promise<{ rows: Transacao[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db.select().from(transacoesSchema).limit(limit).offset(offset),
      this.drizzleService.db.select({ count: sql<number>`count(*)::int` }).from(transacoesSchema),
    ]);
    return { rows: rows.map((r) => this.toEntity(r)!), total: countResult.count };
  }

  private toEntity(row: typeof transacoesSchema.$inferSelect | undefined): Transacao | null {
    if (!row) return null;
    return Transacao.restore({
      id: row.id,
      descricao: row.descricao,
      valor: Number(row.valor),
      tipo: row.tipo as TipoTransacao,
      categoriaId: row.categoriaId,
      atleticaId: row.atleticaId,
      dataTransacao: row.dataTransacao,
      observacao: row.observacao ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
