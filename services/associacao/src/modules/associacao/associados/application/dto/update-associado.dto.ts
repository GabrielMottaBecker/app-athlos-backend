import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString } from "class-validator";

export class UpdateAssociadoDto {
  @ApiPropertyOptional({ example: "João Silva Atualizado" })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ example: "joao.novo@atletica.com" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: "123.456.789-00" })
  @IsString()
  @IsOptional()
  documento?: string;

  @ApiPropertyOptional({ example: "(44) 98888-8888" })
  @IsString()
  @IsOptional()
  telefone?: string;
}
