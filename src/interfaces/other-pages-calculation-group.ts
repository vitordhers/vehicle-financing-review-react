import { Payment } from "./payment.interface";

export interface OtherPagesCalculationGroup {
  revisedPayments: Payment[];
  isLastPage: boolean;
}
