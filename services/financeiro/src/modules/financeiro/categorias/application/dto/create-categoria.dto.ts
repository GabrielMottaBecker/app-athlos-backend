import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { TipoCategoria } from "@financeiro/categorias/domain/models/tipo-categoria.enum";

export class CreateCategoriaDto {
  @ApiProperty({ example: "Mensalidades" })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ enum: TipoCategoria, example: TipoCategoria.RECEITA })
  @IsEnum(TipoCategoria)
  tipo!: TipoCategoria;

  @ApiProperty({ example: "uuid-atletica" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;
}
