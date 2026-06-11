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

  @ApiProperty()
  criadoEm!: string;
}