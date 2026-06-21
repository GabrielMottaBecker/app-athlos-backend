import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class DefinirSenhaDto {
  @ApiProperty({ description: "Token de sessão recebido em /auth/verificar-associado" })
  @IsString()
  @IsNotEmpty()
  tokenSessao!: string;

  @ApiProperty({ example: "Senha@123", minLength: 8 })
  @IsString()
  @MinLength(8)
  senha!: string;
}