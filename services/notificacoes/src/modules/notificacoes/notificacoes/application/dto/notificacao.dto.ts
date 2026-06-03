import type { Notificacao } from "@notificacoes/notificacoes/domain/models/notificacao.entity";
import { NotificacaoTipo } from "@notificacoes/notificacoes/domain/models/notificacao-tipo.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class NotificacaoDto {
  @ApiProperty({ example: "uuid-aqui" })
  id!: string;

  @ApiPropertyOptional({ example: "uuid-usuario", nullable: true })
  usuarioId?: string | null;

  @ApiProperty({ example: "uuid-atletica" })
  atleticaId!: string;

  @ApiProperty({ enum: NotificacaoTipo, example: NotificacaoTipo.EVENTO_PUBLICADO })
  tipo!: NotificacaoTipo;

  @ApiProperty({ example: "Novo evento publicado" })
  titulo!: string;

  @ApiProperty({ example: "TREINO DE FUTEBOL foi publicado na agenda." })
  mensagem!: string;

  @ApiPropertyOptional({ example: { eventoId: "uuid-evento" }, nullable: true })
  metadata?: Record<string, unknown> | null;

  @ApiProperty({ example: false })
  lida!: boolean;

  @ApiPropertyOptional({ nullable: true })
  readAt?: Date | null;

  @ApiProperty()
  createdAt!: Date;

  static fromNotificacao(notificacao: Notificacao | null): NotificacaoDto | null {
    if (!notificacao) return null;

    const dto = new NotificacaoDto();
    dto.id = notificacao.id!;
    dto.usuarioId = notificacao.usuarioId ?? null;
    dto.atleticaId = notificacao.atleticaId;
    dto.tipo = notificacao.tipo;
    dto.titulo = notificacao.titulo;
    dto.mensagem = notificacao.mensagem;
    dto.metadata = notificacao.metadata ?? null;
    dto.lida = notificacao.lida;
    dto.readAt = notificacao.readAt ?? null;
    dto.createdAt = notificacao.createdAt!;
    return dto;
  }
}
