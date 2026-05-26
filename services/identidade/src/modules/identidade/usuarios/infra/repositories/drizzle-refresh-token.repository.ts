import type {
  RefreshTokenRecord,
  RefreshTokenRepository,
} from "@identidade/usuarios/domain/repositories/refresh-token-repository.interface";
import { refreshTokensSchema } from "@identidade/usuarios/infra/database/schemas/refresh-token.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class DrizzleRefreshTokenRepository implements RefreshTokenRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(token: string, usuarioId: string, expiresAt: Date): Promise<void> {
    await this.drizzleService.db.insert(refreshTokensSchema).values({
      token,
      usuarioId,
      expiresAt,
      revogado: false,
      createdAt: new Date(),
    });
  }

  async findByToken(token: string): Promise<RefreshTokenRecord | null> {
    const result = await this.drizzleService.db
      .select()
      .from(refreshTokensSchema)
      .where(eq(refreshTokensSchema.token, token))
      .limit(1);

    const row = result[0];
    if (!row) return null;

    return {
      id: row.id,
      token: row.token,
      usuarioId: row.usuarioId,
      expiresAt: row.expiresAt,
      revogado: row.revogado,
    };
  }

  async revoke(token: string): Promise<void> {
    await this.drizzleService.db
      .update(refreshTokensSchema)
      .set({ revogado: true })
      .where(eq(refreshTokensSchema.token, token));
  }

  async revokeAllForUser(usuarioId: string): Promise<void> {
    await this.drizzleService.db
      .update(refreshTokensSchema)
      .set({ revogado: true })
      .where(eq(refreshTokensSchema.usuarioId, usuarioId));
  }
}
