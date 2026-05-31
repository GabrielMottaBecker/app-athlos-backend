import { Module } from "@nestjs/common";
import { CategoriasModule } from "./categorias/categorias.module";
import { TransacoesModule } from "./transacoes/transacoes.module";

@Module({
  imports: [CategoriasModule, TransacoesModule],
})
export class FinanceiroModule {}
