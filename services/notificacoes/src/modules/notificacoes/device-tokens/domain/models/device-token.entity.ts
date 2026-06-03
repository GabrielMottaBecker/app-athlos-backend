import { DevicePlatform } from "./device-platform.enum";

export class DeviceToken {
  private readonly _id?: string;
  private _usuarioId!: string;
  private _atleticaId!: string;
  private _token!: string;
  private _platform!: DevicePlatform;
  private _ativo!: boolean;
  private readonly _createdAt?: Date;
  private readonly _updatedAt?: Date;

  private constructor(id?: string, createdAt?: Date, updatedAt?: Date) {
    this._id = id;
    this._createdAt = createdAt;
    this._updatedAt = updatedAt;
  }

  get id(): string | undefined { return this._id; }
  get usuarioId(): string { return this._usuarioId; }
  get atleticaId(): string { return this._atleticaId; }
  get token(): string { return this._token; }
  get platform(): DevicePlatform { return this._platform; }
  get ativo(): boolean { return this._ativo; }
  get createdAt(): Date | undefined { return this._createdAt; }
  get updatedAt(): Date | undefined { return this._updatedAt; }

  static restore(props?: {
    id?: string;
    usuarioId: string;
    atleticaId: string;
    token: string;
    platform: DevicePlatform;
    ativo: boolean;
    createdAt?: Date;
    updatedAt?: Date;
  }): DeviceToken | null {
    if (!props) return null;

    const deviceToken = new DeviceToken(props.id, props.createdAt, props.updatedAt);
    deviceToken._usuarioId = props.usuarioId;
    deviceToken._atleticaId = props.atleticaId;
    deviceToken._token = props.token;
    deviceToken._platform = props.platform;
    deviceToken._ativo = props.ativo;
    return deviceToken;
  }
}
