import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { SharedModule } from "@shared/shared.module";
import { FinanceiroModule } from "@financeiro/financeiro.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    SharedModule,
    FinanceiroModule,
  ],
})
export class AppModule {}
