import { ApiProperty } from "@nestjs/swagger";

export class VerificarAssociadoResponseDto {
  @ApiProperty({ description: "Token de sessão de ativação, válido por 10 minutos" })
  tokenSessao!: string;

  @ApiProperty({ example: "João Silva", description: "Nome do membro, para exibir na tela de definir senha" })
  nome!: string;
}