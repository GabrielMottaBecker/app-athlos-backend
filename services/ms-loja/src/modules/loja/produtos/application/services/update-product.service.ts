import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductRepository } from "@loja/produtos/domain/repositories/product.repository";
import { UpdateProductDto } from "@loja/produtos/application/dto/update-product.dto";
import { Product } from "@loja/produtos/domain/models/product.model";

@Injectable()
export class UpdateProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.productRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    }

    const updated = new Product(
      existing.id,
      dto.name ?? existing.name,
      dto.price ?? existing.price,
      dto.category ?? existing.category,
      dto.imageUrl ?? existing.imageUrl,
    );

    await this.productRepository.update(updated);

    return updated;
  }
}