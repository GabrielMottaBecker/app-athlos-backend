import { TipoEvento } from "@feed/eventos/domain/models/evento.entity";
import { StatusPresencaEvento } from "@feed/eventos/domain/models/presenca-evento.entity";
import { bigint, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const tipoEventoEnum = pgEnum("tipo_evento", [
  TipoEvento.TREINO,
  TipoEvento.EVENTO_SOCIAL,
  TipoEvento.EXTRAS,
  TipoEvento.COMPETICAO,
]);

export const statusPresencaEventoEnum = pgEnum("status_presenca_evento", [
  StatusPresencaEvento.CONFIRMADA,
]);

export const eventosSchema = pgTable("eventos", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: text("date").notNull(),
  type: tipoEventoEnum("type").notNull(),
  typeColor: bigint("type_color", { mode: "number" }).notNull(),
  title: text("title").notNull(),
  time: text("time").notNull(),
  place: text("place").notNull(),
  bgColor: bigint("bg_color", { mode: "number" }).notNull(),
  atleticaId: uuid("atletica_id").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
});

export const eventoPresencasSchema = pgTable(
  "evento_presencas",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    eventoId: uuid("evento_id")
      .notNull()
      .references(() => eventosSchema.id, { onDelete: "cascade" }),
    usuarioId: uuid("usuario_id").notNull(),
    email: text("email").notNull().default(""),
    status: statusPresencaEventoEnum("status").notNull().default(StatusPresencaEvento.CONFIRMADA),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull(),
  },
  (table) => ({
    eventoUsuarioUnique: uniqueIndex("evento_presencas_evento_id_usuario_id_unique").on(
      table.eventoId,
      table.usuarioId,
    ),
  }),
);