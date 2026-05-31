import { Injectable } from "@nestjs/common";
import { PaymentRepository } from "@pagamento/pagamentos/domain/repositories/payment.repository";
import { Payment } from "@pagamento/pagamentos/domain/models/payment.model";

@Injectable()
export class ListPaymentsService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(): Promise<Payment[]> {
    return this.paymentRepository.findAll();
  }
}