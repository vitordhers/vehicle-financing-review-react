import React from "react";
import { numberFormat } from "../../constants/number-format.const";
import { Payment } from "../../interfaces/payment.interface";
import { Review } from "../../models/review.model";
import { CalculationsTable } from "./CalculationsTable";
import { Typography } from "@mui/material";
import { roundToDecimals } from "../../functions/roundToDecimals";

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
  <div>
    <section className="head">
      <Typography component={"div"} variant={"body2"}>
        Antonio Costa
      </Typography>
      <Typography component={"div"} variant={"body2"}>
        Endereço
      </Typography>
      <Typography component={"div"} variant={"body2"}>
        Telefone
      </Typography>
      <Typography component={"div"} variant={"body2"}>
        Email
      </Typography>
    </section>
    <h4>Parmâmetros de Cálculo</h4>
    <section className="col-wrapper">
      <div>
        <Typography component={"div"} variant={"body2"}>
          <b>Data do contrato:</b>
          {review.contractStartDate.toLocaleDateString("pt-br")}
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Nome do autor:</b> {review.clientName}
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Nome do réu:</b> {review.getBankName()}
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Valor financiado:</b> R${" "}
          {review.totalLoaned.toLocaleString("pt-br", numberFormat)}
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Nº de Prestações:</b> {review.installments}
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Período Carência:</b> {review.getGracePeriod()} mês(es)
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Data da primeira prestação:</b>
          {review.firstInstallmentDate.toLocaleDateString("pt-br")}
        </Typography>
      </div>
      <div>
        <Typography component={"div"} variant={"body2"}>
          <b>Método do cálculo:</b> Table Price
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Valor original da primeira prestação:</b>
          {review.firstInstallmentValue.toLocaleString("pt-br", numberFormat)}
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Valor revisado da primeira prestação:</b>
          {review.revisedFirstInstallmentValue.toLocaleString(
            "pt-br",
            numberFormat
          )}
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Taxa média do juros BACEN:</b> 2.00% a.m.
        </Typography>
        <Typography component={"div"} variant={"body2"}>
          <b>Taxa de juros contratada:</b>
          {roundToDecimals(
            review.effectiveInterestRate * 100,
            2
          ).toLocaleString("pt-br", numberFormat)}
          % a.m.
        </Typography>
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
