import { CreateNotificacaoDto } from "@notificacoes/notificacoes/application/dto/create-notificacao.dto";
import { NotificacaoService } from "@notificacoes/notificacoes/application/services/notificacao.service";
import { NotificacaoTipo } from "@notificacoes/notificacoes/domain/models/notificacao-tipo.enum";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  AssociacaoExchangeName,
  AssociacaoRoutingKey,
} from "@shared/contracts/events/associacao-events.enum";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import type { ConsumeMessage } from "amqplib";

const QUEUE_NAME = "notificacoes.associados.status-changed";

type AssociadoStatusChangedPayload = {
  id: string;
  status: string;
  atleticaId: string;
};

@Injectable()
export class AssociadoStatusChangedConsumer implements OnModuleInit {
  private readonly logger = new Logger(AssociadoStatusChangedConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly notificacaoService: NotificacaoService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const channel = this.rabbitMQService.getChannel();
      await channel.assertExchange(AssociacaoExchangeName.ASSOCIADO_STATUS_CHANGED, "direct", { durable: true });
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      await channel.bindQueue(
        QUEUE_NAME,
        AssociacaoExchangeName.ASSOCIADO_STATUS_CHANGED,
        AssociacaoRoutingKey.ASSOCIADO_STATUS_CHANGED,
      );

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;
        await this.handleMessage(msg);
      });

      this.logger.log(`Listening for associado status on queue "${QUEUE_NAME}"`);
    } catch {
      this.logger.warn(
        "RabbitMQ unavailable; associado status notification consumer disabled.",
      );
    }
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.rabbitMQService.getChannel();
    try {
      const payload = JSON.parse(msg.content.toString()) as AssociadoStatusChangedPayload;
      if (!payload.id || !payload.status || !payload.atleticaId) {
        channel.nack(msg, false, false);
        return;
      }

      const dto: CreateNotificacaoDto = {
        usuarioId: payload.id,
        atleticaId: payload.atleticaId,
        tipo: NotificacaoTipo.ASSOCIACAO_ATUALIZADA,
        titulo: "Associacao atualizada",
        mensagem: `Seu status de associacao foi alterado para ${payload.status}.`,
        metadata: {
          associadoId: payload.id,
          status: payload.status,
        },
      };

      await this.notificacaoService.create(dto);
      channel.ack(msg);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Falha ao processar status de associado: ${message}`);
      channel.nack(msg, false, false);
    }
  }
}
