import { CreateUsuarioDto } from "@identidade/usuarios/application/dto/create-usuario.dto";
import { UpdateUsuarioDto } from "@identidade/usuarios/application/dto/update-usuario.dto";
import { ChangeStatusUsuarioDto } from "@identidade/usuarios/application/dto/change-status-usuario.dto";
import { UsuarioDto } from "@identidade/usuarios/application/dto/usuario.dto";
import { UploadFotoUsuarioResponseDto } from "@identidade/usuarios/application/dto/upload-foto-usuario-response.dto";
import { UsuarioService } from "@identidade/usuarios/application/services/usuario.service";
import {
  buildFotoUsuarioUrl,
  fotoUsuarioMulterOptions,
} from "@identidade/usuarios/infra/storage/foto-usuario.storage";
import {
  BadRequestException,
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
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiBearerAuth,
  ApiConsumes,
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

  @Get("me")
  @ApiOperation({ summary: "Buscar os dados do próprio usuário autenticado" })
  @ApiNotFoundResponse({ description: "Usuário não encontrado" })
  async findMe(@CurrentUser() user: AuthenticatedUser): Promise<UsuarioDto | null> {
    return this.usuarioService.findById(user.sub);
  }

  @Post("me/foto")
  @UseInterceptors(FileInterceptor("foto", fotoUsuarioMulterOptions))
  @ApiOperation({ summary: "Enviar/atualizar a foto de perfil do usuário autenticado" })
  @ApiConsumes("multipart/form-data")
  async uploadFotoPerfil(
    @CurrentUser() user: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadFotoUsuarioResponseDto> {
    if (!file) throw new BadRequestException("Nenhum arquivo enviado");

    const fotoUrl = buildFotoUsuarioUrl(file.filename);
    const usuario = await this.usuarioService.uploadFotoPerfil(user.sub, fotoUrl);

    return { fotoUrl: usuario.fotoUrl ?? fotoUrl };
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