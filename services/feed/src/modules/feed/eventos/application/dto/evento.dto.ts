import type { Evento } from "@feed/eventos/domain/models/evento.entity";
import { TipoEvento } from "@feed/eventos/domain/models/evento.entity";
import { ApiProperty } from "@nestjs/swagger";

export class EventoDto {
  @ApiProperty({ example: "uuid-aqui" })
  id!: string;

  @ApiProperty({ example: "JUN 14" })
  date!: string;

  @ApiProperty({ enum: TipoEvento, example: TipoEvento.TREINO })
  type!: TipoEvento;

  @ApiProperty({ example: 0xFF10B981 })
  typeColor!: number;

  @ApiProperty({ example: "TREINO DE FUTEBOL" })
  title!: string;

  @ApiProperty({ example: "19:00 - 21:00" })
  time!: string;

  @ApiProperty({ example: "Campo de Treinamento Alpha" })
  place!: string;

  @ApiProperty({ example: 0xFF1E3A5F })
  bgColor!: number;

  @ApiProperty({ example: "uuid-atletica" })
  atleticaId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  @ApiProperty({
    example: false,
    description: "Indica se o usuario autenticado ja confirmou presenca neste evento.",
  })
  confirmado!: boolean;

  static fromEvento(evento: Evento | null, confirmado = false): EventoDto | null {
    if (!evento) return null;

    const dto = new EventoDto();
    dto.id = evento.id!;
    dto.date = evento.date;
    dto.type = evento.type;
    dto.typeColor = evento.typeColor;
    dto.title = evento.title;
    dto.time = evento.time;
    dto.place = evento.place;
    dto.bgColor = evento.bgColor;
    dto.atleticaId = evento.atleticaId;
    dto.createdAt = evento.createdAt!;
    dto.updatedAt = evento.updatedAt!;
    dto.confirmado = confirmado;
    return dto;
  }
}