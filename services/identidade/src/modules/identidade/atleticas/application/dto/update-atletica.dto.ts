import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsHexColor, IsOptional, IsString, IsUrl } from "class-validator";

export class UpdateAtleticaDto {
  @ApiPropertyOptional({ example: "Pantheon Nexgen 2026" })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ example: "Novo Presidente" })
  @IsString()
  @IsOptional()
  nomePresidente?: string;

  @ApiPropertyOptional({ example: "#7C3AED" })
  @IsHexColor()
  @IsOptional()
  corPrimaria?: string;

  @ApiPropertyOptional({ example: "#0F172A" })
  @IsHexColor()
  @IsOptional()
  corFundo?: string;

  @ApiPropertyOptional({ example: "https://meusite.com/logo-atletica.png" })
  @IsUrl()
  @IsOptional()
  logoUrl?: string;
}