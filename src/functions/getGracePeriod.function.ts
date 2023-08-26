import { MONTH_IN_MS } from "../constants/one-month-ms.cont";

export const getGracePeriod = (
  firstInstallmentDueDate: Date,
  contractStartDate: Date
) => {
  return Math.max(
    0,
    Math.floor(
      (firstInstallmentDueDate.getTime() - contractStartDate.getTime()) /
        MONTH_IN_MS
    )
  );
};
