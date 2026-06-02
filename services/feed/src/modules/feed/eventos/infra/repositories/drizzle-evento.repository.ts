import { Evento, TipoEvento } from "@feed/eventos/domain/models/evento.entity";
import type { EventoRepository } from "@feed/eventos/domain/repositories/evento-repository.interface";
import { eventosSchema } from "@feed/eventos/infra/database/schemas/evento.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { and, eq, sql } from "drizzle-orm";

@Injectable()
export class DrizzleEventoRepository implements EventoRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(evento: Evento): Promise<void> {
    await this.drizzleService.db.insert(eventosSchema).values({
      title: evento.title,
      date: evento.date,
      type: evento.type,
      typeColor: evento.typeColor,
      time: evento.time,
      place: evento.place,
      bgColor: evento.bgColor,
      atleticaId: evento.atleticaId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(evento: Evento): Promise<void> {
    await this.drizzleService.db
      .update(eventosSchema)
      .set({
        title: evento.title,
        date: evento.date,
        type: evento.type,
        typeColor: evento.typeColor,
        time: evento.time,
        place: evento.place,
        bgColor: evento.bgColor,
        updatedAt: new Date(),
      })
      .where(eq(eventosSchema.id, evento.id!));
  }

  async delete(id: string): Promise<void> {
    await this.drizzleService.db
      .delete(eventosSchema)
      .where(eq(eventosSchema.id, id));
  }

  async findById(id: string): Promise<Evento | null> {
    const result = await this.drizzleService.db
      .select()
      .from(eventosSchema)
      .where(eq(eventosSchema.id, id))
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findAllPaginated(
    params: PaginationParams,
  ): Promise<{ rows: Evento[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select()
        .from(eventosSchema)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(eventosSchema),
    ]);

    return {
      rows: rows.map((row) => this.toEntity(row)!),
      total: countResult.count,
    };
  }

  async findByAtletica(atleticaId: string): Promise<Evento[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(eventosSchema)
      .where(eq(eventosSchema.atleticaId, atleticaId));

    return rows.map((row) => this.toEntity(row)!);
  }

  async findByAtleticaAndType(atleticaId: string, type: TipoEvento): Promise<Evento[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(eventosSchema)
      .where(and(eq(eventosSchema.atleticaId, atleticaId), eq(eventosSchema.type, type)));

    return rows.map((row) => this.toEntity(row)!);
  }

  private toEntity(row: typeof eventosSchema.$inferSelect | undefined): Evento | null {
    if (!row) return null;
    return Evento.restore({
      id: row.id,
      title: row.title,
      date: row.date,
      type: row.type as TipoEvento,
      typeColor: row.typeColor,
      time: row.time,
      place: row.place,
      bgColor: row.bgColor,
      atleticaId: row.atleticaId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}
