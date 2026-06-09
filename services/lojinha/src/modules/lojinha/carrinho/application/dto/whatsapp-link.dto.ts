import { ApiProperty } from "@nestjs/swagger";

export class ItemResumoDto {
  @ApiProperty({ example: "Camiseta Atlética" })
  nome!: string;

  @ApiProperty({ example: 2 })
  quantidade!: number;

  @ApiProperty({ example: 45.90 })
  precoUnitario!: number;

  @ApiProperty({ example: 91.80 })
  subtotal!: number;
}

export class WhatsappLinkDto {
  @ApiProperty({ description: "Link direto para abrir o WhatsApp com a mensagem pré-preenchida" })
  url!: string;

  @ApiProperty({ description: "Mensagem formatada (para preview no front)" })
  mensagem!: string;

  @ApiProperty({ example: 127.70 })
  total!: number;

  @ApiProperty({ type: [ItemResumoDto] })
  itens!: ItemResumoDto[];
}
