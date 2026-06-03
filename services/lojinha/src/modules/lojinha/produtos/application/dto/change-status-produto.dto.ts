import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { StatusProduto } from "@lojinha/produtos/domain/models/status-produto.enum";

export class ChangeStatusProdutoDto {
  @ApiProperty({ enum: StatusProduto, example: StatusProduto.INATIVO })
  @IsEnum(StatusProduto)
  status!: StatusProduto;
}
