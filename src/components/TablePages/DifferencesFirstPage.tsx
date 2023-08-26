import React from "react";
import { DifferencesTable } from "./DifferencesTable";
import { PaymentDifference } from "../../interfaces/payment-difference.interface";

interface DifferencesFirstPageProps {
  paymentDifferences: PaymentDifference[];
  paymentDifferencesTotal: number;
  isHtml: boolean;
  revisedInstallmentsTotal: number;
  effectiveInstallmentsTotal: number;
  differenceTotal: number;
}

export const DifferencesFirstPage: React.FC<DifferencesFirstPageProps> = ({
  paymentDifferences,
  paymentDifferencesTotal,
  isHtml,
  revisedInstallmentsTotal,
  effectiveInstallmentsTotal,
  differenceTotal,
}) => (
  <div className="DifferencesFirstPage">
    <h3>Relatório das Diferenças</h3>
    <DifferencesTable
      isFirstPage={true}
      isLastPage={false}
      paymentDifferences={paymentDifferences}
      paymentDifferencesTotal={paymentDifferencesTotal}
      isHtml={isHtml}
      revisedInstallmentsTotal={revisedInstallmentsTotal}
      effectiveInstallmentsTotal={effectiveInstallmentsTotal}
      differenceTotal={differenceTotal}
      invertLineColor={false}
    />
  </div>
);
