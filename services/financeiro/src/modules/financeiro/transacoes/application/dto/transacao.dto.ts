import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { TipoTransacao } from "@financeiro/transacoes/domain/models/tipo-transacao.enum";
import type { Transacao } from "@financeiro/transacoes/domain/models/transacao.entity";

export class TransacaoDto {
  @ApiProperty({ example: "uuid-aqui" })
  id!: string;

  @ApiProperty({ example: "Arrecadação campeonato" })
  descricao!: string;

  @ApiProperty({ example: 500.00 })
  valor!: number;

  @ApiProperty({ enum: TipoTransacao, example: TipoTransacao.RECEITA })
  tipo!: TipoTransacao;

  @ApiProperty({ example: "uuid-categoria" })
  categoriaId!: string;

  @ApiProperty({ example: "uuid-atletica" })
  atleticaId!: string;

  @ApiProperty({ example: "2026-01-15" })
  dataTransacao!: Date;

  @ApiPropertyOptional({ example: "Campeonato universitário", nullable: true })
  observacao?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromTransacao(t: Transacao | null): TransacaoDto | null {
    if (!t) return null;
    const dto = new TransacaoDto();
    dto.id = t.id!;
    dto.descricao = t.descricao;
    dto.valor = t.valor;
    dto.tipo = t.tipo;
    dto.categoriaId = t.categoriaId;
    dto.atleticaId = t.atleticaId;
    dto.dataTransacao = t.dataTransacao;
    dto.observacao = t.observacao ?? null;
    dto.createdAt = t.createdAt!;
    dto.updatedAt = t.updatedAt!;
    return dto;
  }
}
