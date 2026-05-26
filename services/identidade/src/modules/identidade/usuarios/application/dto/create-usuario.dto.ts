import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID, MinLength } from "class-validator";
import { UsuarioRole } from "@identidade/usuarios/domain/models/usuario-role.enum";

export class CreateUsuarioDto {
  @ApiProperty({ example: "Maria Gestora" })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ example: "maria@atletica.com" })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({ example: "Senha@123", minLength: 8 })
  @IsString()
  @MinLength(8)
  senha!: string;

  @ApiProperty({ enum: UsuarioRole, example: UsuarioRole.ADMINISTRADOR })
  @IsEnum(UsuarioRole)
  role!: UsuarioRole;

  @ApiProperty({ example: "uuid-atletica", description: "ID da Atlética" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;
}
