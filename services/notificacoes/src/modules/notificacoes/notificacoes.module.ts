import { AssociadoStatusChangedConsumer } from "@notificacoes/consumers/associado-status-changed.consumer";
import { AssociadoUpdatedConsumer } from "@notificacoes/consumers/associado-updated.consumer";
import { FeedEventoCreatedConsumer } from "@notificacoes/consumers/feed-evento-created.consumer";
import { DeviceTokenService } from "@notificacoes/device-tokens/application/services/device-token.service";
import { DEVICE_TOKEN_REPOSITORY } from "@notificacoes/device-tokens/domain/repositories/device-token-repository.interface";
import { DeviceTokensController } from "@notificacoes/device-tokens/infra/controllers/device-tokens.controller";
import { DrizzleDeviceTokenRepository } from "@notificacoes/device-tokens/infra/repositories/drizzle-device-token.repository";
import { NotificacaoService } from "@notificacoes/notificacoes/application/services/notificacao.service";
import { NOTIFICACAO_REPOSITORY } from "@notificacoes/notificacoes/domain/repositories/notificacao-repository.interface";
import { NotificacoesController } from "@notificacoes/notificacoes/infra/controllers/notificacoes.controller";
import { DrizzleNotificacaoRepository } from "@notificacoes/notificacoes/infra/repositories/drizzle-notificacao.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [NotificacoesController, DeviceTokensController],
  providers: [
    NotificacaoService,
    DeviceTokenService,
    DrizzleNotificacaoRepository,
    DrizzleDeviceTokenRepository,
    FeedEventoCreatedConsumer,
    AssociadoStatusChangedConsumer,
    AssociadoUpdatedConsumer,
    {
      provide: NOTIFICACAO_REPOSITORY,
      useExisting: DrizzleNotificacaoRepository,
    },
    {
      provide: DEVICE_TOKEN_REPOSITORY,
      useExisting: DrizzleDeviceTokenRepository,
    },
  ],
  exports: [NotificacaoService],
})
export class NotificacoesModule {}
