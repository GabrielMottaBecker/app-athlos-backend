import { Module } from "@nestjs/common";
import { AssociadosModule } from "./associados/associados.module";

@Module({
  imports: [AssociadosModule],
})
export class AssociacaoModule {}
