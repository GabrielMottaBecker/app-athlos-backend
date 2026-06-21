import { PresencaEvento, StatusPresencaEvento } from "@feed/eventos/domain/models/presenca-evento.entity";
import type { PresencaEventoRepository } from "@feed/eventos/domain/repositories/presenca-evento-repository.interface";
import { eventoPresencasSchema } from "@feed/eventos/infra/database/schemas/evento.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { and, eq, inArray } from "drizzle-orm";

@Injectable()
export class DrizzlePresencaEventoRepository implements PresencaEventoRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async confirm(presenca: PresencaEvento): Promise<void> {
    await this.drizzleService.db.insert(eventoPresencasSchema).values({
      eventoId: presenca.eventoId,
      usuarioId: presenca.usuarioId,
      email: presenca.email,
      status: presenca.status,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async delete(eventoId: string, usuarioId: string): Promise<void> {
    await this.drizzleService.db
      .delete(eventoPresencasSchema)
      .where(
        and(
          eq(eventoPresencasSchema.eventoId, eventoId),
          eq(eventoPresencasSchema.usuarioId, usuarioId),
        ),
      );
  }

  async findByEventoAndUsuario(
    eventoId: string,
    usuarioId: string,
  ): Promise<PresencaEvento | null> {
    const result = await this.drizzleService.db
      .select()
      .from(eventoPresencasSchema)
      .where(
        and(
          eq(eventoPresencasSchema.eventoId, eventoId),
          eq(eventoPresencasSchema.usuarioId, usuarioId),
        ),
      )
      .limit(1);

    return this.toEntity(result[0]);
  }

  async findConfirmedEventIds(usuarioId: string, eventoIds: string[]): Promise<Set<string>> {
    if (eventoIds.length === 0) return new Set();

    const rows = await this.drizzleService.db
      .select({ eventoId: eventoPresencasSchema.eventoId })
      .from(eventoPresencasSchema)
      .where(
        and(
          eq(eventoPresencasSchema.usuarioId, usuarioId),
          inArray(eventoPresencasSchema.eventoId, eventoIds),
        ),
      );

    return new Set(rows.map((row) => row.eventoId));
  }

  async findByEvento(eventoId: string): Promise<PresencaEvento[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(eventoPresencasSchema)
      .where(eq(eventoPresencasSchema.eventoId, eventoId))
      .orderBy(eventoPresencasSchema.createdAt);

    return rows.map((row) => this.toEntity(row)!);
  }

  private toEntity(row: typeof eventoPresencasSchema.$inferSelect | undefined): PresencaEvento | null {
    if (!row) return null;
    return PresencaEvento.restore({
      id: row.id,
      eventoId: row.eventoId,
      usuarioId: row.usuarioId,
      email: row.email,
      status: row.status as StatusPresencaEvento,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}