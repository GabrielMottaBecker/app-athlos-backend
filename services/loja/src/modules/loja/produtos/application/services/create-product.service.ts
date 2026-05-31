import { Injectable } from "@nestjs/common";
import { ProductRepository } from "@loja/produtos/domain/repositories/product.repository";
import { CreateProductDto } from "@loja/produtos/application/dto/create-product.dto";
import { Product } from "@loja/produtos/domain/models/product.model";
import { randomUUID } from "crypto";

@Injectable()
export class CreateProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(dto: CreateProductDto): Promise<Product> {
    const product = new Product(
      randomUUID(),
      dto.name,
      dto.price,
      dto.category,
      dto.imageUrl ?? null,
    );

    await this.productRepository.create(product);

    return product;
  }
}