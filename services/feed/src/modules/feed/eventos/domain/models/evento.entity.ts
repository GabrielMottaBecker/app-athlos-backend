export enum TipoEvento {
  TREINO = "TREINO",
  EVENTO_SOCIAL = "EVENTO SOCIAL",
  EXTRAS = "EXTRAS",
  COMPETICAO = "COMPETICAO",
  AVISO = "AVISO",
}

export class Evento {
  private readonly _id?: string;
  private _title!: string;
  private _date!: string;
  private _type!: TipoEvento;
  private _typeColor!: number;
  private _time!: string;
  private _place!: string;
  private _bgColor!: number;
  private _atleticaId!: string;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get title(): string { return this._title; }
  get date(): string { return this._date; }
  get type(): TipoEvento { return this._type; }
  get typeColor(): number { return this._typeColor; }
  get time(): string { return this._time; }
  get place(): string { return this._place; }
  get bgColor(): number { return this._bgColor; }
  get atleticaId(): string { return this._atleticaId; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  withTitle(title: string) { this._title = title; return this; }
  withDate(date: string) { this._date = date; return this; }
  withType(type: TipoEvento) { this._type = type; return this; }
  withTypeColor(typeColor: number) { this._typeColor = typeColor; return this; }
  withTime(time: string) { this._time = time; return this; }
  withPlace(place: string) { this._place = place; return this; }
  withBgColor(bgColor: number) { this._bgColor = bgColor; return this; }

  static restore(props?: {
    id?: string;
    title: string;
    date: string;
    type: TipoEvento;
    typeColor: number;
    time: string;
    place: string;
    bgColor: number;
    atleticaId: string;
    createdAt?: Date;
    updatedAt?: Date;
  }): Evento | null {
    if (!props) return null;

    const evento = new Evento(props.id, props.createdAt, props.updatedAt);
    evento._title = props.title;
    evento._date = props.date;
    evento._type = props.type;
    evento._typeColor = props.typeColor;
    evento._time = props.time;
    evento._place = props.place;
    evento._bgColor = props.bgColor;
    evento._atleticaId = props.atleticaId;

    return evento;
  }
}