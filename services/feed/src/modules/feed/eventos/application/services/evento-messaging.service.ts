import { EventoDto } from "@feed/eventos/application/dto/evento.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  FeedExchangeName,
  FeedRoutingKey,
} from "@shared/contracts/events/feed-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class EventoMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(EventoMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(FeedExchangeName.EVENTO_CREATED),
        this.sharedMessagingService.assertExchange(FeedExchangeName.EVENTO_UPDATED),
        this.sharedMessagingService.assertExchange(FeedExchangeName.EVENTO_DELETED),
      ]);
    } catch (error) {
      this.logger.error("Falha ao criar exchanges de evento", error);
      throw error;
    }
  }

  async publishEventoCreated(evento: EventoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      FeedExchangeName.EVENTO_CREATED,
      FeedRoutingKey.EVENTO_CREATED,
      evento,
    );
  }

  async publishEventoUpdated(evento: EventoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      FeedExchangeName.EVENTO_UPDATED,
      FeedRoutingKey.EVENTO_UPDATED,
      evento,
    );
  }

  async publishEventoDeleted(evento: EventoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      FeedExchangeName.EVENTO_DELETED,
      FeedRoutingKey.EVENTO_DELETED,
      evento,
    );
  }
}
