import { ProdutoDto } from "@lojinha/produtos/application/dto/produto.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  LojinhaExchangeName,
  LojinhaRoutingKey,
} from "@shared/contracts/events/lojinha-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class ProdutoMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(ProdutoMessagingService.name);

  constructor(private readonly sharedMessagingService: SharedMessagingService) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(LojinhaExchangeName.PRODUTO_CREATED),
        this.sharedMessagingService.assertExchange(LojinhaExchangeName.PRODUTO_UPDATED),
        this.sharedMessagingService.assertExchange(LojinhaExchangeName.PRODUTO_DELETED),
      ]);
    } catch (error) {
      this.logger.error("Falha ao criar exchanges de produto", error);
      throw error;
    }
  }

  async publishProdutoCreated(produto: ProdutoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      LojinhaExchangeName.PRODUTO_CREATED,
      LojinhaRoutingKey.PRODUTO_CREATED,
      produto,
    );
  }

  async publishProdutoUpdated(produto: ProdutoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      LojinhaExchangeName.PRODUTO_UPDATED,
      LojinhaRoutingKey.PRODUTO_UPDATED,
      produto,
    );
  }

  async publishProdutoDeleted(produto: ProdutoDto): Promise<void> {
    await this.sharedMessagingService.publish(
      LojinhaExchangeName.PRODUTO_DELETED,
      LojinhaRoutingKey.PRODUTO_DELETED,
      produto,
    );
  }
}
