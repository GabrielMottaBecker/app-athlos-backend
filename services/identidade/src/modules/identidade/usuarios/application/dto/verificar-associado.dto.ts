import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class VerificarAssociadoDto {
  @ApiProperty({ example: "joao@atletica.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "(44) 99999-9999" })
  @IsString()
  @IsNotEmpty()
  telefone!: string;
}