import { TipoTransacao } from "./tipo-transacao.enum";

export class Transacao {
  private readonly _id?: string;
  private _descricao!: string;
  private _valor!: number;
  private _tipo!: TipoTransacao;
  private _categoriaId!: string;
  private _atleticaId!: string;
  private _dataTransacao!: Date;
  private _observacao?: string | null;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get descricao(): string { return this._descricao; }
  get valor(): number { return this._valor; }
  get tipo(): TipoTransacao { return this._tipo; }
  get categoriaId(): string { return this._categoriaId; }
  get atleticaId(): string { return this._atleticaId; }
  get dataTransacao(): Date { return this._dataTransacao; }
  get observacao(): string | null | undefined { return this._observacao; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withDescricao(descricao: string) { this._descricao = descricao; return this; }
  withValor(valor: number) { this._valor = valor; return this; }
  withObservacao(obs: string | null) { this._observacao = obs; return this; }

  static restore(props?: {
    id?: string;
    descricao: string;
    valor: number;
    tipo: TipoTransacao;
    categoriaId: string;
    atleticaId: string;
    dataTransacao: Date;
    observacao?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Transacao | null {
    if (!props) return null;
    const t = new Transacao(props.id, props.createdAt, props.updatedAt);
    t._descricao = props.descricao;
    t._valor = props.valor;
    t._tipo = props.tipo;
    t._categoriaId = props.categoriaId;
    t._atleticaId = props.atleticaId;
    t._dataTransacao = props.dataTransacao;
    t._observacao = props.observacao ?? null;
    return t;
  }
}
