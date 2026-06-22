import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class AtleticaDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  nome!: string;

  @ApiProperty()
  nomePresidente!: string;

  @ApiPropertyOptional()
  corPrimaria?: string | null;

  @ApiPropertyOptional()
  corFundo?: string | null;

  @ApiPropertyOptional()
  logoUrl?: string | null;

  @ApiProperty({ enum: ["ATIVO", "INATIVO"], default: "ATIVO" })
  status!: string;

  @ApiProperty()
  criadoEm!: string;
}