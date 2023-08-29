import React from "react";
import { Payment } from "../../interfaces/payment.interface";
import { Review } from "../../models/review.model";
import { CalculationsFirstPage } from "./CalculationsFirstPage";
import { CalculationsOtherPage } from "./CalculationsTableOtherPage";

export interface CalculationsContentProps {
  revisedPayments: Payment[];
  review: Review;
  isHtml: boolean;
}

export const CalculationsContent: React.FC<CalculationsContentProps> = ({
  revisedPayments,
  review,
  isHtml,
}) => {
  const hasOtherPages = revisedPayments.length >= 15;

  const revisedPaymentsClone = [...revisedPayments];
  const firstPagePayments = revisedPaymentsClone.splice(0, 15);

  const otherPagesGroups: OtherPagesCalculationGroup[] = [];
  if (hasOtherPages) {
    for (let i = 0; i < revisedPayments.length; i += 36) {
      const groupRevisedPayments = revisedPaymentsClone.slice(i, i + 36);
      const isLastPage = revisedPaymentsClone.length <= i + 36;
      const group: OtherPagesCalculationGroup = {
        revisedPayments: groupRevisedPayments,
        isLastPage,
        key: `key-${i}`,
      };
      if (group.revisedPayments.length) {
        otherPagesGroups.push(group);
      }
    }
  }

  return (
    <>
      <div id="page-calculations1-1" className={`${isHtml ? "" : "pdf"}`}>
        <CalculationsFirstPage
          revisedPayments={firstPagePayments}
          review={review}
          revisedPaymentsTotal={revisedPayments.length + 1}
          isHtml={isHtml}
        />
      </div>

      {hasOtherPages &&
        otherPagesGroups.map((g, i) => (
          <div
            key={g.key}
            id={`page-calculations-1-${i + 1}`}
            className={`${isHtml ? "" : "pdf"}`}
          >
            <CalculationsOtherPage
              revisedPayments={g.revisedPayments}
              isLastPage={g.isLastPage}
              revisedPaymentsTotal={revisedPayments.length + 1}
              isHtml={isHtml}
              invertLineColor={i % 2 === 0}
            />
          </div>
        ))}
    </>
  );
};

interface OtherPagesCalculationGroup {
  revisedPayments: Payment[];
  isLastPage: boolean;
  key: string;
}
