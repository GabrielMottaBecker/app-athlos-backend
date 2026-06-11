import { CreateAssociadoDto } from "@associacao/associados/application/dto/create-associado.dto";
import { UpdateAssociadoDto } from "@associacao/associados/application/dto/update-associado.dto";
import { ChangeStatusAssociadoDto } from "@associacao/associados/application/dto/change-status-associado.dto";
import { AssignCargoAssociadoDto } from "@associacao/associados/application/dto/assign-cargo-associado.dto";
import { AssociadoDto } from "@associacao/associados/application/dto/associado.dto";
import { AssociadoService } from "@associacao/associados/application/services/associado.service";
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

@ApiTags("associados")
@ApiBearerAuth()
@Controller("associados")
export class AssociadosController {
  constructor(private readonly associadoService: AssociadoService) {}

  @Get()
  @RequirePermissions(Permission.ASSOCIADOS_READ)
  @ApiOperation({ summary: "Listar associados (paginado)" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.associadoService.listPaginated({ page, limit });
  }

  @Get("atletica/:atleticaId")
  @RequirePermissions(Permission.ASSOCIADOS_READ)
  @ApiOperation({ summary: "Listar associados de uma Atlética" })
  async findByAtletica(@Param("atleticaId") atleticaId: string): Promise<AssociadoDto[]> {
    return this.associadoService.findByAtletica(atleticaId);
  }

  @Get(":id")
  @RequirePermissions(Permission.ASSOCIADOS_READ)
  @ApiOperation({ summary: "Buscar associado por ID" })
  @ApiNotFoundResponse({ description: "Associado não encontrado" })
  async findById(@Param("id") id: string): Promise<AssociadoDto | null> {
    return this.associadoService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.ASSOCIADOS_WRITE)
  @ApiOperation({ summary: "Cadastrar novo associado" })
  async create(@Body() body: CreateAssociadoDto): Promise<void> {
    return this.associadoService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.ASSOCIADOS_WRITE)
  @ApiOperation({ summary: "Atualizar dados do associado" })
  @ApiNoContentResponse({ description: "Associado atualizado" })
  @ApiNotFoundResponse({ description: "Associado não encontrado" })
  async update(
    @Param("id") id: string,
    @Body() body: UpdateAssociadoDto,
  ): Promise<void> {
    return this.associadoService.edit(id, body);
  } 

  @Patch(":id/status")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.ASSOCIADOS_WRITE)
  @ApiOperation({ summary: "Alterar status do associado (Ativo/Inativo)" })
  @ApiNoContentResponse({ description: "Status atualizado" })
  @ApiNotFoundResponse({ description: "Associado não encontrado" })
  async changeStatus(
    @Param("id") id: string,
    @Body() body: ChangeStatusAssociadoDto,
  ): Promise<void> {
    return this.associadoService.changeStatus(id, body.status);
  }

  @Patch(":id/cargo")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.ASSOCIADOS_WRITE)
  @ApiOperation({ summary: "Atribuir ou remover cargo do associado" })
  @ApiNoContentResponse({ description: "Cargo atribuído" })
  @ApiNotFoundResponse({ description: "Associado não encontrado" })
  async assignCargo(
    @Param("id") id: string,
    @Body() body: AssignCargoAssociadoDto,
  ): Promise<void> {
    return this.associadoService.assignCargo(id, body);
  }
}
