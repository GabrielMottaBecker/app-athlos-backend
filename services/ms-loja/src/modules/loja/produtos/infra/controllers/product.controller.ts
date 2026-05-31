import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UploadedFile, UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { CreateProductService } from "@loja/produtos/application/services/create-product.service";
import { ListProductsService } from "@loja/produtos/application/services/list-products.service";
import { UpdateProductService } from "@loja/produtos/application/services/update-product.service";
import { DeleteProductService } from "@loja/produtos/application/services/delete-product.service";
import { UploadProductImageService } from "@loja/produtos/application/services/upload-product-image.service";
import { CreateProductDto } from "@loja/produtos/application/dto/create-product.dto";
import { UpdateProductDto } from "@loja/produtos/application/dto/update-product.dto";
import { Public } from "@shared/infra/decorators/public.decorator";

@Public()
@Controller('produtos')
export class ProductController {
  constructor(
    private readonly createProductService: CreateProductService,
    private readonly listProductsService: ListProductsService,
    private readonly updateProductService: UpdateProductService,
    private readonly deleteProductService: DeleteProductService,
    private readonly uploadProductImageService: UploadProductImageService,
  ) {}

  @Get()
  async findAll(@Query('category') category?: string) {
    return this.listProductsService.execute(category);
  }

  @Post()
  async create(@Body() dto: CreateProductDto) {
    return this.createProductService.execute(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateProductDto) {
    return this.updateProductService.execute(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.deleteProductService.execute(id);
  }

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file', { storage: undefined }))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadProductImageService.execute(id, file);
  }
}