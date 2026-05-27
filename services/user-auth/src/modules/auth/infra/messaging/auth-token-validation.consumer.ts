import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import type { ConsumeMessage } from "amqplib";

export const AUTH_EXCHANGE = "auth.exchange";
export const VALIDATE_TOKEN_QUEUE = "auth.validate-token";
export const VALIDATE_TOKEN_ROUTING_KEY = "auth.validate-token";

export type ValidateTokenRequest = {
  token: string;
};

export type ValidateTokenResponse =
  | { valid: true; sub: string; email: string; permissions: string[] }
  | { valid: false; reason: string };

/**
 * RPC Consumer para validação de tokens JWT via RabbitMQ.
 *
 * Outros microsserviços publicam uma mensagem com:
 *   - exchange: "auth.exchange"
 *   - routingKey: "auth.validate-token"
 *   - properties.replyTo: fila de resposta exclusiva do solicitante
 *   - properties.correlationId: ID para correlacionar request/response
 *   - content: JSON { token: string }
 *
 * Este consumer responde na fila `replyTo` com ValidateTokenResponse.
 */
@Injectable()
export class AuthTokenValidationConsumer implements OnModuleInit {
  private readonly logger = new Logger(AuthTokenValidationConsumer.name);

  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      const channel = this.rabbitMQService.getChannel();

      await channel.assertExchange(AUTH_EXCHANGE, "direct", { durable: true });
      await channel.assertQueue(VALIDATE_TOKEN_QUEUE, { durable: true });
      await channel.bindQueue(
        VALIDATE_TOKEN_QUEUE,
        AUTH_EXCHANGE,
        VALIDATE_TOKEN_ROUTING_KEY,
      );

      // prefetch 1 garante processamento sequencial por worker (fair dispatch)
      channel.prefetch(1);

      channel.consume(VALIDATE_TOKEN_QUEUE, async (msg) => {
        if (!msg) return;

        const response = await this.handleValidation(msg);

        if (msg.properties.replyTo) {
          channel.sendToQueue(
            msg.properties.replyTo,
            Buffer.from(JSON.stringify(response)),
            {
              correlationId: msg.properties.correlationId,
              contentType: "application/json",
            },
          );
        }

        channel.ack(msg);
      });

      this.logger.log(
        `Listening for token validation requests on queue "${VALIDATE_TOKEN_QUEUE}"`,
      );
    } catch {
      this.logger.warn(
        "RabbitMQ unavailable; token validation consumer disabled. " +
        "Set RABBITMQ_URL to enable inter-service token validation.",
      );
    }
  }

  private async handleValidation(
    msg: ConsumeMessage,
  ): Promise<ValidateTokenResponse> {
    try {
      const { token } = JSON.parse(
        msg.content.toString(),
      ) as ValidateTokenRequest;

      if (!token) {
        return { valid: false, reason: "Missing token in payload" };
      }

      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        email: string;
        permissions: string[];
      }>(token);

      return {
        valid: true,
        sub: payload.sub,
        email: payload.email,
        permissions: payload.permissions,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      this.logger.warn(`Token validation failed: ${message}`);
      return { valid: false, reason: "Invalid or expired token" };
    }
  }
}