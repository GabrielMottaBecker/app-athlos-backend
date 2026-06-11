import { CreateProdutoDto } from "@lojinha/produtos/application/dto/create-produto.dto";
import { UpdateProdutoDto } from "@lojinha/produtos/application/dto/update-produto.dto";
import { ChangeStatusProdutoDto } from "@lojinha/produtos/application/dto/change-status-produto.dto";
import { ProdutoDto } from "@lojinha/produtos/application/dto/produto.dto";
import { ProdutoService } from "@lojinha/produtos/application/services/produto.service";
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
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

@ApiTags("produtos")
@ApiBearerAuth()
@Controller("produtos")
export class ProdutosController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get()
  @RequirePermissions(Permission.LOJINHA_READ)
  @ApiOperation({ summary: "Listar produtos (paginado)" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<ProdutoDto>({
    basePath: "/v1/produtos",
    itemLinks: (item) => ({
      self: { href: `/v1/produtos/${item.id}`, method: "GET" },
      update: { href: `/v1/produtos/${item.id}`, method: "PUT" },
      status: { href: `/v1/produtos/${item.id}/status`, method: "PATCH" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.produtoService.listPaginated({ page, limit });
  }

  @Get("atletica/:atleticaId")
  @RequirePermissions(Permission.LOJINHA_READ)
  @ApiOperation({ summary: "Listar produtos de uma Atlética" })
  async findByAtletica(@Param("atleticaId") atleticaId: string): Promise<ProdutoDto[]> {
    return this.produtoService.findByAtletica(atleticaId);
  }

  @Get(":id")
  @RequirePermissions(Permission.LOJINHA_READ)
  @ApiOperation({ summary: "Buscar produto por ID" })
  @ApiNotFoundResponse({ description: "Produto não encontrado" })
  @HateoasItem<ProdutoDto>({
    basePath: "/v1/produtos",
    itemLinks: (item) => ({
      self: { href: `/v1/produtos/${item.id}`, method: "GET" },
      update: { href: `/v1/produtos/${item.id}`, method: "PUT" },
      status: { href: `/v1/produtos/${item.id}/status`, method: "PATCH" },
      list: { href: "/v1/produtos", method: "GET" },
    }),
  })
  async findById(@Param("id") id: string): Promise<ProdutoDto | null> {
    return this.produtoService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.LOJINHA_WRITE)
  @ApiOperation({ summary: "Criar produto" })
  async create(@Body() body: CreateProdutoDto): Promise<void> {
    return this.produtoService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.LOJINHA_WRITE)
  @ApiOperation({ summary: "Atualizar produto" })
  @ApiNoContentResponse({ description: "Produto atualizado" })
  @ApiNotFoundResponse({ description: "Produto não encontrado" })
  async update(@Param("id") id: string, @Body() body: UpdateProdutoDto): Promise<void> {
    return this.produtoService.edit(id, body);
  }

  @Patch(":id/status")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.LOJINHA_WRITE)
  @ApiOperation({ summary: "Alterar status do produto (Disponivel/Esgotado/Inativo)" })
  @ApiNoContentResponse({ description: "Status atualizado" })
  @ApiNotFoundResponse({ description: "Produto não encontrado" })
  async changeStatus(
    @Param("id") id: string,
    @Body() body: ChangeStatusProdutoDto,
  ): Promise<void> {
    return this.produtoService.changeStatus(id, body.status);
  }

}
