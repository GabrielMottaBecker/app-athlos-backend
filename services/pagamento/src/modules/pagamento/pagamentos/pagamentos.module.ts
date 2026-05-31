import { Module } from "@nestjs/common";
import { SharedModule } from "@shared/shared.module";
import { PaymentController } from "@pagamento/pagamentos/infra/controllers/payment.controller";
import { PaymentRepository } from "@pagamento/pagamentos/domain/repositories/payment.repository";
import { DrizzlePaymentRepository } from "@pagamento/pagamentos/infra/repositories/drizzle-payment.repository";
import { CreatePaymentService } from "@pagamento/pagamentos/application/services/create-payment.service";
import { ListPaymentsService } from "@pagamento/pagamentos/application/services/list-payments.service";
import { FindPaymentService } from "@pagamento/pagamentos/application/services/find-payment.service";
import { ApprovePaymentService } from "@pagamento/pagamentos/application/services/approve-payment.service";
import { CancelPaymentService } from "@pagamento/pagamentos/application/services/cancel-payment.service";

@Module({
  imports: [SharedModule],
  controllers: [PaymentController],
  providers: [
    CreatePaymentService,
    ListPaymentsService,
    FindPaymentService,
    ApprovePaymentService,
    CancelPaymentService,
    {
      provide: PaymentRepository,
      useClass: DrizzlePaymentRepository,
    },
  ],
})
export class PagamentosModule {}