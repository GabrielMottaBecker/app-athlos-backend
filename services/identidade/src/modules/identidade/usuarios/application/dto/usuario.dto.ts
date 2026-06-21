import { ApiProperty } from "@nestjs/swagger";
import { UsuarioRole } from "@identidade/usuarios/domain/models/usuario-role.enum";
import { UsuarioStatus } from "@identidade/usuarios/domain/models/usuario-status.enum";
import type { Usuario } from "@identidade/usuarios/domain/models/usuario.entity";

export class UsuarioDto {
  @ApiProperty({ example: "uuid-aqui" })
  id!: string;

  @ApiProperty({ example: "Maria Gestora" })
  nome!: string;

  @ApiProperty({ example: "maria@atletica.com" })
  email!: string;

  @ApiProperty({ enum: UsuarioRole, example: UsuarioRole.ADMINISTRADOR })
  role!: UsuarioRole;

  @ApiProperty({ enum: UsuarioStatus, example: UsuarioStatus.ATIVO })
  status!: UsuarioStatus;

  @ApiProperty({ example: "http://localhost:4002/uploads/usuarios/uuid.jpg", nullable: true })
  fotoUrl?: string | null;

  @ApiProperty({ example: "uuid-atletica" })
  atleticaId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromUsuario(usuario: Usuario | null): UsuarioDto | null {
    if (!usuario) return null;

    const dto = new UsuarioDto();
    dto.id = usuario.id!;
    dto.nome = usuario.nome;
    dto.email = usuario.email;
    dto.role = usuario.role;
    dto.status = usuario.status;
    dto.fotoUrl = usuario.fotoUrl ?? null;
    dto.atleticaId = usuario.atleticaId;
    dto.createdAt = usuario.createdAt!;
    dto.updatedAt = usuario.updatedAt!;
    return dto;
  }
}