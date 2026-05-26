import { ApiProperty } from "@nestjs/swagger";
import { TipoCargo } from "@hierarquia/domain/models/tipo-cargo.enum";
import type { Cargo } from "@hierarquia/domain/models/cargo.entity";

export class CargoDto {
  @ApiProperty({ example: "uuid-aqui" })
  id!: string;

  @ApiProperty({ example: "Presidente" })
  nome!: string;

  @ApiProperty({ enum: TipoCargo, example: TipoCargo.ADMINISTRADOR })
  tipo!: TipoCargo;

  @ApiProperty({ example: "uuid-atletica" })
  atleticaId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  static fromCargo(cargo: Cargo | null): CargoDto | null {
    if (!cargo) return null;

    const dto = new CargoDto();
    dto.id = cargo.id!;
    dto.nome = cargo.nome;
    dto.tipo = cargo.tipo;
    dto.atleticaId = cargo.atleticaId;
    dto.createdAt = cargo.createdAt!;
    dto.updatedAt = cargo.updatedAt!;
    return dto;
  }
}
