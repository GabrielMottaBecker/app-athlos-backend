import { CreateUsuarioDto } from "@identidade/usuarios/application/dto/create-usuario.dto";
import { UpdateUsuarioDto } from "@identidade/usuarios/application/dto/update-usuario.dto";
import { UsuarioDto } from "@identidade/usuarios/application/dto/usuario.dto";
import { UsuarioMessagingService } from "@identidade/usuarios/application/services/usuario-messaging.service";
import { Usuario } from "@identidade/usuarios/domain/models/usuario.entity";
import { UsuarioStatus } from "@identidade/usuarios/domain/models/usuario-status.enum";
import {
  USUARIO_REPOSITORY,
  type UsuarioRepository,
} from "@identidade/usuarios/domain/repositories/usuario-repository.interface";
import {
  ConflictException,
  Injectable,
  Inject,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import type { PaginatedResult, PaginationParams } from "@shared/infra/hateoas";
import * as bcrypt from "bcrypt";

@Injectable()
export class UsuarioService {
  private readonly logger = new Logger(UsuarioService.name);

  constructor(
    @Inject(USUARIO_REPOSITORY)
    private readonly usuarioRepository: UsuarioRepository,
    private readonly messagingService: UsuarioMessagingService,
  ) {}

  async create(dto: CreateUsuarioDto): Promise<void> {
    const emailExistente = await this.usuarioRepository.findByEmail(dto.email);
    if (emailExistente) {
      throw new ConflictException("E-mail já cadastrado");
    }

    const senhaHash = await bcrypt.hash(dto.senha, 12);

    const usuario = Usuario.restore({
      nome: dto.nome,
      email: dto.email.toLowerCase(),
      senhaHash,
      role: dto.role,
      status: UsuarioStatus.ATIVO,
      atleticaId: dto.atleticaId,
    })!;

    await this.usuarioRepository.create(usuario);

    const criado = await this.usuarioRepository.findByEmail(dto.email.toLowerCase());
    if (!criado) throw new NotFoundException("Usuário criado não encontrado");

    await this.messagingService.publishUsuarioCreated(UsuarioDto.fromUsuario(criado)!);
  }

  /**
   * Cria o pré-cadastro de um membro a partir do evento associado.created.
   * O usuário fica sem senha (inativo para login) até concluir a ativação
   * em /auth/verificar-associado + /auth/definir-senha.
   * Idempotente: se o associado já tiver um usuário vinculado, não duplica.
   */
  async createPreCadastro(data: {
    nome: string;
    email: string;
    telefone: string;
    atleticaId: string;
    associadoId: string;
  }): Promise<void> {
    const existente = await this.usuarioRepository.findByAssociadoId(data.associadoId);
    if (existente) {
      this.logger.log(`Pré-cadastro já existe para o associado ${data.associadoId}, ignorando.`);
      return;
    }

    const emailExistente = await this.usuarioRepository.findByEmail(data.email);
    if (emailExistente) {
      this.logger.warn(`Email ${data.email} já está em uso por outro usuário; pré-cadastro não criado.`);
      return;
    }

    await this.usuarioRepository.createPreCadastro(data);
  }

  async edit(id: string, dto: UpdateUsuarioDto): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) throw new NotFoundException("Usuário não encontrado");

    if (dto.email && dto.email.toLowerCase() !== usuario.email) {
      const existente = await this.usuarioRepository.findByEmail(dto.email.toLowerCase());
      if (existente) throw new ConflictException("E-mail já cadastrado");
    }

    if (dto.nome) usuario.withNome(dto.nome);
    if (dto.email) usuario.withEmail(dto.email.toLowerCase());
    if (dto.role) usuario.withRole(dto.role);

    if (dto.senha) {
      const senhaHash = await bcrypt.hash(dto.senha, 12);
      usuario.withSenhaHash(senhaHash);
    }

    await this.usuarioRepository.update(usuario);
    await this.messagingService.publishUsuarioUpdated(UsuarioDto.fromUsuario(usuario)!);
  }

  async changeStatus(id: string, status: UsuarioStatus): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) throw new NotFoundException("Usuário não encontrado");

    await this.usuarioRepository.updateStatus(id, status);
    usuario.withStatus(status);

    await this.messagingService.publishStatusChanged(UsuarioDto.fromUsuario(usuario)!);
  }

  async remove(id: string): Promise<void> {
    const usuario = await this.usuarioRepository.findById(id);
    if (!usuario) throw new NotFoundException("Usuário não encontrado");

    await this.usuarioRepository.delete(id);
    await this.messagingService.publishUsuarioDeleted(UsuarioDto.fromUsuario(usuario)!);
  }

  async listPaginated(params: PaginationParams): Promise<PaginatedResult<UsuarioDto>> {
    const { rows, total } = await this.usuarioRepository.findAllPaginated(params);
    return {
      data: rows.map((row) => UsuarioDto.fromUsuario(row)!),
      total,
      page: params.page,
      limit: params.limit,
    };
  }

  async findById(id: string): Promise<UsuarioDto | null> {
    const usuario = await this.usuarioRepository.findById(id);
    return UsuarioDto.fromUsuario(usuario);
  }

  async findByAtletica(atleticaId: string): Promise<UsuarioDto[]> {
    const rows = await this.usuarioRepository.findByAtletica(atleticaId);
    return rows.map((row) => UsuarioDto.fromUsuario(row)!);
  }
}