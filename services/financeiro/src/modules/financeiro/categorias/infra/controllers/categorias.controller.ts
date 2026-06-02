import { CreateCategoriaDto } from "@financeiro/categorias/application/dto/create-categoria.dto";
import { UpdateCategoriaDto } from "@financeiro/categorias/application/dto/update-categoria.dto";
import { CategoriaDto } from "@financeiro/categorias/application/dto/categoria.dto";
import { CategoriaService } from "@financeiro/categorias/application/services/categoria.service";
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { HateoasItem, HateoasList } from "@shared/infra/hateoas";

@ApiTags("categorias")
@ApiBearerAuth()
@Controller("categorias")
export class CategoriasController {
  constructor(private readonly categoriaService: CategoriaService) {}

  @Get()
  @RequirePermissions(Permission.FINANCEIRO_READ)
  @ApiOperation({ summary: "Listar categorias (paginado)" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<CategoriaDto>({
    basePath: "/v1/categorias",
    itemLinks: (item) => ({
      self: { href: `/v1/categorias/${item.id}`, method: "GET" },
      update: { href: `/v1/categorias/${item.id}`, method: "PUT" },
      delete: { href: `/v1/categorias/${item.id}`, method: "DELETE" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.categoriaService.listPaginated({ page, limit });
  }

  @Get("atletica/:atleticaId")
  @RequirePermissions(Permission.FINANCEIRO_READ)
  @ApiOperation({ summary: "Listar categorias de uma Atlética" })
  async findByAtletica(@Param("atleticaId") atleticaId: string): Promise<CategoriaDto[]> {
    return this.categoriaService.findByAtletica(atleticaId);
  }

  @Get(":id")
  @RequirePermissions(Permission.FINANCEIRO_READ)
  @ApiOperation({ summary: "Buscar categoria por ID" })
  @ApiNotFoundResponse({ description: "Categoria não encontrada" })
  @HateoasItem<CategoriaDto>({
    basePath: "/v1/categorias",
    itemLinks: (item) => ({
      self: { href: `/v1/categorias/${item.id}`, method: "GET" },
      update: { href: `/v1/categorias/${item.id}`, method: "PUT" },
      delete: { href: `/v1/categorias/${item.id}`, method: "DELETE" },
      list: { href: "/v1/categorias", method: "GET" },
    }),
  })
  async findById(@Param("id") id: string): Promise<CategoriaDto | null> {
    return this.categoriaService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.FINANCEIRO_WRITE)
  @ApiOperation({ summary: "Criar categoria" })
  async create(@Body() body: CreateCategoriaDto): Promise<void> {
    return this.categoriaService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.FINANCEIRO_WRITE)
  @ApiOperation({ summary: "Atualizar categoria" })
  @ApiNoContentResponse({ description: "Categoria atualizada" })
  @ApiNotFoundResponse({ description: "Categoria não encontrada" })
  async update(@Param("id") id: string, @Body() body: UpdateCategoriaDto): Promise<void> {
    return this.categoriaService.edit(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.FINANCEIRO_DELETE)
  @ApiOperation({ summary: "Remover categoria" })
  @ApiNoContentResponse({ description: "Categoria removida" })
  @ApiNotFoundResponse({ description: "Categoria não encontrada" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.categoriaService.remove(id);
  }
}
