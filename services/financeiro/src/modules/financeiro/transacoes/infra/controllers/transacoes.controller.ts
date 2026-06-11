import { CreateTransacaoDto } from "@financeiro/transacoes/application/dto/create-transacao.dto";
import { UpdateTransacaoDto } from "@financeiro/transacoes/application/dto/update-transacao.dto";
import { TransacaoDto } from "@financeiro/transacoes/application/dto/transacao.dto";
import { TransacaoService } from "@financeiro/transacoes/application/services/transacao.service";
import {
  Body,
  Controller,
  DefaultValuePipe,
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

@ApiTags("transacoes")
@ApiBearerAuth()
@Controller("transacoes")
export class TransacoesController {
  constructor(private readonly transacaoService: TransacaoService) {}

  @Get()
  @RequirePermissions(Permission.FINANCEIRO_READ)
  @ApiOperation({ summary: "Listar transações (paginado)" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  @HateoasList<TransacaoDto>({
    basePath: "/v1/transacoes",
    itemLinks: (item) => ({
      self: { href: `/v1/transacoes/${item.id}`, method: "GET" },
      update: { href: `/v1/transacoes/${item.id}`, method: "PUT" },
      categoria: { href: `/v1/categorias/${item.categoriaId}`, method: "GET" },
    }),
  })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.transacaoService.listPaginated({ page, limit });
  }

  @Get("atletica/:atleticaId")
  @RequirePermissions(Permission.FINANCEIRO_READ)
  @ApiOperation({ summary: "Listar transações de uma Atlética" })
  async findByAtletica(@Param("atleticaId") atleticaId: string): Promise<TransacaoDto[]> {
    return this.transacaoService.findByAtletica(atleticaId);
  }

  @Get(":id")
  @RequirePermissions(Permission.FINANCEIRO_READ)
  @ApiOperation({ summary: "Buscar transação por ID" })
  @ApiNotFoundResponse({ description: "Transação não encontrada" })
  @HateoasItem<TransacaoDto>({
    basePath: "/v1/transacoes",
    itemLinks: (item) => ({
      self: { href: `/v1/transacoes/${item.id}`, method: "GET" },
      update: { href: `/v1/transacoes/${item.id}`, method: "PUT" },
      categoria: { href: `/v1/categorias/${item.categoriaId}`, method: "GET" },
      list: { href: "/v1/transacoes", method: "GET" },
    }),
  })
  async findById(@Param("id") id: string): Promise<TransacaoDto | null> {
    return this.transacaoService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.FINANCEIRO_WRITE)
  @ApiOperation({ summary: "Registrar nova transação" })
  async create(@Body() body: CreateTransacaoDto): Promise<void> {
    return this.transacaoService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.FINANCEIRO_WRITE)
  @ApiOperation({ summary: "Atualizar transação" })
  @ApiNoContentResponse({ description: "Transação atualizada" })
  @ApiNotFoundResponse({ description: "Transação não encontrada" })
  async update(@Param("id") id: string, @Body() body: UpdateTransacaoDto): Promise<void> {
    return this.transacaoService.edit(id, body);
  }
}
