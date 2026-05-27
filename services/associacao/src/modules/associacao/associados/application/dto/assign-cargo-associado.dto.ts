import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class AssignCargoAssociadoDto {
  @ApiPropertyOptional({
    example: "uuid-cargo",
    nullable: true,
    description: "ID do cargo a atribuir. Omita ou envie null para remover o cargo.",
  })
  @IsUUID()
  @IsOptional()
  cargoId?: string | null;
}
