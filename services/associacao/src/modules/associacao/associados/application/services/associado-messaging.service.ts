import { AssociadoDto } from "@associacao/associados/application/dto/associado.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  AssociacaoExchangeName,
  AssociacaoRoutingKey,
} from "@shared/contracts/events/associacao-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class AssociadoMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AssociadoMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(
          AssociacaoExchangeName.ASSOCIADO_CREATED,
        ),
        this.sharedMessagingService.assertExchange(
          AssociacaoExchangeName.ASSOCIADO_UPDATED,
        ),
        this.sharedMessagingService.assertExchange(
          AssociacaoExchangeName.ASSOCIADO_DELETED,
        ),
        this.sharedMessagingService.assertExchange(
          AssociacaoExchangeName.ASSOCIADO_STATUS_CHANGED,
        ),
      ]);
    } catch (error) {
      this.logger.error("Falha ao criar exchanges de associado", error);
      throw error;
    }
  }

  async publishAssociadoCreated(associado: AssociadoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AssociacaoExchangeName.ASSOCIADO_CREATED,
      AssociacaoRoutingKey.ASSOCIADO_CREATED,
      associado,
    );
  }

  async publishAssociadoUpdated(associado: AssociadoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AssociacaoExchangeName.ASSOCIADO_UPDATED,
      AssociacaoRoutingKey.ASSOCIADO_UPDATED,
      associado,
    );
  }

  async publishAssociadoDeleted(associado: AssociadoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AssociacaoExchangeName.ASSOCIADO_DELETED,
      AssociacaoRoutingKey.ASSOCIADO_DELETED,
      associado,
    );
  }

  async publishStatusChanged(associado: AssociadoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      AssociacaoExchangeName.ASSOCIADO_STATUS_CHANGED,
      AssociacaoRoutingKey.ASSOCIADO_STATUS_CHANGED,
      associado,
    );
  }
}
