import { CarrinhoInputDto } from "@lojinha/carrinho/application/dto/carrinho-input.dto";
import { ItemResumoDto, WhatsappLinkDto } from "@lojinha/carrinho/application/dto/whatsapp-link.dto";
import { ProdutoService } from "@lojinha/produtos/application/services/produto.service";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";

@Injectable()
export class CarrinhoService {
  constructor(private readonly produtoService: ProdutoService) {}

  async gerarLinkWhatsapp(dto: CarrinhoInputDto): Promise<WhatsappLinkDto> {
    const itensResumo: ItemResumoDto[] = [];

    for (const item of dto.itens) {
      const produto = await this.produtoService.findById(item.produtoId);

      if (!produto) {
        throw new NotFoundException(`Produto ${item.produtoId} não encontrado`);
      }

      if (produto.estoque < item.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para "${produto.nome}" (disponível: ${produto.estoque})`,
        );
      }

      itensResumo.push({
        nome: produto.nome,
        quantidade: item.quantidade,
        precoUnitario: produto.preco,
        subtotal: Number((produto.preco * item.quantidade).toFixed(2)),
      });
    }

    const total = Number(
      itensResumo.reduce((sum, i) => sum + i.subtotal, 0).toFixed(2),
    );

    const mensagem = this.formatarMensagem(itensResumo, total, dto.observacao);
    const url = `https://wa.me/${dto.whatsappNumero}?text=${encodeURIComponent(mensagem)}`;

    return { url, mensagem, total, itens: itensResumo };
  }

  private formatarMensagem(
    itens: ItemResumoDto[],
    total: number,
    observacao?: string,
  ): string {
    const linhasItens = itens
      .map(
        (i) =>
          `• ${i.quantidade}x ${i.nome} — R$ ${i.precoUnitario.toFixed(2)} cada (R$ ${i.subtotal.toFixed(2)})`,
      )
      .join("\n");

    const obs = observacao ? `\n\nObservação: ${observacao}` : "";

    return (
      `Olá! Gostaria de fazer o seguinte pedido:\n\n` +
      `${linhasItens}\n\n` +
      `*Total: R$ ${total.toFixed(2)}*` +
      obs +
      `\n\nAguardo confirmação!`
    );
  }
}
