import { RegisterDeviceTokenDto } from "@notificacoes/device-tokens/application/dto/register-device-token.dto";
import { DeviceToken } from "@notificacoes/device-tokens/domain/models/device-token.entity";
import {
  DEVICE_TOKEN_REPOSITORY,
  type DeviceTokenRepository,
} from "@notificacoes/device-tokens/domain/repositories/device-token-repository.interface";
import { Inject, Injectable } from "@nestjs/common";

@Injectable()
export class DeviceTokenService {
  constructor(
    @Inject(DEVICE_TOKEN_REPOSITORY)
    private readonly deviceTokenRepository: DeviceTokenRepository,
  ) {}

  async register(
    dto: RegisterDeviceTokenDto,
    usuarioId: string,
    atleticaId: string,
  ): Promise<void> {
    const deviceToken = DeviceToken.restore({
      usuarioId,
      atleticaId,
      token: dto.token,
      platform: dto.platform,
      ativo: true,
    })!;

    await this.deviceTokenRepository.upsert(deviceToken);
  }

  async deactivate(token: string, usuarioId: string): Promise<void> {
    await this.deviceTokenRepository.deactivate(token, usuarioId);
  }
}
