import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductRepository } from "@loja/produtos/domain/repositories/product.repository";

@Injectable()
export class DeleteProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.productRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    }

    await this.productRepository.delete(id);
  }
}