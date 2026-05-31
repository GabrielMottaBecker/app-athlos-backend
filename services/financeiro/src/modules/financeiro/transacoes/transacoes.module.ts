import { TransacaoMessagingService } from "@financeiro/transacoes/application/services/transacao-messaging.service";
import { TransacaoService } from "@financeiro/transacoes/application/services/transacao.service";
import { TRANSACAO_REPOSITORY } from "@financeiro/transacoes/domain/repositories/transacao-repository.interface";
import { TransacoesController } from "@financeiro/transacoes/infra/controllers/transacoes.controller";
import { DrizzleTransacaoRepository } from "@financeiro/transacoes/infra/repositories/drizzle-transacao.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [TransacoesController],
  providers: [
    TransacaoService,
    TransacaoMessagingService,
    DrizzleTransacaoRepository,
    { provide: TRANSACAO_REPOSITORY, useExisting: DrizzleTransacaoRepository },
  ],
})
export class TransacoesModule {}
