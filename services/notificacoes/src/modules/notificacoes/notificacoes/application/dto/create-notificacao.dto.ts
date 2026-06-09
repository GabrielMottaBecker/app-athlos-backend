import { NotificacaoTipo } from "@notificacoes/notificacoes/domain/models/notificacao-tipo.enum";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateNotificacaoDto {
  @ApiPropertyOptional({ example: "uuid-usuario", nullable: true })
  @IsUUID()
  @IsOptional()
  usuarioId?: string;

  @ApiProperty({ example: "uuid-atletica" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;

  @ApiProperty({ enum: NotificacaoTipo, example: NotificacaoTipo.SISTEMA })
  @IsEnum(NotificacaoTipo)
  tipo!: NotificacaoTipo;

  @ApiProperty({ example: "Novo aviso" })
  @IsString()
  @IsNotEmpty()
  titulo!: string;

  @ApiProperty({ example: "Uma nova notificacao foi publicada." })
  @IsString()
  @IsNotEmpty()
  mensagem!: string;

  @ApiPropertyOptional({ example: { origem: "manual" } })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
