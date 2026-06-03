import { CreateNotificacaoDto } from "@notificacoes/notificacoes/application/dto/create-notificacao.dto";
import { NotificacaoService } from "@notificacoes/notificacoes/application/services/notificacao.service";
import { NotificacaoTipo } from "@notificacoes/notificacoes/domain/models/notificacao-tipo.enum";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  FeedExchangeName,
  FeedRoutingKey,
} from "@shared/contracts/events/feed-events.enum";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import type { ConsumeMessage } from "amqplib";

const QUEUE_NAME = "notificacoes.feed.eventos.created";

type EventoCreatedPayload = {
  id: string;
  title: string;
  type: string;
  atleticaId: string;
};

@Injectable()
export class FeedEventoCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(FeedEventoCreatedConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const channel = this.rabbitMQService.getChannel();
      await channel.assertExchange(FeedExchangeName.EVENTO_CREATED, "direct", { durable: true });
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      await channel.bindQueue(
        QUEUE_NAME,
        FeedExchangeName.EVENTO_CREATED,
        FeedRoutingKey.EVENTO_CREATED,
      );

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;
        await this.handleMessage(msg);
      });

      this.logger.log(`Listening for feed events on queue "${QUEUE_NAME}"`);
    } catch {
      this.logger.warn(
        "RabbitMQ unavailable; feed event notification consumer disabled.",
      );
    }
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.rabbitMQService.getChannel();
    try {
      const payload = JSON.parse(msg.content.toString()) as EventoCreatedPayload;
      if (!payload.id || !payload.title || !payload.atleticaId) {
        channel.nack(msg, false, false);
        return;
      }

      const dto: CreateNotificacaoDto = {
        atleticaId: payload.atleticaId,
        tipo: NotificacaoTipo.EVENTO_PUBLICADO,
        titulo: "Novo evento publicado",
        mensagem: `${payload.title} foi publicado na agenda.`,
        metadata: {
          eventoId: payload.id,
          type: payload.type,
        },
      };

      await this.notificacaoService.create(dto);
      channel.ack(msg);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Falha ao processar evento publicado: ${message}`);
      channel.nack(msg, false, false);
    }
  }
}
