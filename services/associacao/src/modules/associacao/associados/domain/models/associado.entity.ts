export enum StatusAssociado {
  ATIVO = "ATIVO",
  INATIVO = "INATIVO",
}

export class Associado {
  private readonly _id?: string;
  private _nome!: string;
  private _email!: string;
  private _documento!: string;
  private _telefone!: string;
  private _status!: StatusAssociado;
  private _atleticaId!: string;
  private _taxaAthlos!: number;
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
  get documento(): string { return this._documento; }
  get telefone(): string { return this._telefone; }
  get status(): StatusAssociado { return this._status; }
  get atleticaId(): string { return this._atleticaId; }
  get taxaAthlos(): number { return this._taxaAthlos; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withNome(nome: string) { this._nome = nome; return this; }
  withEmail(email: string) { this._email = email; return this; }
  withDocumento(documento: string) { this._documento = documento; return this; }
  withTelefone(telefone: string) { this._telefone = telefone; return this; }
  withStatus(status: StatusAssociado) { this._status = status; return this; }
  withAtleticaId(atleticaId: string) { this._atleticaId = atleticaId; return this; }

  /**
   * Taxa de 0,5% cobrada por associação conforme requisito RF08
   */
  withValorAssociacao(valorAssociacao: number) {
    this._taxaAthlos = valorAssociacao * 0.005;
    return this;
  }

  static restore(props?: {
    id?: string;
    nome: string;
    email: string;
    documento: string;
    telefone: string;
    status: StatusAssociado;
    atleticaId: string;
    taxaAthlos: number;
    createdAt?: Date;
    updatedAt?: Date;
  }): Associado | null {
    if (!props) return null;

    const associado = new Associado(props.id, props.createdAt, props.updatedAt);
    associado._nome = props.nome;
    associado._email = props.email;
    associado._documento = props.documento;
    associado._telefone = props.telefone;
    associado._status = props.status;
    associado._atleticaId = props.atleticaId;
    associado._taxaAthlos = props.taxaAthlos;

    return associado;
  }
}
