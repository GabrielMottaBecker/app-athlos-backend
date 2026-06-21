import { UsuarioRole } from "./usuario-role.enum";
import { UsuarioStatus } from "./usuario-status.enum";

export class Usuario {
  private readonly _id?: string;
  private _nome!: string;
  private _email!: string;
  private _telefone?: string | null;
  private _senhaHash?: string | null;
  private _role!: UsuarioRole;
  private _status!: UsuarioStatus;
  private _fotoUrl?: string | null;
  private _atleticaId!: string;
  private _associadoId?: string | null;
  private _ativadoEm?: Date | null;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get nome(): string { return this._nome; }
  get email(): string { return this._email; }
  get telefone(): string | null | undefined { return this._telefone; }
  get senhaHash(): string | null | undefined { return this._senhaHash; }
  get role(): UsuarioRole { return this._role; }
  get status(): UsuarioStatus { return this._status; }
  get fotoUrl(): string | null | undefined { return this._fotoUrl; }
  get atleticaId(): string { return this._atleticaId; }
  get associadoId(): string | null | undefined { return this._associadoId; }
  get ativadoEm(): Date | null | undefined { return this._ativadoEm; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  /** Usuário só pode logar depois que define a senha (pré-cadastro de membro). */
  get ativo(): boolean {
    return !!this._senhaHash;
  }

  withNome(nome: string) { this._nome = nome; return this; }
  withEmail(email: string) { this._email = email; return this; }
  withTelefone(telefone: string | null) { this._telefone = telefone; return this; }
  withSenhaHash(senhaHash: string) { this._senhaHash = senhaHash; return this; }
  withRole(role: UsuarioRole) { this._role = role; return this; }
  withStatus(status: UsuarioStatus) { this._status = status; return this; }
  withFotoUrl(fotoUrl: string | null) { this._fotoUrl = fotoUrl; return this; }
  withAtleticaId(atleticaId: string) { this._atleticaId = atleticaId; return this; }
  withAssociadoId(associadoId: string | null) { this._associadoId = associadoId; return this; }
  withAtivadoEm(ativadoEm: Date | null) { this._ativadoEm = ativadoEm; return this; }

  static restore(props?: {
    id?: string;
    nome: string;
    email: string;
    telefone?: string | null;
    senhaHash?: string | null;
    role: UsuarioRole;
    status: UsuarioStatus;
    fotoUrl?: string | null;
    atleticaId: string;
    associadoId?: string | null;
    ativadoEm?: Date | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Usuario | null {
    if (!props) return null;

    const usuario = new Usuario(props.id, props.createdAt, props.updatedAt);
    usuario._nome = props.nome;
    usuario._email = props.email;
    usuario._telefone = props.telefone ?? null;
    usuario._senhaHash = props.senhaHash ?? null;
    usuario._role = props.role;
    usuario._status = props.status;
    usuario._fotoUrl = props.fotoUrl ?? null;
    usuario._atleticaId = props.atleticaId;
    usuario._associadoId = props.associadoId ?? null;
    usuario._ativadoEm = props.ativadoEm ?? null;

    return usuario;
  }
}