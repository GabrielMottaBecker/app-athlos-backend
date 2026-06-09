import { pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const tipoCategoriaEnum = pgEnum("tipo_categoria", ["RECEITA", "DESPESA"]);

export const categoriasSchema = pgTable("categorias", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  tipo: tipoCategoriaEnum("tipo").notNull(),
  atleticaId: uuid("atletica_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
