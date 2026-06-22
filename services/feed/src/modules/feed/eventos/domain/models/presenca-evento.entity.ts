export enum StatusPresencaEvento {
  CONFIRMADA = "CONFIRMADA",
}

export class PresencaEvento {
  private readonly _id?: string;
  private _eventoId!: string;
  private _usuarioId!: string;
  private _email!: string;
  private _status!: StatusPresencaEvento;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get eventoId(): string { return this._eventoId; }
  get usuarioId(): string { return this._usuarioId; }
  get email(): string { return this._email; }
  get status(): StatusPresencaEvento { return this._status; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  static restore(props?: {
    id?: string;
    eventoId: string;
    usuarioId: string;
    email?: string;
    status: StatusPresencaEvento;
    createdAt?: Date;
    updatedAt?: Date;
  }): PresencaEvento | null {
    if (!props) return null;

    const presenca = new PresencaEvento(props.id, props.createdAt, props.updatedAt);
    presenca._eventoId = props.eventoId;
    presenca._usuarioId = props.usuarioId;
    presenca._email = props.email ?? "";
    presenca._status = props.status;

    return presenca;
  }
}