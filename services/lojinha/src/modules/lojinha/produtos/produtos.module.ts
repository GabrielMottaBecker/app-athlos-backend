import { ProdutoMessagingService } from "@lojinha/produtos/application/services/produto-messaging.service";
import { ProdutoService } from "@lojinha/produtos/application/services/produto.service";
import { PRODUTO_REPOSITORY } from "@lojinha/produtos/domain/repositories/produto-repository.interface";
import { ProdutosController } from "@lojinha/produtos/infra/controllers/produtos.controller";
import { DrizzleProdutoRepository } from "@lojinha/produtos/infra/repositories/drizzle-produto.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [ProdutosController],
  providers: [
    ProdutoService,
    ProdutoMessagingService,
    DrizzleProdutoRepository,
    { provide: PRODUTO_REPOSITORY, useExisting: DrizzleProdutoRepository },
  ],
  exports: [ProdutoService],
})
export class ProdutosModule {}
