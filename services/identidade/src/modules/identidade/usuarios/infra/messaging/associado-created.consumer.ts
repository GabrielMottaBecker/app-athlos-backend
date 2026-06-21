import { UsuarioService } from "@identidade/usuarios/application/services/usuario.service";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import {
  AssociacaoExchangeName,
  AssociacaoRoutingKey,
} from "@shared/contracts/events/associacao-events.enum";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import type { ConsumeMessage } from "amqplib";

const QUEUE_NAME = "identidade.associados.created";

type AssociadoCreatedPayload = {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  atleticaId: string;
};

@Injectable()
export class AssociadoCreatedConsumer implements OnModuleInit {
  private readonly logger = new Logger(AssociadoCreatedConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly usuarioService: UsuarioService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const channel = this.rabbitMQService.getChannel();
      await channel.assertExchange(AssociacaoExchangeName.ASSOCIADO_CREATED, "direct", { durable: true });
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      await channel.bindQueue(
        QUEUE_NAME,
        AssociacaoExchangeName.ASSOCIADO_CREATED,
        AssociacaoRoutingKey.ASSOCIADO_CREATED,
      );

      channel.consume(QUEUE_NAME, async (msg) => {
        if (!msg) return;
        await this.handleMessage(msg);
      });

      this.logger.log(`Listening for associado created on queue "${QUEUE_NAME}"`);
    } catch {
      this.logger.warn(
        "RabbitMQ unavailable; associado created consumer disabled.",
      );
    }
  }

  private async handleMessage(msg: ConsumeMessage): Promise<void> {
    const channel = this.rabbitMQService.getChannel();
    try {
      const payload = JSON.parse(msg.content.toString()) as AssociadoCreatedPayload;

      if (!payload.id || !payload.email || !payload.telefone || !payload.atleticaId) {
        this.logger.warn("Payload de associado.created incompleto, descartando mensagem.");
        channel.nack(msg, false, false);
        return;
      }

      await this.usuarioService.createPreCadastro({
        nome: payload.nome,
        email: payload.email,
        telefone: payload.telefone,
        atleticaId: payload.atleticaId,
        associadoId: payload.id,
      });

      channel.ack(msg);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      this.logger.warn(`Falha ao processar criação de associado: ${message}`);
      channel.nack(msg, false, false);
    }
  }
}