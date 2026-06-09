import { CreateCategoriaDto } from "@financeiro/categorias/application/dto/create-categoria.dto";
import { UpdateCategoriaDto } from "@financeiro/categorias/application/dto/update-categoria.dto";
import { CategoriaDto } from "@financeiro/categorias/application/dto/categoria.dto";
import { Categoria } from "@financeiro/categorias/domain/models/categoria.entity";
import {
  CATEGORIA_REPOSITORY,
  type CategoriaRepository,
} from "@financeiro/categorias/domain/repositories/categoria-repository.interface";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";

@Injectable()
export class CategoriaService {
  constructor(
    @Inject(CATEGORIA_REPOSITORY)
    private readonly categoriaRepository: CategoriaRepository,
  ) {}

  async create(dto: CreateCategoriaDto): Promise<void> {
    const categoria = Categoria.restore({
      nome: dto.nome,
      tipo: dto.tipo,
      atleticaId: dto.atleticaId,
    })!;
    await this.categoriaRepository.create(categoria);
  }

  async edit(id: string, dto: UpdateCategoriaDto): Promise<void> {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) throw new NotFoundException("Categoria não encontrada");
    if (dto.nome) categoria.withNome(dto.nome);
    if (dto.tipo) categoria.withTipo(dto.tipo);
    await this.categoriaRepository.update(categoria);
  }

  async remove(id: string): Promise<void> {
    const categoria = await this.categoriaRepository.findById(id);
    if (!categoria) throw new NotFoundException("Categoria não encontrada");
    await this.categoriaRepository.delete(id);
  }

  async findById(id: string): Promise<CategoriaDto | null> {
    return CategoriaDto.fromCategoria(await this.categoriaRepository.findById(id));
  }

  async findByAtletica(atleticaId: string): Promise<CategoriaDto[]> {
    const rows = await this.categoriaRepository.findByAtletica(atleticaId);
    return rows.map((r) => CategoriaDto.fromCategoria(r)!);
  }

  async listPaginated(params: PaginationParams): Promise<PaginatedResult<CategoriaDto>> {
    const { rows, total } = await this.categoriaRepository.findAllPaginated(params);
    return {
      data: rows.map((r) => CategoriaDto.fromCategoria(r)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }
}
