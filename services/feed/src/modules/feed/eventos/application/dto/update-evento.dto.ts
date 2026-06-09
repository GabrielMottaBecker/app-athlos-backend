import { TipoEvento } from "@feed/eventos/domain/models/evento.entity";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsInt, IsOptional, IsString } from "class-validator";

export class UpdateEventoDto {
  @ApiPropertyOptional({ example: "TREINO ATUALIZADO" })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ example: "JUN 15" })
  @IsString()
  @IsOptional()
  date?: string;

  @ApiPropertyOptional({ enum: TipoEvento, example: TipoEvento.TREINO })
  @IsEnum(TipoEvento)
  @IsOptional()
  type?: TipoEvento;

  @ApiPropertyOptional({ example: 0xFF10B981 })
  @IsInt()
  @IsOptional()
  typeColor?: number;

  @ApiPropertyOptional({ example: "20:00 - 22:00" })
  @IsString()
  @IsOptional()
  time?: string;

  @ApiPropertyOptional({ example: "Campo de Treinamento Beta" })
  @IsString()
  @IsOptional()
  place?: string;

  @ApiPropertyOptional({ example: 0xFF1E3A5F })
  @IsInt()
  @IsOptional()
  bgColor?: number;
}
