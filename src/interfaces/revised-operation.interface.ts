import { PaymentDifference } from './payment-difference.interface';

export interface RevisedOperation {
  paymentDifferences: PaymentDifference[];
  revisedInstallmentsTotal: number;
  agreedTotal: number;
  effectiveInstallmentsTotal: number;
  differenceTotal: number;
}
