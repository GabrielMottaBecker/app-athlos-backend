import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEnum, IsOptional, IsString } from "class-validator";
import { TipoCargo } from "@hierarquia/domain/models/tipo-cargo.enum";

export class UpdateCargoDto {
  @ApiPropertyOptional({ example: "Vice-Presidente" })
  @IsString()
  @IsOptional()
  nome?: string;

  @ApiPropertyOptional({ enum: TipoCargo })
  @IsEnum(TipoCargo)
  @IsOptional()
  tipo?: TipoCargo;
}
