import { CreateAtleticaDto } from "@identidade/atleticas/application/dto/create-atletica.dto";
import { UpdateAtleticaDto } from "@identidade/atleticas/application/dto/update-atletica.dto";
import { AtleticaDto } from "@identidade/atleticas/application/dto/atletica.dto";
import { AtleticaService } from "@identidade/atleticas/application/services/atletica.service";
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";
import { IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

class ChangeStatusAtleticaDto {
  @ApiProperty({ enum: ["ATIVO", "INATIVO"] })
  @IsEnum(["ATIVO", "INATIVO"])
  status!: "ATIVO" | "INATIVO";
}

@ApiTags("atleticas")
@Controller("atleticas")
export class AtleticasController {
  constructor(private readonly atleticaService: AtleticaService) {}

  @Post()
  @ApiBearerAuth()
  @RequirePermissions(Permission.SUPER_ADMIN)
  @ApiOperation({ summary: "Criar atlética (apenas Super Admin Athlos)" })
  @ApiCreatedResponse({ type: AtleticaDto })
  async create(@Body() body: CreateAtleticaDto): Promise<AtleticaDto> {
    return this.atleticaService.create(body);
  }

  @Get()
  @ApiBearerAuth()
  @RequirePermissions(Permission.SUPER_ADMIN)
  @ApiOperation({ summary: "Listar todas as atléticas (apenas Super Admin)" })
  async findAll(): Promise<AtleticaDto[]> {
    return this.atleticaService.findAll();
  }

  @Get(":id")
  @ApiBearerAuth()
  @RequirePermissions(Permission.ATLETICA_READ)
  @ApiOperation({ summary: "Buscar dados da atlética" })
  @ApiNotFoundResponse({ description: "Atlética não encontrada" })
  async findById(@Param("id") id: string): Promise<AtleticaDto> {
    return this.atleticaService.findById(id);
  }

  @Patch(":id")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.ATLETICA_WRITE)
  @ApiOperation({ summary: "Atualizar nome, cores ou logo da atlética" })
  @ApiNoContentResponse({ description: "Atlética atualizada" })
  @ApiNotFoundResponse({ description: "Atlética não encontrada" })
  async update(
    @Param("id") id: string,
    @Body() body: UpdateAtleticaDto,
  ): Promise<void> {
    return this.atleticaService.update(id, body);
  }

  @Patch(":id/status")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SUPER_ADMIN)
  @ApiOperation({ summary: "Ativar ou inativar atlética (apenas Super Admin)" })
  @ApiNoContentResponse({ description: "Status alterado" })
  @ApiNotFoundResponse({ description: "Atlética não encontrada" })
  async changeStatus(
    @Param("id") id: string,
    @Body() body: ChangeStatusAtleticaDto,
  ): Promise<void> {
    return this.atleticaService.changeStatus(id, body.status);
  }

  @Delete(":id")
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.SUPER_ADMIN)
  @ApiOperation({ summary: "Excluir atlética permanentemente (apenas Super Admin)" })
  @ApiNoContentResponse({ description: "Atlética excluída" })
  @ApiNotFoundResponse({ description: "Atlética não encontrada" })
  async delete(@Param("id") id: string): Promise<void> {
    return this.atleticaService.delete(id);
  }
}
