import { TipoCategoria } from "./tipo-categoria.enum";

export class Categoria {
  private readonly _id?: string;
  private _nome!: string;
  private _tipo!: TipoCategoria;
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
  get tipo(): TipoCategoria { return this._tipo; }
  get atleticaId(): string { return this._atleticaId; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withNome(nome: string) { this._nome = nome; return this; }
  withTipo(tipo: TipoCategoria) { this._tipo = tipo; return this; }

  static restore(props?: {
    id?: string;
    nome: string;
    tipo: TipoCategoria;
    atleticaId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Categoria | null {
    if (!props) return null;
    const cat = new Categoria(props.id, props.createdAt, props.updatedAt);
    cat._nome = props.nome;
    cat._tipo = props.tipo;
    cat._atleticaId = props.atleticaId;
    return cat;
  }
}
