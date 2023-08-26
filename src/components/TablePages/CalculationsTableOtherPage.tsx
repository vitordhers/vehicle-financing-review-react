import React from "react";
import { Payment } from "../../interfaces/payment.interface";
import { CalculationsTable } from "./CalculationsTable";

interface CalculationsOtherPageProps {
  revisedPayments: Payment[];
  isLastPage: boolean;
  revisedPaymentsTotal: number;
  isHtml: boolean;
  invertLineColor: boolean;
}

export const CalculationsOtherPage: React.FC<CalculationsOtherPageProps> = ({
  revisedPayments,
  isLastPage,
  revisedPaymentsTotal,
  isHtml,
  invertLineColor,
}) => {
  return (
    <CalculationsTable
      isFirstPage={false}
      isLastPage={isLastPage}
      revisedPayments={revisedPayments}
      revisedPaymentsTotal={revisedPaymentsTotal}
      isHtml={isHtml}
      invertLineColor={invertLineColor}
    />
  );
};
