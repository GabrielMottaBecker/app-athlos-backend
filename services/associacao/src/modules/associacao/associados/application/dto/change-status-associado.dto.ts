import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsNotEmpty } from "class-validator";
import { StatusAssociado } from "@associacao/associados/domain/models/associado.entity";

export class ChangeStatusAssociadoDto {
  @ApiProperty({ enum: StatusAssociado, example: StatusAssociado.INATIVO })
  @IsEnum(StatusAssociado)
  @IsNotEmpty()
  status!: StatusAssociado;
}
