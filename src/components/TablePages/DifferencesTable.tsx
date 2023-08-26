import React from "react";
import { roundToDecimals } from "../../functions/roundToDecimals";
import { numberFormat } from "../../constants/number-format.const";
import "./Table.css";
import { PaymentDifference } from "../../interfaces/payment-difference.interface";

interface DifferencesTableProps {
  isFirstPage: boolean;
  isLastPage: boolean;
  paymentDifferences: PaymentDifference[];
  paymentDifferencesTotal: number;
  revisedInstallmentsTotal: number;
  effectiveInstallmentsTotal: number;
  differenceTotal: number;
  isHtml: boolean;
  invertLineColor: boolean;
}

export const DifferencesTable: React.FC<DifferencesTableProps> = ({
  isFirstPage,
  isLastPage,
  paymentDifferences,
  paymentDifferencesTotal,
  revisedInstallmentsTotal,
  effectiveInstallmentsTotal,
  differenceTotal,
  isHtml,
  invertLineColor,
}) => (
  <div className="DifferencesTable">
    {paymentDifferences.length && (
      <table className={isHtml && !isFirstPage ? "hidden-top" : ""}>
        <thead className={isHtml && !isFirstPage ? "hidden" : ""}>
          <tr>
            <th>Nº</th>
            <th>Vencto.</th>
            <th>Valor Corrigido da Prestação</th>
            <th>Valor Pago</th>
            <th>Diferença</th>
            <th>Correção(%)</th>
          </tr>
        </thead>
        <tbody>
          {paymentDifferences.map((d, i) => (
            <tr
              key={d.n}
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
              <td className="padded">{d.n}</td>
              <td>{d.dueDateStr}</td>
              <td>
                {d.revisedInstallment.installmentTotal.toLocaleString(
                  "pt-br",
                  numberFormat
                )}
              </td>
              <td>
                {d.actualInstallment.installmentTotal.toLocaleString(
                  "pt-br",
                  numberFormat
                )}
              </td>
              <td>
                {d.installmentDifference.toLocaleString("pt-br", numberFormat)}
              </td>
              <td>
                {d.installmentDifferencePct.toLocaleString(
                  "pt-br",
                  numberFormat
                )}
              </td>
            </tr>
          ))}
          {(isFirstPage && paymentDifferencesTotal < 15) ||
            (isLastPage && (
              <tr className="totals">
                <td colSpan={2}>
                  <b>Totais</b>
                </td>
                <td>
                  <b>
                    {roundToDecimals(
                      revisedInstallmentsTotal,
                      2
                    ).toLocaleString("pt-br", numberFormat)}
                  </b>
                </td>
                <td>
                  <b>
                    {roundToDecimals(
                      effectiveInstallmentsTotal,
                      2
                    ).toLocaleString("pt-br", numberFormat)}
                  </b>
                </td>
                <td>
                  <b>
                    {roundToDecimals(differenceTotal, 2).toLocaleString(
                      "pt-br",
                      numberFormat
                    )}
                  </b>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    )}
  </div>
);
