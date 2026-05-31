import { Injectable, NotFoundException } from "@nestjs/common";
import { PaymentRepository } from "@pagamento/pagamentos/domain/repositories/payment.repository";
import { Payment } from "@pagamento/pagamentos/domain/models/payment.model";

@Injectable()
export class FindPaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(id: string): Promise<Payment> {
    const payment = await this.paymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundException(`Pagamento com id ${id} não encontrado`);
    }

    return payment;
  }
}