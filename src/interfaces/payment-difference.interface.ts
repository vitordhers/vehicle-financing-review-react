import { Payment } from './payment.interface';

export interface PaymentDifference {
  n: number;
  dueDateStr: string;
  revisedInstallment: Payment;
  actualInstallment: Payment;
  installmentDifference: number;
  installmentDifferencePct: number;
}
