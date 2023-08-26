import { Timestamp } from "firebase/firestore";

export interface FirebaseReviewData {
  clientName: string;
  bankDocument: string;
  contractStartDate: Timestamp;
  firstInstallmentDate: Timestamp;
  firstInstallmentValue: number;
  totalLoaned: number;
  installments: number;
  installmentValue: number;
  paidInstallments: number;
  effectiveInterestRate: number;
}
