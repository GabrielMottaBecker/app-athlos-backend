import { numeric, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { categoriasSchema } from "@financeiro/categorias/infra/database/schemas/categoria.schema";

export const tipoTransacaoEnum = pgEnum("tipo_transacao", ["RECEITA", "DESPESA"]);

export const transacoesSchema = pgTable("transacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  descricao: text("descricao").notNull(),
  valor: numeric("valor", { precision: 12, scale: 2 }).notNull(),
  tipo: tipoTransacaoEnum("tipo").notNull(),
  categoriaId: uuid("categoria_id")
    .notNull()
    .references(() => categoriasSchema.id, { onDelete: "restrict" }),
  atleticaId: uuid("atletica_id").notNull(),
  dataTransacao: timestamp("data_transacao", { withTimezone: true }).notNull(),
  observacao: text("observacao"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
