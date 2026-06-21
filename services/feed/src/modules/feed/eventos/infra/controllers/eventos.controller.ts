import { ConfirmarPresencaEventoDto } from "@feed/eventos/application/dto/confirmar-presenca-evento.dto";
import { CreateEventoDto } from "@feed/eventos/application/dto/create-evento.dto";
import { EventoDto } from "@feed/eventos/application/dto/evento.dto";
import { PresencaParticipanteDto } from "@feed/eventos/application/dto/presenca-participante.dto";
import { UpdateEventoDto } from "@feed/eventos/application/dto/update-evento.dto";
import { EventoService } from "@feed/eventos/application/services/evento.service";
import { TipoEvento } from "@feed/eventos/domain/models/evento.entity";
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
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
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";

@ApiTags("eventos")
@ApiBearerAuth()
@Controller("eventos")
export class EventosController {
  constructor(private readonly eventoService: EventoService) {}

  @Get()
  @RequirePermissions(Permission.EVENTOS_READ)
  @ApiOperation({ summary: "Listar eventos (paginado)" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.eventoService.listPaginated({ page, limit });
  }

  @Get("atletica/:atleticaId")
  @RequirePermissions(Permission.EVENTOS_READ)
  @ApiOperation({ summary: "Listar eventos de uma Atletica" })
  async findByAtletica(
    @Param("atleticaId") atleticaId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventoDto[]> {
    return this.eventoService.findByAtletica(atleticaId, user.sub);
  }

  @Get("atletica/:atleticaId/tipo/:type")
  @RequirePermissions(Permission.EVENTOS_READ)
  @ApiOperation({ summary: "Listar eventos de uma Atletica filtrados por tipo" })
  async findByAtleticaAndType(
    @Param("atleticaId") atleticaId: string,
    @Param("type", new ParseEnumPipe(TipoEvento)) type: TipoEvento,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventoDto[]> {
    return this.eventoService.findByAtleticaAndType(atleticaId, type, user.sub);
  }

  @Get(":id")
  @RequirePermissions(Permission.EVENTOS_READ)
  @ApiOperation({ summary: "Buscar evento por ID" })
  @ApiNotFoundResponse({ description: "Evento nao encontrado" })
  async findById(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EventoDto | null> {
    return this.eventoService.findById(id, user.sub);
  }

  @Post()
  @RequirePermissions(Permission.EVENTOS_WRITE)
  @ApiOperation({ summary: "Criar evento" })
  async create(@Body() body: CreateEventoDto): Promise<void> {
    return this.eventoService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.EVENTOS_WRITE)
  @ApiOperation({ summary: "Atualizar evento" })
  @ApiNoContentResponse({ description: "Evento atualizado" })
  @ApiNotFoundResponse({ description: "Evento nao encontrado" })
  async update(
    @Param("id") id: string,
    @Body() body: UpdateEventoDto,
  ): Promise<void> {
    return this.eventoService.edit(id, body);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.EVENTOS_DELETE)
  @ApiOperation({ summary: "Remover evento" })
  @ApiNoContentResponse({ description: "Evento removido" })
  @ApiNotFoundResponse({ description: "Evento nao encontrado" })
  async remove(@Param("id") id: string): Promise<void> {
    return this.eventoService.remove(id);
  }

  @Post(":id/presencas")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.EVENTOS_READ)
  @ApiOperation({ summary: "Confirmar presenca em evento" })
  @ApiNoContentResponse({ description: "Presenca confirmada" })
  @ApiNotFoundResponse({ description: "Evento nao encontrado" })
  async confirmarPresenca(
    @Param("id") id: string,
    @Body() body: ConfirmarPresencaEventoDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.eventoService.confirmarPresenca(id, body, user.sub, user.email);
  }

  @Delete(":id/presencas/:usuarioId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.EVENTOS_READ)
  @ApiOperation({ summary: "Remover confirmacao de presenca" })
  @ApiNoContentResponse({ description: "Presenca removida" })
  @ApiNotFoundResponse({ description: "Evento ou presenca nao encontrados" })
  async removerPresenca(
    @Param("id") id: string,
    @Param("usuarioId") usuarioId: string,
  ): Promise<void> {
    return this.eventoService.removerPresenca(id, usuarioId);
  }

  @Get(":id/presencas")
  @RequirePermissions(Permission.EVENTOS_WRITE)
  @ApiOperation({ summary: "Listar quem confirmou presenca em um evento (uso administrativo)" })
  @ApiNotFoundResponse({ description: "Evento nao encontrado" })
  async listarPresencas(
    @Param("id") id: string,
  ): Promise<PresencaParticipanteDto[]> {
    return this.eventoService.listarPresencas(id);
  }
}