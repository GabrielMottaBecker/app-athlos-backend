import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsHexColor, IsNotEmpty, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateAtleticaDto {
  @ApiProperty({ example: "Pantheon Nexgen" })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: "Gabriel Breier" })
  @IsString()
  @IsNotEmpty()
  nomePresidente!: string;

  @ApiPropertyOptional({ example: "#2563EB" })
  @IsHexColor()
  @IsOptional()
  corPrimaria?: string;

  @ApiPropertyOptional({ example: "#F8FAFC" })
  @IsHexColor()
  @IsOptional()
  corFundo?: string;

  @ApiPropertyOptional({ example: "https://meusite.com/logo-atletica.png" })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}