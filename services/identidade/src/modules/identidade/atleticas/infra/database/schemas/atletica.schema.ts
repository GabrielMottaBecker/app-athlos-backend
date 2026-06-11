import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

export const atleticasTable = pgTable("atleticas", {
  id:             uuid("id").primaryKey().defaultRandom(),
  nome:           varchar("nome", { length: 255 }).notNull(),
  nomePresidente: varchar("nome_presidente", { length: 255 }).notNull(),
  corPrimaria:    varchar("cor_primaria", { length: 7 }),
  corFundo:       varchar("cor_fundo", { length: 7 }),
  criadoEm:       timestamp("criado_em", { withTimezone: true }).defaultNow().notNull(),
  atualizadoEm:   timestamp("atualizado_em", { withTimezone: true }).defaultNow().notNull(),
});