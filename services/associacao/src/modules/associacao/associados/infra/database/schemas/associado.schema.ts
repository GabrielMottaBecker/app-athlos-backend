import { pgEnum, pgTable, numeric, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const statusAssociadoEnum = pgEnum("status_associado", ["ATIVO", "INATIVO"]);

export const associadosSchema = pgTable("associados", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  email: text("email").notNull().unique(),
  documento: varchar("documento", { length: 20 }).notNull().unique(),
  telefone: varchar("telefone", { length: 20 }).notNull(),
  status: statusAssociadoEnum("status").notNull().default("ATIVO"),
  atleticaId: uuid("atletica_id").notNull(),
  taxaAthlos: numeric("taxa_athlos", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
