import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { StatusProduto } from "@lojinha/produtos/domain/models/status-produto.enum";
import type { Produto } from "@lojinha/produtos/domain/models/produto.entity";

export class ProdutoDto {
  @ApiProperty({ example: "uuid-aqui" })
  id!: string;

  @ApiProperty({ example: "Camiseta Atlética" })
  nome!: string;

  @ApiProperty({ example: "Camiseta oficial da atlética, 100% algodão" })
  descricao!: string;

  @ApiProperty({ example: 45.90 })
  preco!: number;

  @ApiProperty({ example: 100 })
  estoque!: number;

  @ApiProperty({ enum: StatusProduto, example: StatusProduto.DISPONIVEL })
  status!: StatusProduto;

  @ApiProperty({ example: "uuid-atletica" })
  atleticaId!: string;

  @ApiPropertyOptional({ example: "https://cdn.atletica.com/camiseta.png", nullable: true })
  imagemUrl?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromProduto(p: Produto | null): ProdutoDto | null {
    if (!p) return null;
    const dto = new ProdutoDto();
    dto.id = p.id!;
    dto.nome = p.nome;
    dto.descricao = p.descricao;
    dto.preco = p.preco;
    dto.estoque = p.estoque;
    dto.status = p.status;
    dto.atleticaId = p.atleticaId;
    dto.imagemUrl = p.imagemUrl ?? null;
    dto.createdAt = p.createdAt!;
    dto.updatedAt = p.updatedAt!;
    return dto;
  }
}
