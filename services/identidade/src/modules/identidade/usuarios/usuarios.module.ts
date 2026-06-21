import { AuthService } from "@identidade/usuarios/application/services/auth.service";
import { UsuarioMessagingService } from "@identidade/usuarios/application/services/usuario-messaging.service";
import { UsuarioService } from "@identidade/usuarios/application/services/usuario.service";
import {
  REFRESH_TOKEN_REPOSITORY,
} from "@identidade/usuarios/domain/repositories/refresh-token-repository.interface";
import {
  USUARIO_REPOSITORY,
} from "@identidade/usuarios/domain/repositories/usuario-repository.interface";
import { AuthController } from "@identidade/usuarios/infra/controllers/auth.controller";
import { UsuariosController } from "@identidade/usuarios/infra/controllers/usuarios.controller";
import { AssociadoCreatedConsumer } from "@identidade/usuarios/infra/messaging/associado-created.consumer";
import { DrizzleRefreshTokenRepository } from "@identidade/usuarios/infra/repositories/drizzle-refresh-token.repository";
import { DrizzleUsuarioRepository } from "@identidade/usuarios/infra/repositories/drizzle-usuario.repository";
import { Module } from "@nestjs/common";

@Module({
  controllers: [AuthController, UsuariosController],
  providers: [
    AuthService,
    UsuarioService,
    UsuarioMessagingService,
    AssociadoCreatedConsumer,
    DrizzleUsuarioRepository,
    DrizzleRefreshTokenRepository,
    {
      provide: USUARIO_REPOSITORY,
      useExisting: DrizzleUsuarioRepository,
    },
    {
      provide: REFRESH_TOKEN_REPOSITORY,
      useExisting: DrizzleRefreshTokenRepository,
    },
  ],
})
export class UsuariosModule {}