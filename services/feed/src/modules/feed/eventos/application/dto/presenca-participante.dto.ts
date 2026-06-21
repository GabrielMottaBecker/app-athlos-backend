import type { PresencaEvento } from "@feed/eventos/domain/models/presenca-evento.entity";
import { ApiProperty } from "@nestjs/swagger";

export class PresencaParticipanteDto {
  @ApiProperty({ example: "uuid-do-usuario" })
  usuarioId!: string;

  @ApiProperty({ example: "joao@exemplo.com" })
  email!: string;

  @ApiProperty()
  confirmadoEm!: Date;

  static fromPresenca(presenca: PresencaEvento): PresencaParticipanteDto {
    const dto = new PresencaParticipanteDto();
    dto.usuarioId = presenca.usuarioId;
    dto.email = presenca.email;
    dto.confirmadoEm = presenca.createdAt!;
    return dto;
  }
}