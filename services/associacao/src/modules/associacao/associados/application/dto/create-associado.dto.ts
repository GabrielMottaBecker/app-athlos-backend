import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from "class-validator";

export class CreateAssociadoDto {
  @ApiProperty({ example: "João Silva" })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: "joao@atletica.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "123.456.789-00" })
  @IsString()
  @IsNotEmpty()
  documento!: string;

  @ApiProperty({ example: "(44) 99999-9999" })
  @IsString()
  @IsNotEmpty()
  telefone!: string;

  @ApiProperty({ example: "uuid-atletica" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  valorAssociacao!: number;

  @ApiPropertyOptional({ example: "uuid-cargo" })
  @IsUUID()
  @IsOptional()
  cargoId?: string;
}