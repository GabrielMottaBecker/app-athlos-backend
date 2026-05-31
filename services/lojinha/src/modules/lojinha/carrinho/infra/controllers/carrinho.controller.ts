import { CarrinhoInputDto } from "@lojinha/carrinho/application/dto/carrinho-input.dto";
import { WhatsappLinkDto } from "@lojinha/carrinho/application/dto/whatsapp-link.dto";
import { CarrinhoService } from "@lojinha/carrinho/application/services/carrinho.service";
import { Body, Controller, Post } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";

@ApiTags("carrinho")
@ApiBearerAuth()
@Controller("carrinho")
export class CarrinhoController {
  constructor(private readonly carrinhoService: CarrinhoService) {}

  @Post("whatsapp")
  @RequirePermissions(Permission.LOJINHA_READ)
  @ApiOperation({
    summary: "Gerar link do WhatsApp com o carrinho formatado",
    description: "Valida os produtos e o estoque, monta a mensagem e retorna o link wa.me pronto para abrir no front.",
  })
  @ApiBadRequestResponse({ description: "Estoque insuficiente para algum produto" })
  @ApiNotFoundResponse({ description: "Produto não encontrado" })
  async gerarLink(@Body() body: CarrinhoInputDto): Promise<WhatsappLinkDto> {
    return this.carrinhoService.gerarLinkWhatsapp(body);
  }
}
