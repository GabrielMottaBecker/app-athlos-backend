import { CreateTransacaoDto } from "@financeiro/transacoes/application/dto/create-transacao.dto";
import { UpdateTransacaoDto } from "@financeiro/transacoes/application/dto/update-transacao.dto";
import { TransacaoDto } from "@financeiro/transacoes/application/dto/transacao.dto";
import { TransacaoMessagingService } from "@financeiro/transacoes/application/services/transacao-messaging.service";
import { Transacao } from "@financeiro/transacoes/domain/models/transacao.entity";
import {
  TRANSACAO_REPOSITORY,
  type TransacaoRepository,
} from "@financeiro/transacoes/domain/repositories/transacao-repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class TransacaoService {
  constructor(
    @Inject(TRANSACAO_REPOSITORY)
    private readonly transacaoRepository: TransacaoRepository,
    private readonly messagingService: TransacaoMessagingService,
  ) {}

  async create(dto: CreateTransacaoDto): Promise<void> {
    const transacao = Transacao.restore({
      descricao: dto.descricao,
      valor: dto.valor,
      tipo: dto.tipo,
      categoriaId: dto.categoriaId,
      atleticaId: dto.atleticaId,
      dataTransacao: new Date(dto.dataTransacao),
      observacao: dto.observacao ?? null,
    })!;

    await this.transacaoRepository.create(transacao);

    const criada = await this.transacaoRepository.findById(transacao.id ?? "");
    if (criada) {
      await this.messagingService.publishTransacaoCreated(TransacaoDto.fromTransacao(criada)!);
    }
  }

  async edit(id: string, dto: UpdateTransacaoDto): Promise<void> {
    const transacao = await this.transacaoRepository.findById(id);
    if (!transacao) throw new NotFoundException("Transação não encontrada");

    if (dto.descricao) transacao.withDescricao(dto.descricao);
    if (dto.valor !== undefined) transacao.withValor(dto.valor);
    if (dto.observacao !== undefined) transacao.withObservacao(dto.observacao ?? null);

    await this.transacaoRepository.update(transacao);
    await this.messagingService.publishTransacaoUpdated(TransacaoDto.fromTransacao(transacao)!);
  }

  async remove(id: string): Promise<void> {
    const transacao = await this.transacaoRepository.findById(id);
    if (!transacao) throw new NotFoundException("Transação não encontrada");
    await this.transacaoRepository.delete(id);
    await this.messagingService.publishTransacaoDeleted(TransacaoDto.fromTransacao(transacao)!);
  }

  async findById(id: string): Promise<TransacaoDto | null> {
    return TransacaoDto.fromTransacao(await this.transacaoRepository.findById(id));
  }

  async findByAtletica(atleticaId: string): Promise<TransacaoDto[]> {
    const rows = await this.transacaoRepository.findByAtletica(atleticaId);
    return rows.map((r) => TransacaoDto.fromTransacao(r)!);
  }

  async listPaginated(params: PaginationParams): Promise<PaginatedResult<TransacaoDto>> {
    const { rows, total } = await this.transacaoRepository.findAllPaginated(params);
    return {
      data: rows.map((r) => TransacaoDto.fromTransacao(r)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }
}
