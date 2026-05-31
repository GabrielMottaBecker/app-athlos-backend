import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PaymentRepository } from "@pagamento/pagamentos/domain/repositories/payment.repository";
import { Payment, PaymentStatus } from "@pagamento/pagamentos/domain/models/payment.model";

@Injectable()
export class ApprovePaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  async execute(id: string): Promise<Payment> {
    const existing = await this.paymentRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Pagamento com id ${id} não encontrado`);
    }

    if (existing.status !== PaymentStatus.PENDENTE) {
      throw new BadRequestException(`Pagamento não pode ser aprovado pois está ${existing.status}`);
    }

    const updated = new Payment(
      existing.id,
      existing.type,
      PaymentStatus.APROVADO,
      existing.amount,
      existing.referenceId,
      existing.pixCode,
      existing.createdAt,
      new Date(),
    );

    await this.paymentRepository.update(updated);

    return updated;
  }
}