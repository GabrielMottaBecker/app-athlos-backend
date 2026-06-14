import { CreateProdutoDto } from "@lojinha/produtos/application/dto/create-produto.dto";
import { UpdateProdutoDto } from "@lojinha/produtos/application/dto/update-produto.dto";
import { ProdutoDto } from "@lojinha/produtos/application/dto/produto.dto";
import { ProdutoMessagingService } from "@lojinha/produtos/application/services/produto-messaging.service";
import { Produto } from "@lojinha/produtos/domain/models/produto.entity";
import { StatusProduto } from "@lojinha/produtos/domain/models/status-produto.enum";
import {
  PRODUTO_REPOSITORY,
  type ProdutoRepository,
} from "@lojinha/produtos/domain/repositories/produto-repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class ProdutoService {
  constructor(
    @Inject(PRODUTO_REPOSITORY)
    private readonly produtoRepository: ProdutoRepository,
    private readonly messagingService: ProdutoMessagingService,
  ) {}

  async create(dto: CreateProdutoDto): Promise<void> {
    const produto = Produto.restore({
      nome: dto.nome,
      descricao: dto.descricao,
      preco: dto.preco,
      estoque: dto.estoque,
      status: dto.estoque > 0 ? StatusProduto.DISPONIVEL : StatusProduto.ESGOTADO,
      atleticaId: dto.atleticaId,
      imagemUrl: dto.imagemUrl ?? null,
    })!;

    await this.produtoRepository.create(produto);
  }

  async edit(id: string, dto: UpdateProdutoDto): Promise<void> {
    const produto = await this.produtoRepository.findById(id);
    if (!produto) throw new NotFoundException("Produto não encontrado");

    if (dto.nome) produto.withNome(dto.nome);
    if (dto.descricao) produto.withDescricao(dto.descricao);
    if (dto.preco !== undefined) produto.withPreco(dto.preco);
    if (dto.estoque !== undefined) produto.withEstoque(dto.estoque);
    if (dto.imagemUrl !== undefined) produto.withImagemUrl(dto.imagemUrl ?? null);

    await this.produtoRepository.update(produto);
    await this.messagingService.publishProdutoUpdated(ProdutoDto.fromProduto(produto)!);
  }

  async changeStatus(id: string, status: StatusProduto): Promise<void> {
    const produto = await this.produtoRepository.findById(id);
    if (!produto) throw new NotFoundException("Produto não encontrado");
    await this.produtoRepository.updateStatus(id, status);
  }

  async remove(id: string): Promise<void> {
    const produto = await this.produtoRepository.findById(id);
    if (!produto) throw new NotFoundException("Produto não encontrado");
    await this.produtoRepository.delete(id);
    await this.messagingService.publishProdutoDeleted(ProdutoDto.fromProduto(produto)!);
  }

  async findById(id: string): Promise<ProdutoDto | null> {
    return ProdutoDto.fromProduto(await this.produtoRepository.findById(id));
  }

  async findByAtletica(atleticaId: string): Promise<ProdutoDto[]> {
    const rows = await this.produtoRepository.findByAtletica(atleticaId);
    return rows.map((r) => ProdutoDto.fromProduto(r)!);
  }

  async listPaginated(params: PaginationParams): Promise<PaginatedResult<ProdutoDto>> {
    const { rows, total } = await this.produtoRepository.findAllPaginated(params);
    return {
      data: rows.map((r) => ProdutoDto.fromProduto(r)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }
}
