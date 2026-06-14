import { CreateAssociadoDto } from "@associacao/associados/application/dto/create-associado.dto";
import { UpdateAssociadoDto } from "@associacao/associados/application/dto/update-associado.dto";
import { AssignCargoAssociadoDto } from "@associacao/associados/application/dto/assign-cargo-associado.dto";
import { AssociadoDto } from "@associacao/associados/application/dto/associado.dto";
import { AssociadoMessagingService } from "@associacao/associados/application/services/associado-messaging.service";
import { Associado, StatusAssociado } from "@associacao/associados/domain/models/associado.entity";
import {
  ASSOCIADO_REPOSITORY,
  type AssociadoRepository,
} from "@associacao/associados/domain/repositories/associado-repository.interface";
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class AssociadoService {
  constructor(
    @Inject(ASSOCIADO_REPOSITORY)
    private readonly associadoRepository: AssociadoRepository,
    private readonly messagingService: AssociadoMessagingService,
  ) {}

  async create(dto: CreateAssociadoDto): Promise<void> {
    const emailExistente = await this.associadoRepository.findByEmail(dto.email);
    if (emailExistente) {
      throw new ConflictException("E-mail já cadastrado");
    }

    const docExistente = await this.associadoRepository.findByDocumento(dto.documento);
    if (docExistente) {
      throw new ConflictException("Documento (CPF) já cadastrado");
    }

    const associado = Associado.restore({
      nome: dto.nome,
      email: dto.email,
      documento: dto.documento,
      telefone: dto.telefone,
      status: StatusAssociado.ATIVO,
      atleticaId: dto.atleticaId,
      taxaAthlos: 0,
    })!;

    associado.withValorAssociacao(dto.valorAssociacao);

    await this.associadoRepository.create(associado);

    const criado = await this.associadoRepository.findByEmail(dto.email);
    if (!criado) throw new NotFoundException("Associado criado não encontrado");

    // Atribui cargo se informado
    if (dto.cargoId && criado.id) {
      await this.associadoRepository.assignCargo(criado.id, dto.cargoId);
    }

    await this.messagingService.publishAssociadoCreated(
      AssociadoDto.fromAssociado(criado)!,
    );
  }

  async edit(id: string, dto: UpdateAssociadoDto): Promise<void> {
    const associado = await this.associadoRepository.findById(id);
    if (!associado) throw new NotFoundException("Associado não encontrado");

    if (dto.email && dto.email !== associado.email) {
      const existente = await this.associadoRepository.findByEmail(dto.email);
      if (existente) throw new ConflictException("E-mail já cadastrado");
    }

    if (dto.documento && dto.documento !== associado.documento) {
      const existente = await this.associadoRepository.findByDocumento(dto.documento);
      if (existente) throw new ConflictException("Documento já cadastrado");
    }

    if (dto.nome) associado.withNome(dto.nome);
    if (dto.email) associado.withEmail(dto.email);
    if (dto.documento) associado.withDocumento(dto.documento);
    if (dto.telefone) associado.withTelefone(dto.telefone);

    await this.associadoRepository.update(associado);
    await this.messagingService.publishAssociadoUpdated(
      AssociadoDto.fromAssociado(associado)!,
    );
  }

  async changeStatus(id: string, status: StatusAssociado): Promise<void> {
    const associado = await this.associadoRepository.findById(id);
    if (!associado) throw new NotFoundException("Associado não encontrado");

    await this.associadoRepository.updateStatus(id, status);
    associado.withStatus(status);

    await this.messagingService.publishStatusChanged(
      AssociadoDto.fromAssociado(associado)!,
    );
  }

  async remove(id: string): Promise<void> {
    const associado = await this.associadoRepository.findById(id);
    if (!associado) throw new NotFoundException("Associado não encontrado");

    await this.associadoRepository.delete(id);
    await this.messagingService.publishAssociadoDeleted(
      AssociadoDto.fromAssociado(associado)!,
    );
  }

  async listPaginated(
    params: PaginationParams,
  ): Promise<PaginatedResult<AssociadoDto>> {
    const { rows, total } =
      await this.associadoRepository.findAllPaginated(params);
    return {
      data: rows.map((row) => AssociadoDto.fromAssociado(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<AssociadoDto | null> {
    const associado = await this.associadoRepository.findById(id);
    return AssociadoDto.fromAssociado(associado);
  }

  async findByAtletica(atleticaId: string): Promise<AssociadoDto[]> {
    const rows = await this.associadoRepository.findByAtletica(atleticaId);
    return rows.map((row) => AssociadoDto.fromAssociado(row)!);
  }

  async assignCargo(id: string, dto: AssignCargoAssociadoDto): Promise<void> {
    const associado = await this.associadoRepository.findById(id);
    if (!associado) throw new NotFoundException("Associado não encontrado");

    await this.associadoRepository.assignCargo(id, dto.cargoId ?? null);
  }
}
