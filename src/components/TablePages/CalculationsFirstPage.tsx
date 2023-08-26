import React from "react";
import { numberFormat } from "../../constants/number-format.const";
import { Payment } from "../../interfaces/payment.interface";
import { Review } from "../../models/review.model";
import { CalculationsTable } from "./CalculationsTable";

interface CalculationsFirstPageProps {
  revisedPayments: Payment[];
  revisedPaymentsTotal: number;
  review: Review;
  isHtml: boolean;
}

export const CalculationsFirstPage: React.FC<CalculationsFirstPageProps> = ({
  revisedPayments,
  revisedPaymentsTotal,
  review,
  isHtml,
}) => (
  <div >
    <section className="head">
      <p>Antonio Costa</p>
      <p>Endereço</p>
      <p>Telefone</p>
      <p>Email</p>
    </section>
    <h4>Parmâmetros de Cálculo</h4>
    <section className="col-wrapper">
      <div>
        <p>
          <b>Data do contrato:</b>
          {review.contractStartDate.toLocaleDateString("pt-br")}
        </p>
        <p>
          <b>Nome do autor:</b> {review.clientName}
        </p>
        <p>
          <b>Nome do réu:</b> {review.getBankName()}
        </p>
        <p>
          <b>Valor financiado:</b> R${" "}
          {review.totalLoaned.toLocaleString("pt-br", numberFormat)}
        </p>
        <p>
          <b>Nº de Prestações:</b> {review.installments}
        </p>
        <p>
          <b>Período Carência:</b> {review.getGracePeriod()} mês(es)
        </p>
        <p>
          <b>Data da primeira prestação:</b>
          {review.firstInstallmentDate.toLocaleDateString("pt-br")}
        </p>
      </div>
      <div>
        <p>
          <b>Método do cálculo:</b> Table Price
        </p>
        <p>
          <b>Valor original da primeira prestação:</b>
          {review.firstInstallmentValue.toLocaleString("pt-br", numberFormat)}
        </p>
        <p>
          <b>Valor revisado da primeira prestação:</b>
          {review.revisedFirstInstallmentValue.toLocaleString(
            "pt-br",
            numberFormat
          )}
        </p>
        <p>
          <b>Taxa média do juros BACEN:</b> 2.00% a.m.
        </p>
        <p>
          <b>Taxa de juros contratada:</b>
          {review.effectiveInterestRate * 100}% a.m.
        </p>
      </div>
    </section>
    <h3>Cálculo da Prestação Revisada pela Taxa Média</h3>
    <CalculationsTable
      isFirstPage={true}
      isLastPage={false}
      revisedPayments={revisedPayments}
      revisedPaymentsTotal={revisedPaymentsTotal}
      isHtml={isHtml}
      invertLineColor={false}
    />
  </div>
);
