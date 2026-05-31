import { ApiProperty } from "@nestjs/swagger";
import { TipoCategoria } from "@financeiro/categorias/domain/models/tipo-categoria.enum";
import type { Categoria } from "@financeiro/categorias/domain/models/categoria.entity";

export class CategoriaDto {
  @ApiProperty({ example: "uuid-aqui" })
  id!: string;

  @ApiProperty({ example: "Mensalidades" })
  nome!: string;

  @ApiProperty({ enum: TipoCategoria, example: TipoCategoria.RECEITA })
  tipo!: TipoCategoria;

  @ApiProperty({ example: "uuid-atletica" })
  atleticaId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromCategoria(cat: Categoria | null): CategoriaDto | null {
    if (!cat) return null;
    const dto = new CategoriaDto();
    dto.id = cat.id!;
    dto.nome = cat.nome;
    dto.tipo = cat.tipo;
    dto.atleticaId = cat.atleticaId;
    dto.createdAt = cat.createdAt!;
    dto.updatedAt = cat.updatedAt!;
    return dto;
  }
}
