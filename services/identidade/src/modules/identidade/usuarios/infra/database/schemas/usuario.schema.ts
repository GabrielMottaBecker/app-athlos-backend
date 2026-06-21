import { pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const usuarioRoleEnum = pgEnum("usuario_role", ["SUPER_ADMIN", "ADMINISTRADOR", "MEMBRO"]);
export const usuarioStatusEnum = pgEnum("usuario_status", ["ATIVO", "INATIVO"]);

export const usuariosSchema = pgTable("usuarios", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  telefone: varchar("telefone", { length: 20 }),
  senhaHash: varchar("senha_hash", { length: 255 }),
  role: usuarioRoleEnum("role").notNull().default("MEMBRO"),
  status: usuarioStatusEnum("status").notNull().default("ATIVO"),
  atleticaId: uuid("atletica_id").notNull(),
  associadoId: uuid("associado_id").unique(),
  ativadoEm: timestamp("ativado_em", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});