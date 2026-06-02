import { CarrinhoService } from "@lojinha/carrinho/application/services/carrinho.service";
import { CarrinhoController } from "@lojinha/carrinho/infra/controllers/carrinho.controller";
import { ProdutosModule } from "@lojinha/produtos/produtos.module";
import { Module } from "@nestjs/common";

@Module({
  imports: [ProdutosModule],
  controllers: [CarrinhoController],
  providers: [CarrinhoService],
})
export class CarrinhoModule {}
