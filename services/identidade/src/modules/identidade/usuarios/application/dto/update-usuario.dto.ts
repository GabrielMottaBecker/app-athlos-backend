import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { UsuarioRole } from "@identidade/usuarios/domain/models/usuario-role.enum";

export class UpdateUsuarioDto {
  @ApiPropertyOptional({ example: "Maria Gestora Atualizada" })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ example: "maria.nova@atletica.com" })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: "NovaSenha@456", minLength: 8 })
  @IsString()
  @MinLength(8)
  @IsOptional()
  senha?: string;

  @ApiPropertyOptional({ enum: UsuarioRole })
  @IsEnum(UsuarioRole)
  @IsOptional()
  role?: UsuarioRole;
}
