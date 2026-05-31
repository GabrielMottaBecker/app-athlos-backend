import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@shared/infra/database/drizzle.service";
import { eq } from "drizzle-orm";
import { Payment, PaymentStatus, PaymentType } from "@pagamento/pagamentos/domain/models/payment.model";
import { PaymentRepository } from "@pagamento/pagamentos/domain/repositories/payment.repository";
import { paymentsSchema } from "@pagamento/pagamentos/infra/database/schemas/payment.schema";

@Injectable()
export class DrizzlePaymentRepository implements PaymentRepository {
  constructor(private readonly drizzleService: DrizzleService) {}

  async findAll(): Promise<Payment[]> {
    const rows = await this.drizzleService.db
      .select()
      .from(paymentsSchema);

    return rows.map((row) => this.toEntity(row));
  }

  async findById(id: string): Promise<Payment | null> {
    const result = await this.drizzleService.db
      .select()
      .from(paymentsSchema)
      .where(eq(paymentsSchema.id, id))
      .limit(1);

    return result[0] ? this.toEntity(result[0]) : null;
  }

  async create(payment: Payment): Promise<void> {
    await this.drizzleService.db.insert(paymentsSchema).values({
      type: payment.type,
      status: payment.status,
      amount: payment.amount,
      referenceId: payment.referenceId,
      pixCode: payment.pixCode,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async update(payment: Payment): Promise<void> {
    await this.drizzleService.db
      .update(paymentsSchema)
      .set({
        status: payment.status,
        updatedAt: new Date(),
      })
      .where(eq(paymentsSchema.id, payment.id));
  }

  private toEntity(row: typeof paymentsSchema.$inferSelect): Payment {
    return new Payment(
      row.id,
      row.type as PaymentType,
      row.status as PaymentStatus,
      row.amount,
      row.referenceId,
      row.pixCode,
      row.createdAt!,
      row.updatedAt!,
    );
  }
}