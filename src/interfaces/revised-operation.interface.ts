import { PaymentDifference } from './payment-difference.interface';

export interface RevisedOperation {
  paymentDifferences: PaymentDifference[];
  revisedInstallmentsTotal: number;
  effectiveInstallmentsTotal: number;
  differenceTotal: number;
}
