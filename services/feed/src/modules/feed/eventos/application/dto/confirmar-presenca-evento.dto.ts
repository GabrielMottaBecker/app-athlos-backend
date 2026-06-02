import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, IsUUID } from "class-validator";

export class ConfirmarPresencaEventoDto {
  @ApiPropertyOptional({
    example: "00000000-0000-0000-0000-000000000001",
    description: "Quando omitido, usa o usuario autenticado.",
  })
  @IsUUID()
  @IsOptional()
  usuarioId?: string;
}
