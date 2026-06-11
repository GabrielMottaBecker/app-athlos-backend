import { CreateUsuarioDto } from "@identidade/usuarios/application/dto/create-usuario.dto";
import { UpdateUsuarioDto } from "@identidade/usuarios/application/dto/update-usuario.dto";
import { ChangeStatusUsuarioDto } from "@identidade/usuarios/application/dto/change-status-usuario.dto";
import { UsuarioDto } from "@identidade/usuarios/application/dto/usuario.dto";
import { UsuarioService } from "@identidade/usuarios/application/services/usuario.service";
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

@ApiTags("usuarios")
@ApiBearerAuth()
@Controller("usuarios")
export class UsuariosController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Get()
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: "Listar usuários (paginado)" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.usuarioService.listPaginated({ page, limit });
  }

  @Get("atletica/:atleticaId")
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: "Listar usuários de uma Atlética" })
  async findByAtletica(@Param("atleticaId") atleticaId: string): Promise<UsuarioDto[]> {
    return this.usuarioService.findByAtletica(atleticaId);
  }

  @Get(":id")
  @RequirePermissions(Permission.USERS_READ)
  @ApiOperation({ summary: "Buscar usuário por ID" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async findById(@Param("id") id: string): Promise<UsuarioDto | null> {
    return this.usuarioService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: "Criar usuário" })
  async create(@Body() body: CreateUsuarioDto): Promise<void> {
    return this.usuarioService.create(body);
  }

  @Patch(":id")         
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: "Atualizar usuário" })
  @ApiNoContentResponse({ description: "Usuário atualizado" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async update(
    @Param("id") id: string,
    @Body() body: UpdateUsuarioDto,
  ): Promise<void> {
    return this.usuarioService.edit(id, body);
  }

  @Patch(":id/status")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.USERS_WRITE)
  @ApiOperation({ summary: "Alterar status do usuário (Ativo/Inativo)" })
  @ApiNoContentResponse({ description: "Status atualizado" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async changeStatus(
    @Param("id") id: string,
    @Body() body: ChangeStatusUsuarioDto,
  ): Promise<void> {
    return this.usuarioService.changeStatus(id, body.status);
  }
}
