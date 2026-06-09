import { NotificacaoTipo } from "./notificacao-tipo.enum";

export class Notificacao {
  private readonly _id?: string;
  private _usuarioId?: string | null;
  private _atleticaId!: string;
  private _tipo!: NotificacaoTipo;
  private _titulo!: string;
  private _mensagem!: string;
  private _metadata?: Record<string, unknown> | null;
  private readonly _createdAt?: Date;
  private readonly _readAt?: Date | null;

  private constructor(id?: string, createdAt?: Date, readAt?: Date | null) {
    this._id = id;
    this._createdAt = createdAt;
    this._readAt = readAt ?? null;
  }

  get id(): string | undefined { return this._id; }
  get usuarioId(): string | null | undefined { return this._usuarioId; }
  get atleticaId(): string { return this._atleticaId; }
  get tipo(): NotificacaoTipo { return this._tipo; }
  get titulo(): string { return this._titulo; }
  get mensagem(): string { return this._mensagem; }
  get metadata(): Record<string, unknown> | null | undefined { return this._metadata; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get readAt(): Date | null | undefined { return this._readAt; }
  get lida(): boolean { return Boolean(this._readAt); }

  static restore(props?: {
    id?: string;
    usuarioId?: string | null;
    atleticaId: string;
    tipo: NotificacaoTipo;
    titulo: string;
    mensagem: string;
    metadata?: Record<string, unknown> | null;
    createdAt?: Date;
    readAt?: Date | null;
  }): Notificacao | null {
    if (!props) return null;

    const notificacao = new Notificacao(props.id, props.createdAt, props.readAt);
    notificacao._usuarioId = props.usuarioId ?? null;
    notificacao._atleticaId = props.atleticaId;
    notificacao._tipo = props.tipo;
    notificacao._titulo = props.titulo;
    notificacao._mensagem = props.mensagem;
    notificacao._metadata = props.metadata ?? null;
    return notificacao;
  }
}
