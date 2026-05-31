import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";
import { ProductController } from "@loja/produtos/infra/controllers/product.controller";
import { ProductRepository } from "@loja/produtos/domain/repositories/product.repository";
import { DrizzleProductRepository } from "@loja/produtos/infra/repositories/drizzle-product.repository";
import { CreateProductService } from "@loja/produtos/application/services/create-product.service";
import { ListProductsService } from "@loja/produtos/application/services/list-products.service";
import { UpdateProductService } from "@loja/produtos/application/services/update-product.service";
import { DeleteProductService } from "@loja/produtos/application/services/delete-product.service";
import { UploadProductImageService } from "@loja/produtos/application/services/upload-product-image.service";
import { LocalStorageService } from "@loja/produtos/infra/storage/local-storage.service";

@Module({
  imports: [SharedModule],
  controllers: [ProductController],
  providers: [
    CreateProductService,
    ListProductsService,
    UpdateProductService,
    DeleteProductService,
    UploadProductImageService,
    LocalStorageService,
    {
      provide: ProductRepository,
      useClass: DrizzleProductRepository,
    },
  ],
})
export class ProdutosModule {}