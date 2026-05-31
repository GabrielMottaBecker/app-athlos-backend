import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";
import { Product } from "@loja/produtos/domain/models/product.model";
import { ProductRepository } from "@loja/produtos/domain/repositories/product.repository";
import { productsSchema } from "@loja/produtos/infra/database/schemas/product.schema";

@Injectable()
export class DrizzleProductRepository implements ProductRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findAll(category?: string): Promise<Product[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(productsSchema)
      .where(category ? eq(productsSchema.category, category) : undefined);

    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<Product | null> {
    const result = await this.drizzleService.db
      .select()
      .from(productsSchema)
      .where(eq(productsSchema.id, id))
      .limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async create(product: Product): Promise<void> {
    await this.drizzleService.db.insert(productsSchema).values({
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(product: Product): Promise<void> {
    await this.drizzleService.db
      .update(productsSchema)
      .set({
        name: product.name,
        price: product.price,
        category: product.category,
        imageUrl: product.imageUrl,
        updatedAt: new Date(),
      })
      .where(eq(productsSchema.id, product.id));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(productsSchema)
      .where(eq(productsSchema.id, id));
  }

  private toEntity(row: typeof productsSchema.$inferSelect): Product {
    return new Product(
      row.id,
      row.name,
      row.price,
      row.category,
      row.imageUrl ?? null,
    );
  }
}