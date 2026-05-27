import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tipoCargoCEnum = pgEnum("tipo_cargo", ["ADMINISTRADOR", "MEMBRO_COMUM"]);

export const cargosSchema = pgTable("cargos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  tipo: tipoCargoCEnum("tipo").notNull(),
  atleticaId: uuid("atletica_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
