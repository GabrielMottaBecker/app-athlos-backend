import { LoginDto } from "@identidade/usuarios/application/dto/login.dto";
import { AuthResponseDto } from "@identidade/usuarios/application/dto/auth-response.dto";
import { RefreshTokenRequestDto } from "@identidade/usuarios/application/dto/refresh-token-request.dto";
import {
  USUARIO_REPOSITORY,
  type UsuarioRepository,
} from "@identidade/usuarios/domain/repositories/usuario-repository.interface";
import {
  REFRESH_TOKEN_REPOSITORY,
  type RefreshTokenRepository,
} from "@identidade/usuarios/domain/repositories/refresh-token-repository.interface";
import { UsuarioRole } from "@identidade/usuarios/domain/models/usuario-role.enum";
import { UsuarioStatus } from "@identidade/usuarios/domain/models/usuario-status.enum";
import {
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Permission } from "@shared/domain/enums/permission.enum";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const ROLE_PERMISSIONS: Record<UsuarioRole, Permission[]> = {
  [UsuarioRole.ADMINISTRADOR]: [
    Permission.ASSOCIADOS_READ,
    Permission.ASSOCIADOS_WRITE,
    Permission.ASSOCIADOS_DELETE,
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.USERS_DELETE,
    Permission.CARGOS_READ,
    Permission.CARGOS_WRITE,
    Permission.CARGOS_DELETE,
  ],
  [UsuarioRole.MEMBRO]: [
    Permission.ASSOCIADOS_READ,
    Permission.CARGOS_READ,
  ],
};

@Injectable()
export class AuthService {
  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    @Inject(REFRESH_TOKEN_REPOSITORY)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    const usuario = await this.usuarioRepository.findByEmail(dto.email);

    if (!usuario || usuario.status === UsuarioStatus.INATIVO) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const senhaValida = await bcrypt.compare(dto.senha, usuario.senhaHash);
    if (!senhaValida) {
      throw new UnauthorizedException("Credenciais inválidas");
    }

    const permissions = ROLE_PERMISSIONS[usuario.role];

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      atleticaId: usuario.atleticaId,
      permissions,
    });

    const refreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await this.refreshTokenRepository.create(refreshToken, usuario.id!, expiresAt);

    return { accessToken, refreshToken };
  }

  async refresh(dto: RefreshTokenRequestDto): Promise<AuthResponseDto> {
    const record = await this.refreshTokenRepository.findByToken(dto.refreshToken);

    if (!record || record.revogado || record.expiresAt < new Date()) {
      throw new UnauthorizedException("Refresh token inválido ou expirado");
    }

    const usuario = await this.usuarioRepository.findById(record.usuarioId);
    if (!usuario || usuario.status === UsuarioStatus.INATIVO) {
      throw new UnauthorizedException("Usuário não encontrado ou inativo");
    }

    const permissions = ROLE_PERMISSIONS[usuario.role];

    const accessToken = await this.jwtService.signAsync({
      sub: usuario.id,
      email: usuario.email,
      atleticaId: usuario.atleticaId,
      permissions,
    });

    await this.refreshTokenRepository.revoke(dto.refreshToken);
    const newRefreshToken = randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    await this.refreshTokenRepository.create(newRefreshToken, usuario.id!, expiresAt);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.refreshTokenRepository.revoke(refreshToken);
  }
}
