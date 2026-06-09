import { DevicePlatform } from "@notificacoes/device-tokens/domain/models/device-platform.enum";
import { boolean, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const devicePlatformEnum = pgEnum("device_platform", [
  DevicePlatform.ANDROID,
  DevicePlatform.IOS,
  DevicePlatform.WEB,
]);

export const deviceTokensSchema = pgTable("device_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id").notNull(),
  atleticaId: uuid("atletica_id").notNull(),
  token: text("token").notNull().unique(),
  platform: devicePlatformEnum("platform").notNull(),
  ativo: boolean("ativo").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
