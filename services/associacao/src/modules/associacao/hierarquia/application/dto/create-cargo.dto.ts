import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty, IsString, IsUUID } from "class-validator";
import { TipoCargo } from "@hierarquia/domain/models/tipo-cargo.enum";

export class CreateCargoDto {
  @ApiProperty({ example: "Presidente" })
  @IsString()
  @IsNotEmpty()
  nome!: string;

  @ApiProperty({ enum: TipoCargo, example: TipoCargo.ADMINISTRADOR })
  @IsEnum(TipoCargo)
  tipo!: TipoCargo;

  @ApiProperty({ example: "uuid-atletica", description: "ID da Atlética" })
  @IsUUID()
  @IsNotEmpty()
  atleticaId!: string;
}
