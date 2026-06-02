import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import type { Associado } from "@associacao/associados/domain/models/associado.entity";
import { StatusAssociado } from "@associacao/associados/domain/models/associado.entity";

export class AssociadoDto {
  @ApiProperty({ example: "uuid-aqui" })
  id!: string;

  @ApiProperty({ example: "João Silva" })
  nome!: string;

  @ApiProperty({ example: "joao@atletica.com" })
  email!: string;

  @ApiProperty({ example: "123.456.789-00" })
  documento!: string;

  @ApiProperty({ example: "(44) 99999-9999" })
  telefone!: string;

  @ApiProperty({ enum: StatusAssociado, example: StatusAssociado.ATIVO })
  status!: StatusAssociado;

  @ApiProperty({ example: "uuid-atletica" })
  atleticaId!: string;

  @ApiProperty({ example: 2.5, description: "Taxa de 0,5% sobre o valor de associação" })
  taxaAthlos!: number;

  @ApiPropertyOptional({ example: "uuid-cargo", nullable: true, description: "ID do cargo atribuído ao associado" })
  cargoId?: string | null;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromAssociado(associado: Associado | null): AssociadoDto | null {
    if (!associado) return null;

    const dto = new AssociadoDto();
    dto.id = associado.id!;
    dto.nome = associado.nome;
    dto.email = associado.email;
    dto.documento = associado.documento;
    dto.telefone = associado.telefone;
    dto.status = associado.status;
    dto.atleticaId = associado.atleticaId;
    dto.taxaAthlos = associado.taxaAthlos;
    dto.cargoId = associado.cargoId ?? null;
    dto.createdAt = associado.createdAt!;
    dto.updatedAt = associado.updatedAt!;
    return dto;
  }
}
