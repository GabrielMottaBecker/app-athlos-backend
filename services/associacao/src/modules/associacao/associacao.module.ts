import { Module } from "@nestjs/common";
import { AssociadosModule } from "./associados/associados.module";
import { HierarquiaModule } from "./hierarquia/hierarquia.module";

@Module({
  imports: [AssociadosModule, HierarquiaModule],
})
export class AssociacaoModule {}
