import { ApiProperty } from "@nestjs/swagger";

export class AuthResponseDto {
  @ApiProperty({ description: "JWT de curta duração para autenticação" })
  accessToken!: string;

  @ApiProperty({ description: "Token de renovação (30 dias)" })
  refreshToken!: string;
}
