import { UsuarioRole } from "./usuario-role.enum";
import { UsuarioStatus } from "./usuario-status.enum";

export class Usuario {
  private readonly _id?: string;
  private _nome!: string;
  private _email!: string;
  private _senhaHash!: string;
  private _role!: UsuarioRole;
  private _status!: UsuarioStatus;
  private _atleticaId!: string;
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
  get senhaHash(): string { return this._senhaHash; }
  get role(): UsuarioRole { return this._role; }
  get status(): UsuarioStatus { return this._status; }
  get atleticaId(): string { return this._atleticaId; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withNome(nome: string) { this._nome = nome; return this; }
  withEmail(email: string) { this._email = email; return this; }
  withSenhaHash(senhaHash: string) { this._senhaHash = senhaHash; return this; }
  withRole(role: UsuarioRole) { this._role = role; return this; }
  withStatus(status: UsuarioStatus) { this._status = status; return this; }
  withAtleticaId(atleticaId: string) { this._atleticaId = atleticaId; return this; }

  static restore(props?: {
    id?: string;
    nome: string;
    email: string;
    senhaHash: string;
    role: UsuarioRole;
    status: UsuarioStatus;
    atleticaId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Usuario | null {
    if (!props) return null;

    const usuario = new Usuario(props.id, props.createdAt, props.updatedAt);
    usuario._nome = props.nome;
    usuario._email = props.email;
    usuario._senhaHash = props.senhaHash;
    usuario._role = props.role;
    usuario._status = props.status;
    usuario._atleticaId = props.atleticaId;

    return usuario;
  }
}
