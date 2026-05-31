import { Module } from "@nestjs/common";
import { ProdutosModule } from "./produtos/produtos.module";
import { CarrinhoModule } from "./carrinho/carrinho.module";

@Module({
  imports: [ProdutosModule, CarrinhoModule],
})
export class LojinhaModule {}
