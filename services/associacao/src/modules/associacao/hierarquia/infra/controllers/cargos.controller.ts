import { CreateCargoDto } from "@hierarquia/application/dto/create-cargo.dto";
import { UpdateCargoDto } from "@hierarquia/application/dto/update-cargo.dto";
import { CargoDto } from "@hierarquia/application/dto/cargo.dto";
import { CargoService } from "@hierarquia/application/services/cargo.service";
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

@ApiTags("cargos")
@ApiBearerAuth()
@Controller("cargos")
export class CargosController {
  constructor(private readonly cargoService: CargoService) {}

  @Get()
  @RequirePermissions(Permission.CARGOS_READ)
  @ApiOperation({ summary: "Listar cargos (paginado)" })
  @ApiQuery({ name: "_page", required: false, type: Number })
  @ApiQuery({ name: "_size", required: false, type: Number })
  async findAll(
    @Query("_page", new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query("_size", new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    return this.cargoService.listPaginated({ page, limit });
  }

  @Get("atletica/:atleticaId")
  @RequirePermissions(Permission.CARGOS_READ)
  @ApiOperation({ summary: "Listar cargos de uma Atlética" })
  async findByAtletica(@Param("atleticaId") atleticaId: string): Promise<CargoDto[]> {
    return this.cargoService.findByAtletica(atleticaId);
  }

  @Get(":id")
  @RequirePermissions(Permission.CARGOS_READ)
  @ApiOperation({ summary: "Buscar cargo por ID" })
  @ApiNotFoundResponse({ description: "Cargo não encontrado" })
  async findById(@Param("id") id: string): Promise<CargoDto | null> {
    return this.cargoService.findById(id);
  }

  @Post()
  @RequirePermissions(Permission.CARGOS_WRITE)
  @ApiOperation({ summary: "Criar cargo" })
  async create(@Body() body: CreateCargoDto): Promise<void> {
    return this.cargoService.create(body);
  }

  @Put(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.CARGOS_WRITE)
  @ApiOperation({ summary: "Atualizar cargo" })
  @ApiNoContentResponse({ description: "Cargo atualizado" })
  @ApiNotFoundResponse({ description: "Cargo não encontrado" })
  async update(
    @Param("id") id: string,
    @Body() body: UpdateCargoDto,
  ): Promise<void> {
    return this.cargoService.edit(id, body);
  }

}
