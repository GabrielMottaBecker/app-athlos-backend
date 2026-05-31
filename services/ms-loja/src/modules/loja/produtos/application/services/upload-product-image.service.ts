import { Injectable, NotFoundException } from "@nestjs/common";
import { ProductRepository } from "@loja/produtos/domain/repositories/product.repository";
import { LocalStorageService } from "@loja/produtos/infra/storage/local-storage.service";
import { Product } from "@loja/produtos/domain/models/product.model";

@Injectable()
export class UploadProductImageService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly localStorageService: LocalStorageService,
  ) {}

  async execute(id: string, file: Express.Multer.File): Promise<Product> {
    const existing = await this.productRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Produto com id ${id} não encontrado`);
    }

    const imageUrl = await this.localStorageService.save(
      file.buffer,
      file.mimetype,
    );

    const updated = new Product(
      existing.id,
      existing.name,
      existing.price,
      existing.category,
      imageUrl,
    );

    await this.productRepository.update(updated);

    return updated;
  }
}