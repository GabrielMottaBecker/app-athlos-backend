import { Injectable, Logger, UnauthorizedException } from "@nestjs/common";
import { RabbitMQService } from "@shared/infra/messaging/rabbitmq.service";
import { randomUUID } from "node:crypto";

const AUTH_EXCHANGE = "auth.exchange";
const VALIDATE_TOKEN_ROUTING_KEY = "auth.validate-token";
const RPC_TIMEOUT_MS = 5_000;

type ValidateTokenResponse =
  | { valid: true; sub: string; email: string; permissions: string[] }
  | { valid: false; reason: string };

/**
 * Serviço RPC para validar tokens JWT junto ao microsserviço de Autenticação.
 *
 * Uso nos outros microsserviços:
 *
 *   const user = await this.authRpcService.validateToken(token);
 *   // lança UnauthorizedException se inválido
 *
 * Adicione AuthRpcService ao providers do módulo que precisar e importe
 * o SharedModule (que já exporta RabbitMQService).
 */
@Injectable()
export class AuthRpcService {
  private readonly logger = new Logger(AuthRpcService.name);

  constructor(private readonly rabbitMQService: RabbitMQService) {}

  async validateToken(
    token: string,
  ): Promise<{ sub: string; email: string; permissions: string[] }> {
    let channel;

    try {
      channel = await this.rabbitMQService.createChannel();
    } catch {
      this.logger.error(
        "RabbitMQ unavailable; cannot validate token via Auth service. " +
        "Set RABBITMQ_URL to enable inter-service token validation.",
      );
      throw new UnauthorizedException("Auth service unavailable");
    }

    try {
      // Fila exclusiva e auto-deletável para receber a resposta
      const { queue: replyQueue } = await channel.assertQueue("", {
        exclusive: true,
        autoDelete: true,
      });

      const correlationId = randomUUID();

      const responsePromise = new Promise<ValidateTokenResponse>(
        (resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Auth RPC timeout"));
          }, RPC_TIMEOUT_MS);

          channel.consume(
            replyQueue,
            (msg) => {
              if (msg?.properties.correlationId === correlationId) {
                clearTimeout(timeout);
                const response = JSON.parse(
                  msg.content.toString(),
                ) as ValidateTokenResponse;
                channel.ack(msg);
                resolve(response);
              }
            },
            { noAck: false },
          );
        },
      );

      await channel.assertExchange(AUTH_EXCHANGE, "direct", { durable: true });

      channel.publish(
        AUTH_EXCHANGE,
        VALIDATE_TOKEN_ROUTING_KEY,
        Buffer.from(JSON.stringify({ token })),
        {
          replyTo: replyQueue,
          correlationId,
          contentType: "application/json",
          expiration: String(RPC_TIMEOUT_MS),
        },
      );

      const response = await responsePromise;

      if (!response.valid) {
        throw new UnauthorizedException(response.reason);
      }

      return {
        sub: response.sub,
        email: response.email,
        permissions: response.permissions,
      };
    } finally {
      // Canal dedicado ao RPC é fechado após cada chamada
      await channel.close();
    }
  }
}