import { PaymentDifference } from "../interfaces/payment-difference.interface";
import { Payment } from "../interfaces/payment.interface";

export const mapPaymentDifferences = (
  revisedPayments: Payment[],
  actualPayments: Payment[]
) => {
  return revisedPayments.map((p, i) => {
    const installmentDifferencePct =
      actualPayments[i].installmentTotal > 0
        ? (Math.abs(actualPayments[i].installmentTotal - p.installmentTotal) /
            actualPayments[i].installmentTotal) *
          100
        : 0;

    const result: PaymentDifference = {
      n: i + 1,
      dueDateStr: p.dueDate.toLocaleDateString("pt-BR"),
      revisedInstallment: p,
      actualInstallment: actualPayments[i],
      installmentDifference: actualPayments[i].installmentTotal
        ? actualPayments[i].installmentTotal - p.installmentTotal
        : 0,
      installmentDifferencePct,
    };
    return result;
  });
};
