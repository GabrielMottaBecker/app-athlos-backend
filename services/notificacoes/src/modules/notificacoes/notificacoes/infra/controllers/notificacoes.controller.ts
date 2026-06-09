import { CreateNotificacaoDto } from "@notificacoes/notificacoes/application/dto/create-notificacao.dto";
import { NotificacaoService } from "@notificacoes/notificacoes/application/services/notificacao.service";
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
  Query,
} from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";

@ApiTags("notificacoes")
@ApiBearerAuth()
@Controller("notificacoes")
export class NotificacoesController {
  constructor(private readonly notificacaoService: NotificacaoService) {}

  @Get()
  @RequirePermissions(Permission.NOTIFICACOES_READ)
  @ApiOperation({ summary: "Listar inbox do usuario autenticado" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  async findInbox(
    @CurrentUser() user: AuthenticatedUser,
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.notificacaoService.listInbox(user.sub, user.atleticaId, { page, limit });
  }

  @Get("nao-lidas/count")
  @RequirePermissions(Permission.NOTIFICACOES_READ)
  @ApiOperation({ summary: "Contar notificacoes nao lidas" })
  async countUnread(@CurrentUser() user: AuthenticatedUser): Promise<{ count: number }> {
    return this.notificacaoService.countUnread(user.sub, user.atleticaId);
  }

  @Post()
  @RequirePermissions(Permission.NOTIFICACOES_WRITE)
  @ApiOperation({ summary: "Criar notificacao manual" })
  async create(@Body() body: CreateNotificacaoDto): Promise<void> {
    return this.notificacaoService.create(body);
  }

  @Patch(":id/lida")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.NOTIFICACOES_READ)
  @ApiOperation({ summary: "Marcar notificacao como lida" })
  @ApiNoContentResponse({ description: "Notificacao marcada como lida" })
  async markAsRead(
    @Param("id") id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.notificacaoService.markAsRead(id, user.sub);
  }

  @Patch("lidas")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.NOTIFICACOES_READ)
  @ApiOperation({ summary: "Marcar todas notificacoes visiveis como lidas" })
  @ApiNoContentResponse({ description: "Notificacoes marcadas como lidas" })
  async markAllAsRead(@CurrentUser() user: AuthenticatedUser): Promise<void> {
    return this.notificacaoService.markAllAsRead(user.sub, user.atleticaId);
  }
}
