import { RegisterDeviceTokenDto } from "@notificacoes/device-tokens/application/dto/register-device-token.dto";
import { DeviceTokenService } from "@notificacoes/device-tokens/application/services/device-token.service";
import { Body, Controller, Delete, HttpCode, HttpStatus, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiNoContentResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { Permission } from "@shared/domain/enums/permission.enum";
import type { AuthenticatedUser } from "@shared/infra/auth/interfaces/authenticated-user.interface";
import { CurrentUser } from "@shared/infra/decorators/current-user.decorator";
import { RequirePermissions } from "@shared/infra/decorators/permissions.decorator";

@ApiTags("device-tokens")
@ApiBearerAuth()
@Controller("device-tokens")
export class DeviceTokensController {
  constructor(private readonly deviceTokenService: DeviceTokenService) {}

  @Post()
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.NOTIFICACOES_READ)
  @ApiOperation({ summary: "Registrar ou reativar token de dispositivo" })
  @ApiNoContentResponse({ description: "Token registrado" })
  async register(
    @Body() body: RegisterDeviceTokenDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.deviceTokenService.register(body, user.sub, user.atleticaId);
  }

  @Delete(":token")
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(Permission.NOTIFICACOES_READ)
  @ApiOperation({ summary: "Desativar token de dispositivo" })
  @ApiNoContentResponse({ description: "Token desativado" })
  async deactivate(
    @Param("token") token: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    return this.deviceTokenService.deactivate(token, user.sub);
  }
}
