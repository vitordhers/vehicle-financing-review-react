import { CalculationsContentProps } from "../components/TablePages/CalculationsContent";
import { OtherPagesCalculationGroup } from "../interfaces/other-pages-calculation-group";
import { CalculationsFirstPage } from "../components/TablePages/CalculationsFirstPage";
import { CalculationsOtherPage } from "../components/TablePages/CalculationsTableOtherPage";
import { styles } from "../constants/pdf-page-styles.const";
import { Page } from "@react-pdf/renderer";

export const mapCalculationContentToPages = ({
  revisedPayments,
  review,
}: CalculationsContentProps) => {
  const pages: JSX.Element[] = [];
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
      };
      if (group.revisedPayments.length) {
        otherPagesGroups.push(group);
      }
    }
  }

  pages.push(
    <Page style={styles.page}>
      <CalculationsFirstPage
        revisedPayments={firstPagePayments}
        review={review}
        revisedPaymentsTotal={revisedPayments.length + 1}
        isHtml={false}
      />  
    </Page>
  );

  otherPagesGroups.forEach((g, i) => {
    pages.push(
      <Page style={styles.page}>
        <CalculationsOtherPage
          revisedPayments={g.revisedPayments}
          isLastPage={g.isLastPage}
          revisedPaymentsTotal={revisedPayments.length + 1}
          isHtml={false}
          invertLineColor={i % 2 === 0}
        />
      </Page>
    );
  });

  return pages;
};
