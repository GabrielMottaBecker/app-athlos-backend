import { LoginDto } from "@identidade/usuarios/application/dto/login.dto";
import { AuthResponseDto } from "@identidade/usuarios/application/dto/auth-response.dto";
import { RefreshTokenRequestDto } from "@identidade/usuarios/application/dto/refresh-token-request.dto";
import { VerificarAssociadoDto } from "@identidade/usuarios/application/dto/verificar-associado.dto";
import { VerificarAssociadoResponseDto } from "@identidade/usuarios/application/dto/verificar-associado-response.dto";
import { DefinirSenhaDto } from "@identidade/usuarios/application/dto/definir-senha.dto";
import { AuthService } from "@identidade/usuarios/application/services/auth.service";
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
} from "@nestjs/common";
import {
  ApiBadRequestResponse,
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

  @Post("verificar-associado")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Primeiro acesso do membro: confirma email + telefone cadastrados pelo presidente" })
  @ApiOkResponse({ type: VerificarAssociadoResponseDto })
  @ApiBadRequestResponse({ description: "Dados não encontrados, incorretos ou conta já ativa" })
  async verificarAssociado(@Body() body: VerificarAssociadoDto): Promise<VerificarAssociadoResponseDto> {
    return this.authService.verificarAssociado(body);
  }

  @Post("definir-senha")
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Primeiro acesso do membro: define a senha e ativa a conta" })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ description: "Token de sessão inválido ou expirado" })
  @ApiBadRequestResponse({ description: "Conta já está ativa" })
  async definirSenha(@Body() body: DefinirSenhaDto): Promise<AuthResponseDto> {
    return this.authService.definirSenha(body);
  }
}