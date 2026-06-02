import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, IsUUID, Min } from "class-validator";

export class CreateProdutoDto {
  @ApiProperty({ example: "Camiseta Atlética" })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: "Camiseta oficial da atlética, 100% algodão" })
  @IsString()
  @IsNotEmpty()
  descricao!: string;

  @ApiProperty({ example: 45.90, description: "Preço em reais" })
  @IsNumber()
  @Min(0.01)
  preco!: number;

  @ApiProperty({ example: 100, description: "Quantidade em estoque" })
  @IsNumber()
  @Min(0)
  estoque!: number;

  @ApiProperty({ example: "uuid-atletica" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;

  @ApiPropertyOptional({ example: "https://cdn.atletica.com/camiseta.png" })
  @IsUrl()
  @IsOptional()
  imagemUrl?: string;
}
