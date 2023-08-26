import React from "react";
import { roundToDecimals } from "../../functions/roundToDecimals";
import { numberFormat } from "../../constants/number-format.const";
import { Payment } from "../../interfaces/payment.interface";
import "./Table.css";


interface CalculationsTableProps {
  isFirstPage: boolean;
  isLastPage: boolean;
  revisedPayments: Payment[];
  revisedPaymentsTotal: number;
  isHtml: boolean;
  invertLineColor: boolean;
}

export const CalculationsTable: React.FC<CalculationsTableProps> = ({
  isFirstPage,
  isLastPage,
  revisedPayments,
  revisedPaymentsTotal,
  isHtml,
  invertLineColor,
}) => (
  <div className="CalculationsTable">
    {revisedPayments.length && (
      <table className={isHtml && !isFirstPage ? "hidden-top" : ""}>
        <thead className={isHtml && !isFirstPage ? "hidden" : ""}>
          <tr>
            <th>Nº</th>
            <th>Vencto.</th>
            <th>Saldo atualizado</th>
            <th>Valor da Prestação</th>
            <th>Valor dos Juros</th>
            <th>Valor da Amortização</th>
            <th>Saldo Devedor</th>
          </tr>
        </thead>
        <tbody>
          {revisedPayments.map((p, i) => (
            <tr
              key={p.n}
              className={
                !invertLineColor
                  ? i % 2 === 0
                    ? "white-tr"
                    : "green-tr"
                  : i % 2 === 0
                  ? "green-tr"
                  : "white-tr"
              }
            >
              <td className="padded">{p.n}</td>
              <td>{p.dueDate.toLocaleDateString("pt-br")}</td>
              <td>{p.updatedBalance.toLocaleString("pt-br", numberFormat)}</td>
              <td>
                {p.installmentTotal.toLocaleString("pt-br", numberFormat)}
              </td>
              <td>{p.interestTotal.toLocaleString("pt-br", numberFormat)}</td>
              <td>
                {p.amortizationTotal.toLocaleString("pt-br", numberFormat)}
              </td>
              <td>{p.debtBalance.toLocaleString("pt-br", numberFormat)}</td>
            </tr>
          ))}
          {(isFirstPage && revisedPaymentsTotal < 15) ||
            (isLastPage && (
              <tr className="totals">
                <td colSpan={3}>
                  <b>Totais</b>
                </td>
                <td>
                  <b>
                    {roundToDecimals(
                      revisedPayments.reduce(
                        (prev, p) => prev + p.installmentTotal,
                        0
                      ),
                      2
                    ).toLocaleString("pt-br", numberFormat)}
                  </b>
                </td>
                <td>
                  <b>
                    {roundToDecimals(
                      revisedPayments.reduce(
                        (prev, p) => prev + p.interestTotal,
                        0
                      ),
                      2
                    ).toLocaleString("pt-br", numberFormat)}
                  </b>
                </td>
                <td>
                  <b>
                    {roundToDecimals(
                      revisedPayments.reduce(
                        (prev, p) => prev + p.amortizationTotal,
                        0
                      ),
                      2
                    ).toLocaleString("pt-br", numberFormat)}
                  </b>
                </td>
                <td></td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
  </div>
);
