import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../Context";
import { doc, getDoc } from "firebase/firestore";
import { Loader } from "../components/Loader/Loader";
import { DocumentMissing } from "../components/MissingDocument/DocumentMissing";
import { FirebaseReviewData } from "../interfaces/firebase-review-data.interface";
import { Payment } from "../interfaces/payment.interface";
import { RevisedOperation } from "../interfaces/revised-operation.interface";
import { banks } from "../interfaces/bank.interface";
import { calculateAmortizingPayments } from "../functions/calculateAmortizingPayments.function";
import { reviseOperation } from "../functions/reviseOperation.function";
import { Review } from "../models/review.model";
import "./CalculationsLog.css";
import FloatingButton from "../components/FloatingButton/FloatingButton";
import { CalculationsContent } from "../components/TablePages/CalculationsContent";
import { DifferencesContent } from "../components/TablePages/DifferencesContent";
import html2canvas from "html2canvas";
import jsPDF, { jsPDFOptions } from "jspdf";

interface CalculationsLogProps {}

export const CalculationsLog: React.FC<CalculationsLogProps> = () => {
  const { uuid } = useParams();
  const { db } = useContext(Context);
  const [isLoading, setIsloading] = useState(true);
  const [review, setReview] = useState<Review | undefined>(undefined);
  const [revisedPayments, setRevisedPayments] = useState<Payment[] | undefined>(
    undefined
  );

  const [isHtml, setIsHtml] = useState(true);

  const [revisedOperation, setRevisedOperation] = useState<
    RevisedOperation | undefined
  >(undefined);

  useEffect(() => {
    if (!uuid) return;
    const docRef = doc(db, "reviews", uuid);

    const fetchDoc = async () => {
      try {
        const snapshot = await getDoc(docRef);
        setIsloading(false);
        if (!snapshot.exists()) {
          throw new Error(`missing doc id ${uuid}`);
        }
        const docData = snapshot.data() as FirebaseReviewData;
        const review: Review = new Review(uuid, docData);
        setReview(review);
      } catch (error) {
        console.error({ error });
      }
    };

    fetchDoc();
  }, [db, uuid]);

  useEffect(() => {
    if (!review) return;
    const {
      bankDocument,
      totalLoaned,
      installments,
      firstInstallmentDate,
      contractStartDate,
      effectiveInterestRate,
      paidInstallments,
    } = review;
    const foundBank = banks.find((bank) => bank.document === bankDocument);
    if (!foundBank) {
      return console.error(`bank ${bankDocument} not found!`);
    }

    const dueDay = firstInstallmentDate.getDate();

    const revisedPayments = calculateAmortizingPayments(
      totalLoaned,
      installments,
      dueDay,
      foundBank.monthlyInterestRate / 100,
      contractStartDate,
      firstInstallmentDate
    );

    const revisedFirstInstallment =
      revisedPayments.find((p) => p.n === 1)?.installmentTotal || 0;
    review.revisedFirstInstallmentValue = revisedFirstInstallment;
    setReview(review);

    setRevisedPayments(revisedPayments);

    const actualPayments = calculateAmortizingPayments(
      totalLoaned,
      installments,
      dueDay,
      effectiveInterestRate,
      contractStartDate,
      firstInstallmentDate
    );

    const revisedOperation = reviseOperation(
      revisedPayments,
      actualPayments,
      installments,
      paidInstallments
    );

    setRevisedOperation(revisedOperation);
  }, [review]);

  const generatePDF = () => {
    setIsHtml(false);
    setTimeout(async () => {
      const options: jsPDFOptions = {
        orientation: "p",
        unit: "mm",
        format: "a4",
      };
      const pdf = new jsPDF(options);
      const elements = document.querySelectorAll('[id^="page"]');
      let index = 0;
      for (const element of elements) {
        if (index !== 0) {
          pdf.addPage();
        }
        const canvas = await html2canvas(element as HTMLElement, {scale: 1.35});
        const imgData = canvas.toDataURL("image/png");
        pdf.addImage(imgData, "JPEG", 0, 0, 0, 0);
        index++;
      }
      pdf.save("download.pdf");
      setIsHtml(true);
    }, 50);
  };

  return (
    <>
      {isLoading && <Loader />}
      {!isLoading && !review && <DocumentMissing />}
      {!isLoading && review && revisedPayments?.length && (
        <>
          <div id="report" className="paper-a4">
            <CalculationsContent
              revisedPayments={revisedPayments}
              review={review}
              isHtml={isHtml}
            />

            {revisedOperation && (
              <DifferencesContent
                revisedOperation={revisedOperation}
                isHtml={isHtml}
              />
            )}
          </div>
          <FloatingButton onClick={generatePDF} />
        </>
      )}
    </>
  );
};
