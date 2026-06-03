import { CategoriaService } from "@financeiro/categorias/application/services/categoria.service";
import { CATEGORIA_REPOSITORY } from "@financeiro/categorias/domain/repositories/categoria-repository.interface";
import { CategoriasController } from "@financeiro/categorias/infra/controllers/categorias.controller";
import { DrizzleCategoriaRepository } from "@financeiro/categorias/infra/repositories/drizzle-categoria.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [CategoriasController],
  providers: [
    CategoriaService,
    DrizzleCategoriaRepository,
    { provide: CATEGORIA_REPOSITORY, useExisting: DrizzleCategoriaRepository },
  ],
  exports: [CategoriaService],
})
export class CategoriasModule {}
