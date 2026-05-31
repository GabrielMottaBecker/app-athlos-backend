import { Module } from "@nestjs/common";
import { ProdutosModule } from "@loja/produtos/produtos.module";

@Module({
  imports: [ProdutosModule],
})
export class LojaModule {}