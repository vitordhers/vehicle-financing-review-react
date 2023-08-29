import { Payment } from "../interfaces/payment.interface";
import { RevisedOperation } from "../interfaces/revised-operation.interface";
import { mapPaymentDifferences } from "./mapPaymentDifferences.function";

export const reviseOperation = (
  revisedPayments: Payment[],
  actualPayments: Payment[],
  installments: number,
  paidInstallments: number,
  firstInstallmentTotal: number
) => {
  let effectivePayments = [...actualPayments];

  if (paidInstallments !== installments) {
    const lastPaidInstallmentIndex = effectivePayments.findIndex(
      (p) => p.n === paidInstallments
    );

    effectivePayments = actualPayments.map((p, i) => {
      if (i <= lastPaidInstallmentIndex) {
        return p;
      }

      const updatedPayment: Payment = {
        ...p,
        installmentTotal: 0,
      };
      return updatedPayment;
    });
  }
  const paymentDifferences = mapPaymentDifferences(
    revisedPayments,
    effectivePayments
  );

  const revisedInstallmentsTotal = revisedPayments.reduce(
    (prev, curr) => prev + curr.installmentTotal,
    0
  );

  const effectiveInstallmentsTotal = effectivePayments.reduce(
    (prev, curr) => prev + curr.installmentTotal,
    0
  );

  const differenceTotal = paymentDifferences.reduce(
    (prev, curr) => prev + curr.installmentDifference,
    0
  );

  const agreedTotal = installments * firstInstallmentTotal;

  const revisedOperation: RevisedOperation = {
    paymentDifferences,
    revisedInstallmentsTotal: revisedInstallmentsTotal,
    agreedTotal,
    effectiveInstallmentsTotal: effectiveInstallmentsTotal,
    differenceTotal: differenceTotal,
  };

  return revisedOperation;
};
