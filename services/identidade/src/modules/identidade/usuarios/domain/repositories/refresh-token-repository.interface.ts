export const REFRESH_TOKEN_REPOSITORY = Symbol("REFRESH_TOKEN_REPOSITORY");

export interface RefreshTokenRecord {
  id: string;
  token: string;
  usuarioId: string;
  expiresAt: Date;
  revogado: boolean;
}

export interface RefreshTokenRepository {
  create(token: string, usuarioId: string, expiresAt: Date): Promise<void>;
  findByToken(token: string): Promise<RefreshTokenRecord | null>;
  revoke(token: string): Promise<void>;
  revokeAllForUser(usuarioId: string): Promise<void>;
}
