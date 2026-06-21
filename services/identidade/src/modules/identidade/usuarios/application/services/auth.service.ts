import { LoginDto } from "@identidade/usuarios/application/dto/login.dto";
import { AuthResponseDto } from "@identidade/usuarios/application/dto/auth-response.dto";
import { RefreshTokenRequestDto } from "@identidade/usuarios/application/dto/refresh-token-request.dto";
import { VerificarAssociadoDto } from "@identidade/usuarios/application/dto/verificar-associado.dto";
import { VerificarAssociadoResponseDto } from "@identidade/usuarios/application/dto/verificar-associado-response.dto";
import { DefinirSenhaDto } from "@identidade/usuarios/application/dto/definir-senha.dto";
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
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Permission } from "@shared/domain/enums/permission.enum";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const ROLE_PERMISSIONS: Record<UsuarioRole, Permission[]> = {
  [UsuarioRole.SUPER_ADMIN]: [
    Permission.SUPER_ADMIN,
    Permission.ATLETICA_READ,
    Permission.ATLETICA_WRITE,
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.ASSOCIADOS_READ,
    Permission.CARGOS_READ,
  ],
  [UsuarioRole.ADMINISTRADOR]: [
    Permission.ATLETICA_READ,
    Permission.ATLETICA_WRITE,
    Permission.ASSOCIADOS_READ,
    Permission.ASSOCIADOS_WRITE,
    Permission.ASSOCIADOS_DELETE,
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.USERS_DELETE,
    Permission.CARGOS_READ,
    Permission.CARGOS_WRITE,
    Permission.CARGOS_DELETE,
    Permission.EVENTOS_READ,
    Permission.EVENTOS_WRITE,
    Permission.EVENTOS_DELETE,
    Permission.NOTIFICACOES_READ,
    Permission.NOTIFICACOES_WRITE,
    Permission.LOJINHA_READ,
    Permission.LOJINHA_WRITE,
    Permission.FINANCEIRO_READ,
    Permission.FINANCEIRO_WRITE,
  ],
  [UsuarioRole.MEMBRO]: [
    Permission.ATLETICA_READ,
    Permission.ASSOCIADOS_READ,
    Permission.CARGOS_READ,
    Permission.EVENTOS_READ,
    Permission.NOTIFICACOES_READ,
    Permission.LOJINHA_READ,
  ],
};

/** Escopo usado no JWT de sessão de ativação — nunca deve receber permissions reais. */
const ESCOPO_ATIVACAO = "ativacao";

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

    if (!usuario.senhaHash) {
      throw new UnauthorizedException(
        "Conta ainda não ativada. Toque em \"Novo na atlética?\" na tela de login para criar sua senha.",
      );
    }

    const senhaHash: string = usuario.senhaHash;
    const senhaValida = await bcrypt.compare(dto.senha, senhaHash);
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

  /**
   * Primeira etapa da ativação de conta do membro: confirma que quem está
   * tentando ativar a conta conhece o email e o telefone cadastrados pelo
   * presidente/admin. Em caso de sucesso, devolve um token de sessão de
   * curta duração (10 min) para a etapa seguinte (definir senha).
   */
  async verificarAssociado(dto: VerificarAssociadoDto): Promise<VerificarAssociadoResponseDto> {
    const usuario = await this.usuarioRepository.findByEmail(dto.email);

    const telefoneNormalizado = dto.telefone.replace(/\D/g, "");
    const telefoneCadastrado = usuario?.telefone?.replace(/\D/g, "");

    if (!usuario || !telefoneCadastrado || telefoneCadastrado !== telefoneNormalizado) {
      throw new BadRequestException("Não encontramos um cadastro com esses dados.");
    }

    if (usuario.senhaHash) {
      throw new BadRequestException(
        "Esta conta já está ativa. Faça login normalmente ou use \"Esqueci minha senha\".",
      );
    }

    const tokenSessao = await this.jwtService.signAsync(
      { sub: usuario.id, escopo: ESCOPO_ATIVACAO },
      { expiresIn: "10m" },
    );

    return { tokenSessao, nome: usuario.nome };
  }

  /**
   * Segunda etapa da ativação: grava a senha definida pelo membro e marca
   * a conta como ativa (senhaHash deixa de ser null).
   */
  async definirSenha(dto: DefinirSenhaDto): Promise<AuthResponseDto> {
    let payload: { sub: string; escopo: string };
    try {
      payload = await this.jwtService.verifyAsync(dto.tokenSessao);
    } catch {
      throw new UnauthorizedException("Sessão de ativação expirada. Inicie o processo novamente.");
    }

    if (payload.escopo !== ESCOPO_ATIVACAO) {
      throw new UnauthorizedException("Token inválido para esta operação.");
    }

    const usuario = await this.usuarioRepository.findById(payload.sub);
    if (!usuario) {
      throw new UnauthorizedException("Usuário não encontrado.");
    }

    if (usuario.senhaHash) {
      throw new BadRequestException("Esta conta já está ativa. Faça login normalmente.");
    }

    const senhaHash = await bcrypt.hash(dto.senha, 12);
    await this.usuarioRepository.definirSenha(usuario.id!, senhaHash);

    // já loga o membro automaticamente após ativar a conta
    return this.login({ email: usuario.email, senha: dto.senha });
  }
}