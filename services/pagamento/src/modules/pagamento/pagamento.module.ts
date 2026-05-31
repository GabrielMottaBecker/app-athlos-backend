import { Module } from "@nestjs/common";
import { PagamentosModule } from "@pagamento/pagamentos/pagamentos.module";

@Module({
  imports: [PagamentosModule],
})
export class PagamentoModule {}