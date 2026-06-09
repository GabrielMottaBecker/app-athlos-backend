import type { DeviceToken } from "@notificacoes/device-tokens/domain/models/device-token.entity";

export const DEVICE_TOKEN_REPOSITORY = Symbol("DEVICE_TOKEN_REPOSITORY");

export interface DeviceTokenRepository {
  upsert(deviceToken: DeviceToken): Promise<void>;
  deactivate(token: string, usuarioId: string): Promise<void>;
  findActiveByAtletica(atleticaId: string): Promise<DeviceToken[]>;
  findActiveByUsuario(usuarioId: string): Promise<DeviceToken[]>;
}
