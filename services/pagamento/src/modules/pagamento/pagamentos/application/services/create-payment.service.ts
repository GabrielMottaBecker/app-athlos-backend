import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "@pagamento/pagamentos/domain/repositories/payment.repository";
import { CreatePaymentDto } from "@pagamento/pagamentos/application/dto/create-payment.dto";
import { Payment, PaymentStatus, PaymentType } from "@pagamento/pagamentos/domain/models/payment.model";
import { randomUUID } from "crypto";

@Injectable()
export class CreatePaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(dto: CreatePaymentDto): Promise<Payment> {
    const pixCode = `PIX-${randomUUID().toUpperCase()}`;

    const payment = new Payment(
      randomUUID(),
      dto.type as PaymentType,
      PaymentStatus.PENDENTE,
      dto.amount,
      dto.referenceId,
      pixCode,
      new Date(),
      new Date(),
    );

    await this.paymentRepository.create(payment);

    return payment;
  }
}