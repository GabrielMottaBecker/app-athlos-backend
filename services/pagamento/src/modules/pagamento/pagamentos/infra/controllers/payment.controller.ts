import {
  Controller, Get, Post, Patch,
  Body, Param,
} from "@nestjs/common";
import { CreatePaymentService } from "@pagamento/pagamentos/application/services/create-payment.service";
import { ListPaymentsService } from "@pagamento/pagamentos/application/services/list-payments.service";
import { FindPaymentService } from "@pagamento/pagamentos/application/services/find-payment.service";
import { ApprovePaymentService } from "@pagamento/pagamentos/application/services/approve-payment.service";
import { CancelPaymentService } from "@pagamento/pagamentos/application/services/cancel-payment.service";
import { CreatePaymentDto } from "@pagamento/pagamentos/application/dto/create-payment.dto";
import { Public } from "@shared/infra/decorators/public.decorator";

@Public()
@Controller('pagamentos')
export class PaymentController {
  constructor(
    private readonly createPaymentService: CreatePaymentService,
    private readonly listPaymentsService: ListPaymentsService,
    private readonly findPaymentService: FindPaymentService,
    private readonly approvePaymentService: ApprovePaymentService,
    private readonly cancelPaymentService: CancelPaymentService,
  ) {}

  @Get()
  async findAll() {
    return this.listPaymentsService.execute();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.findPaymentService.execute(id);
  }

  @Post()
  async create(@Body() dto: CreatePaymentDto) {
    return this.createPaymentService.execute(dto);
  }

  @Patch(':id/aprovar')
  async approve(@Param('id') id: string) {
    return this.approvePaymentService.execute(id);
  }

  @Patch(':id/cancelar')
  async cancel(@Param('id') id: string) {
    return this.cancelPaymentService.execute(id);
  }
}