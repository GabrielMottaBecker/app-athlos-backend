import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString, IsUrl, Min } from "class-validator";

export class UpdateProdutoDto {
  @ApiPropertyOptional({ example: "Boné Atlética" })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ example: "Boné bordado com logo da atlética" })
  @IsString()
  @IsOptional()
  descricao?: string;

  @ApiPropertyOptional({ example: 35.90 })
  @IsNumber()
  @Min(0.01)
  @IsOptional()
  preco?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @Min(0)
  @IsOptional()
  estoque?: number;

  @ApiPropertyOptional({ example: "https://cdn.atletica.com/bone.png" })
  @IsUrl()
  @IsOptional()
  imagemUrl?: string;
}
