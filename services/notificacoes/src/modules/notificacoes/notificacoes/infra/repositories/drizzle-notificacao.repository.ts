import { Notificacao } from "@notificacoes/notificacoes/domain/models/notificacao.entity";
import { NotificacaoTipo } from "@notificacoes/notificacoes/domain/models/notificacao-tipo.enum";
import type { NotificacaoRepository } from "@notificacoes/notificacoes/domain/repositories/notificacao-repository.interface";
import {
  notificacaoLeiturasSchema,
  notificacoesSchema,
} from "@notificacoes/notificacoes/infra/database/schemas/notificacao.schema";
import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import type { PaginationParams } from "@shared/infra/hateoas";
import { and, eq, isNull, or, sql } from "drizzle-orm";

type InboxRow = {
  id: string;
  usuarioId: string | null;
  atleticaId: string;
  tipo: string;
  titulo: string;
  mensagem: string;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
  readAt: Date | null;
};

@Injectable()
export class DrizzleNotificacaoRepository implements NotificacaoRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async create(notificacao: Notificacao): Promise<void> {
    await this.drizzleService.db.insert(notificacoesSchema).values({
      usuarioId: notificacao.usuarioId ?? null,
      atleticaId: notificacao.atleticaId,
      tipo: notificacao.tipo,
      titulo: notificacao.titulo,
      mensagem: notificacao.mensagem,
      metadata: notificacao.metadata ?? null,
      createdAt: new Date(),
    });
  }

  async findInboxPaginated(
    usuarioId: string,
    atleticaId: string,
    params: PaginationParams,
  ): Promise<{ rows: Notificacao[]; total: number }> {
    const { page, limit } = params;
    const offset = (page - 1) * limit;
    const visibleWhere = this.visibleWhere(usuarioId, atleticaId);

    const [rows, [countResult]] = await Promise.all([
      this.drizzleService.db
        .select({
          id: notificacoesSchema.id,
          usuarioId: notificacoesSchema.usuarioId,
          atleticaId: notificacoesSchema.atleticaId,
          tipo: notificacoesSchema.tipo,
          titulo: notificacoesSchema.titulo,
          mensagem: notificacoesSchema.mensagem,
          metadata: notificacoesSchema.metadata,
          createdAt: notificacoesSchema.createdAt,
          readAt: notificacaoLeiturasSchema.readAt,
        })
        .from(notificacoesSchema)
        .leftJoin(
          notificacaoLeiturasSchema,
          and(
            eq(notificacaoLeiturasSchema.notificacaoId, notificacoesSchema.id),
            eq(notificacaoLeiturasSchema.usuarioId, usuarioId),
          ),
        )
        .where(visibleWhere)
        .limit(limit)
        .offset(offset),
      this.drizzleService.db
        .select({ count: sql<number>`count(*)::int` })
        .from(notificacoesSchema)
        .where(visibleWhere),
    ]);

    return {
      rows: rows.map((row) => this.toEntity(row)!),
      total: countResult.count,
    };
  }

  async countUnread(usuarioId: string, atleticaId: string): Promise<number> {
    const [result] = await this.drizzleService.db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificacoesSchema)
      .leftJoin(
        notificacaoLeiturasSchema,
        and(
          eq(notificacaoLeiturasSchema.notificacaoId, notificacoesSchema.id),
          eq(notificacaoLeiturasSchema.usuarioId, usuarioId),
        ),
      )
      .where(and(this.visibleWhere(usuarioId, atleticaId), isNull(notificacaoLeiturasSchema.id)));

    return result.count;
  }

  async markAsRead(notificacaoId: string, usuarioId: string): Promise<void> {
    await this.drizzleService.db
      .insert(notificacaoLeiturasSchema)
      .values({
        notificacaoId,
        usuarioId,
        readAt: new Date(),
      })
      .onConflictDoNothing();
  }

  async markAllAsRead(usuarioId: string, atleticaId: string): Promise<void> {
    const { rows } = await this.findInboxPaginated(usuarioId, atleticaId, {
      page: 1,
      limit: 1000,
    });

    await Promise.all(
      rows
        .filter((row) => !row.lida)
        .map((row) => this.markAsRead(row.id!, usuarioId)),
    );
  }

  private visibleWhere(usuarioId: string, atleticaId: string) {
    return and(
      eq(notificacoesSchema.atleticaId, atleticaId),
      or(
        eq(notificacoesSchema.usuarioId, usuarioId),
        isNull(notificacoesSchema.usuarioId),
      ),
    );
  }

  private toEntity(row: InboxRow | undefined): Notificacao | null {
    if (!row) return null;
    return Notificacao.restore({
      id: row.id,
      usuarioId: row.usuarioId,
      atleticaId: row.atleticaId,
      tipo: row.tipo as NotificacaoTipo,
      titulo: row.titulo,
      mensagem: row.mensagem,
      metadata: row.metadata,
      createdAt: row.createdAt,
      readAt: row.readAt,
    });
  }
}
