import { numeric, pgEnum, pgTable, integer, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const statusProdutoEnum = pgEnum("status_produto", ["DISPONIVEL", "ESGOTADO", "INATIVO"]);

export const produtosSchema = pgTable("produtos", {
  id: uuid("id").primaryKey().defaultRandom(),
  nome: text("nome").notNull(),
  descricao: text("descricao").notNull(),
  preco: numeric("preco", { precision: 10, scale: 2 }).notNull(),
  estoque: integer("estoque").notNull().default(0),
  status: statusProdutoEnum("status").notNull().default("DISPONIVEL"),
  atleticaId: uuid("atletica_id").notNull(),
  imagemUrl: text("imagem_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});
