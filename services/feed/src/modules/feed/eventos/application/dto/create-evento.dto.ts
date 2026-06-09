import { TipoEvento } from "@feed/eventos/domain/models/evento.entity";
import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateEventoDto {
  @ApiProperty({ example: "TREINO DE FUTEBOL" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: "JUN 14" })
  @IsString()
  @IsNotEmpty()
  date!: string;

  @ApiProperty({ enum: TipoEvento, example: TipoEvento.TREINO })
  @IsEnum(TipoEvento)
  type!: TipoEvento;

  @ApiProperty({ example: 0xFF10B981 })
  @IsInt()
  typeColor!: number;

  @ApiProperty({ example: "19:00 - 21:00" })
  @IsString()
  @IsNotEmpty()
  time!: string;

  @ApiProperty({ example: "Campo de Treinamento Alpha" })
  @IsString()
  @IsNotEmpty()
  place!: string;

  @ApiProperty({ example: 0xFF1E3A5F })
  @IsInt()
  bgColor!: number;

  @ApiProperty({ example: "00000000-0000-0000-0000-000000000001" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;
}
