import { UsuarioDto } from "@identidade/usuarios/application/dto/usuario.dto";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import {
  IdentidadeExchangeName,
  IdentidadeRoutingKey,
} from "@shared/contracts/events/identidade-events.enum";
import { SharedMessagingService } from "@shared/infra/messaging/shared-messaging.service";

@Injectable()
export class UsuarioMessagingService implements OnApplicationBootstrap {
  private readonly logger = new Logger(UsuarioMessagingService.name);

  constructor(
    private readonly sharedMessagingService: SharedMessagingService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    try {
      await Promise.all([
        this.sharedMessagingService.assertExchange(IdentidadeExchangeName.USUARIO_CREATED),
        this.sharedMessagingService.assertExchange(IdentidadeExchangeName.USUARIO_UPDATED),
        this.sharedMessagingService.assertExchange(IdentidadeExchangeName.USUARIO_DELETED),
        this.sharedMessagingService.assertExchange(IdentidadeExchangeName.USUARIO_STATUS_CHANGED),
      ]);
    } catch (error) {
      this.logger.error("Falha ao criar exchanges de usuário", error);
      throw error;
    }
  }

  async publishUsuarioCreated(usuario: UsuarioDto): Promise<void> {
    await this.sharedMessagingService.publish(
      IdentidadeExchangeName.USUARIO_CREATED,
      IdentidadeRoutingKey.USUARIO_CREATED,
      usuario,
    );
  }

  async publishUsuarioUpdated(usuario: UsuarioDto): Promise<void> {
    await this.sharedMessagingService.publish(
      IdentidadeExchangeName.USUARIO_UPDATED,
      IdentidadeRoutingKey.USUARIO_UPDATED,
      usuario,
    );
  }

  async publishUsuarioDeleted(usuario: UsuarioDto): Promise<void> {
    await this.sharedMessagingService.publish(
      IdentidadeExchangeName.USUARIO_DELETED,
      IdentidadeRoutingKey.USUARIO_DELETED,
      usuario,
    );
  }

  async publishStatusChanged(usuario: UsuarioDto): Promise<void> {
    await this.sharedMessagingService.publish(
      IdentidadeExchangeName.USUARIO_STATUS_CHANGED,
      IdentidadeRoutingKey.USUARIO_STATUS_CHANGED,
      usuario,
    );
  }
}
