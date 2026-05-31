import { Payment } from '../models/payment.model';

export abstract class PaymentRepository {
  abstract findAll(): Promise<Payment[]>;
  abstract findById(id: string): Promise<Payment | null>;
  abstract create(payment: Payment): Promise<void>;
  abstract update(payment: Payment): Promise<void>;
}