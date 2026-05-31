import { StatusProduto } from "./status-produto.enum";

export class Produto {
  private readonly _id?: string;
  private _nome!: string;
  private _descricao!: string;
  private _preco!: number;
  private _estoque!: number;
  private _status!: StatusProduto;
  private _atleticaId!: string;
  private _imagemUrl?: string | null;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get nome(): string { return this._nome; }
  get descricao(): string { return this._descricao; }
  get preco(): number { return this._preco; }
  get estoque(): number { return this._estoque; }
  get status(): StatusProduto { return this._status; }
  get atleticaId(): string { return this._atleticaId; }
  get imagemUrl(): string | null | undefined { return this._imagemUrl; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withNome(nome: string) { this._nome = nome; return this; }
  withDescricao(descricao: string) { this._descricao = descricao; return this; }
  withPreco(preco: number) { this._preco = preco; return this; }
  withEstoque(estoque: number) { this._estoque = estoque; return this; }
  withStatus(status: StatusProduto) { this._status = status; return this; }
  withImagemUrl(url: string | null) { this._imagemUrl = url; return this; }

  diminuirEstoque(quantidade: number): void {
    if (quantidade > this._estoque) throw new Error("Estoque insuficiente");
    this._estoque -= quantidade;
    if (this._estoque === 0) this._status = StatusProduto.ESGOTADO;
  }

  static restore(props?: {
    id?: string;
    nome: string;
    descricao: string;
    preco: number;
    estoque: number;
    status: StatusProduto;
    atleticaId: string;
    imagemUrl?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }): Produto | null {
    if (!props) return null;
    const p = new Produto(props.id, props.createdAt, props.updatedAt);
    p._nome = props.nome;
    p._descricao = props.descricao;
    p._preco = props.preco;
    p._estoque = props.estoque;
    p._status = props.status;
    p._atleticaId = props.atleticaId;
    p._imagemUrl = props.imagemUrl ?? null;
    return p;
  }
}
