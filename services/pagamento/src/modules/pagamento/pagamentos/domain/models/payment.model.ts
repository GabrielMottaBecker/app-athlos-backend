export enum PaymentStatus {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  CANCELADO = 'CANCELADO',
}

export enum PaymentType {
  PEDIDO = 'PEDIDO',
  MENSALIDADE = 'MENSALIDADE',
}

export class Payment {
  constructor(
    public readonly id: string,
    public readonly type: PaymentType,
    public readonly status: PaymentStatus,
    public readonly amount: number,
    public readonly referenceId: string,
    public readonly pixCode: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}