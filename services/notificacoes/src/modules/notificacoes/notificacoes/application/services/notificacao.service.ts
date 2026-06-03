import { CreateNotificacaoDto } from "@notificacoes/notificacoes/application/dto/create-notificacao.dto";
import { NotificacaoDto } from "@notificacoes/notificacoes/application/dto/notificacao.dto";
import { Notificacao } from "@notificacoes/notificacoes/domain/models/notificacao.entity";
import {
  NOTIFICACAO_REPOSITORY,
  type NotificacaoRepository,
} from "@notificacoes/notificacoes/domain/repositories/notificacao-repository.interface";
import { Inject, Injectable } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class NotificacaoService {
  constructor(
    @Inject(NOTIFICACAO_REPOSITORY)
    private readonly notificacaoRepository: NotificacaoRepository,
  ) {}

  async create(dto: CreateNotificacaoDto): Promise<void> {
    const notificacao = Notificacao.restore({
      usuarioId: dto.usuarioId ?? null,
      atleticaId: dto.atleticaId,
      tipo: dto.tipo,
      titulo: dto.titulo,
      mensagem: dto.mensagem,
      metadata: dto.metadata ?? null,
    })!;

    await this.notificacaoRepository.create(notificacao);
  }

  async listInbox(
    usuarioId: string,
    atleticaId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<NotificacaoDto>> {
    const { rows, total } = await this.notificacaoRepository.findInboxPaginated(
      usuarioId,
      atleticaId,
      params,
    );

    return {
      data: rows.map((row) => NotificacaoDto.fromNotificacao(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async countUnread(usuarioId: string, atleticaId: string): Promise<{ count: number }> {
    const count = await this.notificacaoRepository.countUnread(usuarioId, atleticaId);
    return { count };
  }

  async markAsRead(notificacaoId: string, usuarioId: string): Promise<void> {
    await this.notificacaoRepository.markAsRead(notificacaoId, usuarioId);
  }

  async markAllAsRead(usuarioId: string, atleticaId: string): Promise<void> {
    await this.notificacaoRepository.markAllAsRead(usuarioId, atleticaId);
  }
}
