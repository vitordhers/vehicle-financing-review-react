import { Payment } from "../interfaces/payment.interface";
import { getGracePeriod } from "./getGracePeriod.function";
import { roundToDecimals } from "./roundToDecimals";

export const calculateAmortizingPayments = (
  totalLoaned: number,
  installments: number,
  dueDay: number,
  monthlyInterestRate: number,
  contractStartDate: Date,
  firstInstallmentDueDate: Date
): Payment[] => {
  const gracePeriodMonths = getGracePeriod(
    firstInstallmentDueDate,
    contractStartDate
  );

  let gracePeriodInterest = 0;
  if (gracePeriodMonths > 0) {
    gracePeriodInterest = calculateCompoundInterestSum(
      totalLoaned,
      monthlyInterestRate,
      gracePeriodMonths - 1
    );
  }

  const monthlyInstallment = roundToDecimals(
    ((totalLoaned + gracePeriodInterest) *
      (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, installments))) /
      (Math.pow(1 + monthlyInterestRate, installments) - 1),
    2
  );

  let debtBalance = totalLoaned;

  const payments: Payment[] = [];
  for (let n = -gracePeriodMonths + 1; n <= installments; n++) {
    const updatedBalance = debtBalance;
    const interestTotal =
      n === -gracePeriodMonths + 1 ? 0 : debtBalance * monthlyInterestRate;

    // Calculate due date based on contract start date and due day
    const dueDate = new Date(contractStartDate);
    dueDate.setMonth(dueDate.getMonth() + n + gracePeriodMonths - 1);
    dueDate.setDate(dueDay);

    // If the due date is within the grace period, skip payment
    const installmentTotal = n >= 1 ? monthlyInstallment : 0;

    const amortizationTotal = installmentTotal - interestTotal;

    // console.log({ n, interestTotal, amortizationTotal });

    const debtReduction = amortizationTotal;
    debtBalance = debtBalance - debtReduction;

    const payment: Payment = {
      n,
      dueDate,
      updatedBalance: roundToDecimals(updatedBalance, 2),
      installmentTotal: roundToDecimals(installmentTotal, 2),
      interestTotal: roundToDecimals(interestTotal, 2),
      amortizationTotal: n >= 1 ? roundToDecimals(debtReduction, 2) : 0,
      debtBalance: roundToDecimals(debtBalance, 2),
    };

    payments.push(payment);
  }

  return payments;
};

function calculateCompoundInterestSum(
  principal: number,
  rate: number,
  periods: number
) {
  let sum = 0;
  let amount = principal;

  for (let i = 0; i < periods; i++) {
    const interest = amount * rate;
    sum += interest;
    amount += interest;
  }

  return sum;
}
