import React from "react";
import { PaymentDifference } from "../../interfaces/payment-difference.interface";
import { DifferencesTable } from "./DifferencesTable";

interface CalculationsOtherPageProps {
  paymentDifferences: PaymentDifference[];
  paymentDifferencesTotal: number;
  isLastPage: boolean;
  isHtml: boolean;
  invertLineColor: boolean;
  revisedInstallmentsTotal: number;
  effectiveInstallmentsTotal: number;
  differenceTotal: number;
}

export const DifferencesOtherPage: React.FC<CalculationsOtherPageProps> = ({
  paymentDifferences,
  paymentDifferencesTotal,
  isLastPage,
  isHtml,
  invertLineColor,
  revisedInstallmentsTotal,
  effectiveInstallmentsTotal,
  differenceTotal,
}) => (
  <div className="DifferencesOther">
    <DifferencesTable
      isFirstPage={false}
      isLastPage={isLastPage}
      paymentDifferences={paymentDifferences}
      paymentDifferencesTotal={paymentDifferencesTotal}
      isHtml={isHtml}
      revisedInstallmentsTotal={revisedInstallmentsTotal}
      effectiveInstallmentsTotal={effectiveInstallmentsTotal}
      differenceTotal={differenceTotal}
      invertLineColor={invertLineColor}
    />
  </div>
);
