import { Injectable } from "@nestjs/common";
import { ProductRepository } from "@loja/produtos/domain/repositories/product.repository";
import { Product } from "@loja/produtos/domain/models/product.model";

@Injectable()
export class ListProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(category?: string): Promise<Product[]> {
    return this.productRepository.findAll(category);
  }
}