import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from "class-validator";

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

  @ApiProperty({ example: "uuid-atletica", description: "ID da Atlética" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;

  @ApiProperty({ example: 500, description: "Valor da mensalidade de associação (a taxa de 0,5% será calculada automaticamente)" })
  @IsNumber()
  @Min(0)
  valorAssociacao!: number;
}
