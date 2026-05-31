import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class UpdateTransacaoDto {
  @ApiPropertyOptional({ example: "Patrocínio recorrente" })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ example: 750.00 })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  valor?: number;

  @ApiPropertyOptional({ example: "uuid-categoria" })
  @IsUUID()
  @IsOptional()
  categoriaId?: string;

  @ApiPropertyOptional({ example: "2026-02-01" })
  @IsDateString()
  @IsOptional()
  dataTransacao?: string;

  @ApiPropertyOptional({ example: "Novo comentário" })
  @IsString()
  @IsOptional()
  observacao?: string;
}
