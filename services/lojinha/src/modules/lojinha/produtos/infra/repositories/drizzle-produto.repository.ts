import { Produto } from "@lojinha/produtos/domain/models/produto.entity";
import { StatusProduto } from "@lojinha/produtos/domain/models/status-produto.enum";
import type { ProdutoRepository } from "@lojinha/produtos/domain/repositories/produto-repository.interface";
import { produtosSchema } from "@lojinha/produtos/infra/database/schemas/produto.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleProdutoRepository implements ProdutoRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(produto: Produto): Promise<void> {
    await this.drizzleService.db.insert(produtosSchema).values({
      nome: produto.nome,
      descricao: produto.descricao,
      preco: String(produto.preco),
      estoque: produto.estoque,
      status: produto.status,
      atleticaId: produto.atleticaId,
      imagemUrl: produto.imagemUrl ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(produto: Produto): Promise<void> {
    await this.drizzleService.db
      .update(produtosSchema)
      .set({
        nome: produto.nome,
        descricao: produto.descricao,
        preco: String(produto.preco),
        estoque: produto.estoque,
        imagemUrl: produto.imagemUrl ?? null,
        updatedAt: new Date(),
      })
      .where(eq(produtosSchema.id, produto.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db.delete(produtosSchema).where(eq(produtosSchema.id, id));
  }

  async updateStatus(id: string, status: StatusProduto): Promise<void> {
    await this.drizzleService.db
      .update(produtosSchema)
      .set({ status, updatedAt: new Date() })
      .where(eq(produtosSchema.id, id));
  }

  async findById(id: string): Promise<Produto | null> {
    const result = await this.drizzleService.db
      .select()
      .from(produtosSchema)
      .where(eq(produtosSchema.id, id))
      .limit(1);
    return this.toEntity(result[0]);
  }

  async findByAtletica(atleticaId: string): Promise<Produto[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(produtosSchema)
      .where(eq(produtosSchema.atleticaId, atleticaId));
    return rows.map((r) => this.toEntity(r)!);
  }

  async findAllPaginated(params: PaginationParams): Promise<{ rows: Produto[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db.select().from(produtosSchema).limit(limit).offset(offset),
      this.drizzleService.db.select({ count: sql<number>`count(*)::int` }).from(produtosSchema),
    ]);
    return { rows: rows.map((r) => this.toEntity(r)!), total: countResult.count };
  }

  private toEntity(row: typeof produtosSchema.$inferSelect | undefined): Produto | null {
    if (!row) return null;
    return Produto.restore({
      id: row.id,
      nome: row.nome,
      descricao: row.descricao,
      preco: Number(row.preco),
      estoque: row.estoque,
      status: row.status as StatusProduto,
      atleticaId: row.atleticaId,
      imagemUrl: row.imagemUrl ?? null,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
