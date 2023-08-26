import { getGracePeriod } from "../functions/getGracePeriod.function";
import { banks } from "../interfaces/bank.interface";
import { FirebaseReviewData } from "../interfaces/firebase-review-data.interface";

export class Review {
  uuid: string;
  clientName: string;
  bankDocument: string;
  contractStartDate: Date;
  firstInstallmentDate: Date;
  firstInstallmentValue: number;
  totalLoaned: number;
  installments: number;
  installmentValue: number;
  paidInstallments: number;
  effectiveInterestRate: number;
  private _revisedFirstInstallment = 0;

  constructor(
    uuid: string,
    {
      clientName,
      bankDocument,
      contractStartDate,
      firstInstallmentDate,
      firstInstallmentValue,
      totalLoaned,
      installments,
      installmentValue,
      paidInstallments,
      effectiveInterestRate,
    }: FirebaseReviewData
  ) {
    this.uuid = uuid;

    this.clientName = clientName;
    this.bankDocument = bankDocument;
    this.contractStartDate = contractStartDate.toDate();
    this.firstInstallmentDate = firstInstallmentDate.toDate();
    this.firstInstallmentValue = firstInstallmentValue;
    this.installmentValue = installmentValue;

    this.totalLoaned = totalLoaned;
    this.installments = installments;
    this.paidInstallments = paidInstallments;
    this.effectiveInterestRate = effectiveInterestRate;
  }

  getGracePeriod() {
    return (
      getGracePeriod(this.firstInstallmentDate, this.contractStartDate) - 1
    );
  }

  getBankName() {
    return banks.find((b) => b.document === this.bankDocument)?.name;
  }

  set revisedFirstInstallmentValue(effectiveFirstInstallment: number) {
    this._revisedFirstInstallment = effectiveFirstInstallment;
  }

  get revisedFirstInstallmentValue() {
    return this._revisedFirstInstallment;
  }
}
