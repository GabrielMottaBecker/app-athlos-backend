import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { TipoCategoria } from "@financeiro/categorias/domain/models/tipo-categoria.enum";

export class UpdateCategoriaDto {
  @ApiPropertyOptional({ example: "Patrocínios" })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ enum: TipoCategoria })
  @IsEnum(TipoCategoria)
  @IsOptional()
  tipo?: TipoCategoria;
}
