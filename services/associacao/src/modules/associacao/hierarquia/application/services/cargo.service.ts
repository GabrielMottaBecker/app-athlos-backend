import { CreateCargoDto } from "@hierarquia/application/dto/create-cargo.dto";
import { UpdateCargoDto } from "@hierarquia/application/dto/update-cargo.dto";
import { CargoDto } from "@hierarquia/application/dto/cargo.dto";
import { Cargo } from "@hierarquia/domain/models/cargo.entity";
import {
  CARGO_REPOSITORY,
  type CargoRepository,
} from "@hierarquia/domain/repositories/cargo-repository.interface";
import {
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class CargoService {
  constructor(
    @Inject(CARGO_REPOSITORY)
    private readonly cargoRepository: CargoRepository,
  ) {}

  async create(dto: CreateCargoDto): Promise<void> {
    const cargo = Cargo.restore({
      nome: dto.nome,
      tipo: dto.tipo,
      atleticaId: dto.atleticaId,
    })!;

    await this.cargoRepository.create(cargo);
  }

  async edit(id: string, dto: UpdateCargoDto): Promise<void> {
    const cargo = await this.cargoRepository.findById(id);
    if (!cargo) throw new NotFoundException("Cargo não encontrado");

    if (dto.nome) cargo.withNome(dto.nome);
    if (dto.tipo) cargo.withTipo(dto.tipo);

    await this.cargoRepository.update(cargo);
  }

  async remove(id: string): Promise<void> {
    const cargo = await this.cargoRepository.findById(id);
    if (!cargo) throw new NotFoundException("Cargo não encontrado");

    await this.cargoRepository.delete(id);
  }

  async listPaginated(params: PaginationParams): Promise<PaginatedResult<CargoDto>> {
    const { rows, total } = await this.cargoRepository.findAllPaginated(params);
    return {
      data: rows.map((row) => CargoDto.fromCargo(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<CargoDto | null> {
    const cargo = await this.cargoRepository.findById(id);
    return CargoDto.fromCargo(cargo);
  }

  async findByAtletica(atleticaId: string): Promise<CargoDto[]> {
    const rows = await this.cargoRepository.findByAtletica(atleticaId);
    return rows.map((row) => CargoDto.fromCargo(row)!);
  }
}
