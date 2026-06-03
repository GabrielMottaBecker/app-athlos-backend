import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ArrayMinSize, IsArray, IsInt, IsNotEmpty, IsOptional, IsPositive, IsString, IsUUID, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ItemCarrinhoDto {
  @ApiProperty({ example: "uuid-produto" })
  @IsUUID()
  @IsNotEmpty()
  produtoId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  quantidade!: number;
}

export class CarrinhoInputDto {
  @ApiProperty({ example: "5544999999999", description: "Número WhatsApp da atlética (com DDD e código do país, sem símbolos)" })
  @IsString()
  @IsNotEmpty()
  whatsappNumero!: string;

  @ApiProperty({ example: "uuid-atletica" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;

  @ApiProperty({ type: [ItemCarrinhoDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemCarrinhoDto)
  itens!: ItemCarrinhoDto[];

  @ApiPropertyOptional({ example: "Quero retirar na sede" })
  @IsString()
  @IsOptional()
  observacao?: string;
}
