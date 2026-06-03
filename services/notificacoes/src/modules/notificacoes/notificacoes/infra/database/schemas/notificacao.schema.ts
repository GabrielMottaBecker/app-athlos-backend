import { NotificacaoTipo } from "@notificacoes/notificacoes/domain/models/notificacao-tipo.enum";
import { jsonb, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const notificacaoTipoEnum = pgEnum("notificacao_tipo", [
  NotificacaoTipo.EVENTO_PUBLICADO,
  NotificacaoTipo.ASSOCIACAO_ATUALIZADA,
  NotificacaoTipo.SISTEMA,
]);

export const notificacoesSchema = pgTable("notificacoes", {
  id: uuid("id").primaryKey().defaultRandom(),
  usuarioId: uuid("usuario_id"),
  atleticaId: uuid("atletica_id").notNull(),
  tipo: notificacaoTipoEnum("tipo").notNull(),
  titulo: text("titulo").notNull(),
  mensagem: text("mensagem").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown> | null>(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
});

export const notificacaoLeiturasSchema = pgTable(
  "notificacao_leituras",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    notificacaoId: uuid("notificacao_id")
      .notNull()
      .references(() => notificacoesSchema.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id").notNull(),
    readAt: timestamp("read_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    notificacaoUsuarioUnique: uniqueIndex("notificacao_leituras_notificacao_id_usuario_id_unique").on(
      table.notificacaoId,
      table.usuarioId,
    ),
  }),
);
