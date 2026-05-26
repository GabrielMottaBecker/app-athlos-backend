import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const usuarioRoleEnum = pgEnum("usuario_role", ["ADMINISTRADOR", "MEMBRO"]);
export const usuarioStatusEnum = pgEnum("usuario_status", ["ATIVO", "INATIVO"]);

export const usuariosSchema = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  senhaHash: varchar("senha_hash", { length: 255 }).notNull(),
  role: usuarioRoleEnum("role").notNull().default("MEMBRO"),
  status: usuarioStatusEnum("status").notNull().default("ATIVO"),
  atleticaId: uuid("atletica_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
