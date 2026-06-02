import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { UsuarioStatus } from "@identidade/usuarios/domain/models/usuario-status.enum";

export class ChangeStatusUsuarioDto {
  @ApiProperty({ enum: UsuarioStatus, example: UsuarioStatus.INATIVO })
  @IsEnum(UsuarioStatus)
  status!: UsuarioStatus;
}
