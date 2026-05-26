import { TipoCargo } from "./tipo-cargo.enum";

export class Cargo {
  private readonly _id?: string;
  private _nome!: string;
  private _tipo!: TipoCargo;
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
  get tipo(): TipoCargo { return this._tipo; }
  get atleticaId(): string { return this._atleticaId; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withNome(nome: string) { this._nome = nome; return this; }
  withTipo(tipo: TipoCargo) { this._tipo = tipo; return this; }
  withAtleticaId(atleticaId: string) { this._atleticaId = atleticaId; return this; }

  static restore(props?: {
    id?: string;
    nome: string;
    tipo: TipoCargo;
    atleticaId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Cargo | null {
    if (!props) return null;

    const cargo = new Cargo(props.id, props.createdAt, props.updatedAt);
    cargo._nome = props.nome;
    cargo._tipo = props.tipo;
    cargo._atleticaId = props.atleticaId;

    return cargo;
  }
}
