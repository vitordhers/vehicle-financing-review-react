export interface Payment {
  n: number; // installment number
  dueDate: Date;
  updatedBalance: number;
  installmentTotal: number;
  interestTotal: number;
  amortizationTotal: number;
  debtBalance: number;
}
