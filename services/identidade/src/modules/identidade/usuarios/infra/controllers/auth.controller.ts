import { LoginDto } from "@identidade/usuarios/application/dto/login.dto";
import { AuthResponseDto } from "@identidade/usuarios/application/dto/auth-response.dto";
import { RefreshTokenRequestDto } from "@identidade/usuarios/application/dto/refresh-token-request.dto";
import { AuthService } from "@identidade/usuarios/application/services/auth.service";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import { Public } from "@shared/infra/decorators/public.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Autenticar usuário e obter tokens" })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: "Credenciais inválidas" })
  async login(@Body() body: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(body);
  }

  @Post("refresh")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Renovar access token usando refresh token" })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: "Refresh token inválido ou expirado" })
  async refresh(@Body() body: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    return this.authService.refresh(body);
  }

  @Post("logout")
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Revogar refresh token (logout)" })
  async logout(@Body() body: RefreshTokenRequestDto): Promise<void> {
    return this.authService.logout(body.refreshToken);
  }
}
