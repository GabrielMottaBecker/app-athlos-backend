import { TransacaoDto } from "@financeiro/transacoes/application/dto/transacao.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  FinanceiroExchangeName,
  FinanceiroRoutingKey,
} from "@shared/contracts/events/financeiro-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class TransacaoMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(TransacaoMessagingService.name);

  constructor(private readonly sharedMessagingService: SharedMessagingService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(FinanceiroExchangeName.TRANSACAO_CREATED),
        this.sharedMessagingService.assertExchange(FinanceiroExchangeName.TRANSACAO_UPDATED),
        this.sharedMessagingService.assertExchange(FinanceiroExchangeName.TRANSACAO_DELETED),
      ]);
    } catch (error) {
      this.logger.error("Falha ao criar exchanges de transação", error);
      throw error;
    }
  }

  async publishTransacaoCreated(transacao: TransacaoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      FinanceiroExchangeName.TRANSACAO_CREATED,
      FinanceiroRoutingKey.TRANSACAO_CREATED,
      transacao,
    );
  }

  async publishTransacaoUpdated(transacao: TransacaoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      FinanceiroExchangeName.TRANSACAO_UPDATED,
      FinanceiroRoutingKey.TRANSACAO_UPDATED,
      transacao,
    );
  }

  async publishTransacaoDeleted(transacao: TransacaoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      FinanceiroExchangeName.TRANSACAO_DELETED,
      FinanceiroRoutingKey.TRANSACAO_DELETED,
      transacao,
    );
  }
}
