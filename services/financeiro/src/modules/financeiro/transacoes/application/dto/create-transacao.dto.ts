import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";
import { TipoTransacao } from "@financeiro/transacoes/domain/models/tipo-transacao.enum";

export class CreateTransacaoDto {
  @ApiProperty({ example: "Arrecadação campeonato" })
  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @ApiProperty({ example: 500.00, description: "Valor em reais" })
  @IsNumber()
  @Min(0.01)
  valor!: number;

  @ApiProperty({ enum: TipoTransacao, example: TipoTransacao.RECEITA })
  @IsEnum(TipoTransacao)
  tipo!: TipoTransacao;

  @ApiProperty({ example: "uuid-categoria" })
  @IsUUID()
  @IsNotEmpty()
  categoriaId!: string;

  @ApiProperty({ example: "uuid-atletica" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;

  @ApiProperty({ example: "2026-01-15", description: "Data da transação (ISO 8601)" })
  @IsDateString()
  dataTransacao!: string;

  @ApiPropertyOptional({ example: "Campeonato universitário" })
  @IsString()
  @IsOptional()
  observacao?: string;
}
