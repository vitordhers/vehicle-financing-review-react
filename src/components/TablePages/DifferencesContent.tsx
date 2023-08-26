import React from "react";
import { RevisedOperation } from "../../interfaces/revised-operation.interface";
import { DifferencesFirstPage } from "./DifferencesFirstPage";
import { PaymentDifference } from "../../interfaces/payment-difference.interface";
import { DifferencesOtherPage } from "./DifferencesOtherPage";

export interface DifferencesContentProps {
  revisedOperation: RevisedOperation;
  isHtml: boolean;
}

export const DifferencesContent: React.FC<DifferencesContentProps> = ({
  revisedOperation,
  isHtml
}) => {
  const { paymentDifferences } = revisedOperation;
  const hasOtherPages = paymentDifferences.length >= 15;

  const paymentDifferencesClone = [...paymentDifferences];
  const firstPageDifferences = paymentDifferencesClone.splice(0, 15);

  const otherPagesGroups: OtherPagesDifferenceGroup[] = [];
  if (hasOtherPages) {
    for (let i = 0; i < paymentDifferences.length; i += 36) {
      const groupRevisedDifferences = paymentDifferencesClone.slice(i, i + 36);
      const isLastPage = paymentDifferencesClone.length <= i + 36;
      const group: OtherPagesDifferenceGroup = {
        paymentDifferences: groupRevisedDifferences,
        isLastPage,
      };
      if (group.paymentDifferences.length) {
        otherPagesGroups.push(group);
      }
    }
  }

  return (
    <>
      <DifferencesFirstPage
        paymentDifferences={firstPageDifferences}
        paymentDifferencesTotal={paymentDifferences.length + 1}
        isHtml={isHtml}
        revisedInstallmentsTotal={revisedOperation.revisedInstallmentsTotal}
        effectiveInstallmentsTotal={revisedOperation.effectiveInstallmentsTotal}
        differenceTotal={revisedOperation.differenceTotal}
      />

      {hasOtherPages &&
        otherPagesGroups.map((g, i) => (
          <DifferencesOtherPage
            key={i}
            paymentDifferences={g.paymentDifferences}
            isLastPage={g.isLastPage}
            paymentDifferencesTotal={paymentDifferences.length + 1}
            isHtml={isHtml}
            invertLineColor={i % 2 === 0}
            revisedInstallmentsTotal={revisedOperation.revisedInstallmentsTotal}
            effectiveInstallmentsTotal={
              revisedOperation.effectiveInstallmentsTotal
            }
            differenceTotal={revisedOperation.differenceTotal}
          />
        ))}
    </>
  );
};

interface OtherPagesDifferenceGroup {
  paymentDifferences: PaymentDifference[];
  isLastPage: boolean;
}
