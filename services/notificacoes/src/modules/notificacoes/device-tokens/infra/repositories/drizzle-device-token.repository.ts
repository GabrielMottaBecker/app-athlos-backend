import { DevicePlatform } from "@notificacoes/device-tokens/domain/models/device-platform.enum";
import { DeviceToken } from "@notificacoes/device-tokens/domain/models/device-token.entity";
import type { DeviceTokenRepository } from "@notificacoes/device-tokens/domain/repositories/device-token-repository.interface";
import { deviceTokensSchema } from "@notificacoes/device-tokens/infra/database/schemas/device-token.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { and, eq } from "drizzle-orm";

@Injectable()
export class DrizzleDeviceTokenRepository implements DeviceTokenRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async upsert(deviceToken: DeviceToken): Promise<void> {
    const now = new Date();
    await this.drizzleService.db
      .insert(deviceTokensSchema)
      .values({
        usuarioId: deviceToken.usuarioId,
        atleticaId: deviceToken.atleticaId,
        token: deviceToken.token,
        platform: deviceToken.platform,
        ativo: true,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: deviceTokensSchema.token,
        set: {
          usuarioId: deviceToken.usuarioId,
          atleticaId: deviceToken.atleticaId,
          platform: deviceToken.platform,
          ativo: true,
          updatedAt: now,
        },
      });
  }

  async deactivate(token: string, usuarioId: string): Promise<void> {
    await this.drizzleService.db
      .update(deviceTokensSchema)
      .set({ ativo: false, updatedAt: new Date() })
      .where(and(eq(deviceTokensSchema.token, token), eq(deviceTokensSchema.usuarioId, usuarioId)));
  }

  async findActiveByAtletica(atleticaId: string): Promise<DeviceToken[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(deviceTokensSchema)
      .where(and(eq(deviceTokensSchema.atleticaId, atleticaId), eq(deviceTokensSchema.ativo, true)));

    return rows.map((row) => this.toEntity(row)!);
  }

  async findActiveByUsuario(usuarioId: string): Promise<DeviceToken[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(deviceTokensSchema)
      .where(and(eq(deviceTokensSchema.usuarioId, usuarioId), eq(deviceTokensSchema.ativo, true)));

    return rows.map((row) => this.toEntity(row)!);
  }

  private toEntity(row: typeof deviceTokensSchema.$inferSelect | undefined): DeviceToken | null {
    if (!row) return null;
    return DeviceToken.restore({
      id: row.id,
      usuarioId: row.usuarioId,
      atleticaId: row.atleticaId,
      token: row.token,
      platform: row.platform as DevicePlatform,
      ativo: row.ativo,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
