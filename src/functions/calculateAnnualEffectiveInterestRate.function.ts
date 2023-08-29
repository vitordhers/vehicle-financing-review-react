export const calculateAnnualEffectiveInterestRate = (
  monthlyInterestRatePercent: number
) => {
  const annualInterestRate = Math.pow(1 + monthlyInterestRatePercent, 12) - 1;
  return annualInterestRate;
};
