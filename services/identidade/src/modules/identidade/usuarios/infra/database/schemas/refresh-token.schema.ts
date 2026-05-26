import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { usuariosSchema } from "./usuario.schema";

export const refreshTokensSchema = pgTable("refresh_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  token: text("token").notNull().unique(),
  usuarioId: uuid("usuario_id")
    .notNull()
    .references(() => usuariosSchema.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revogado: boolean("revogado").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});
