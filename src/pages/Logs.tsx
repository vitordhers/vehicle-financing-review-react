import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Context } from "../Context";
import { Timestamp, doc, getDoc } from "firebase/firestore";
import { Loader } from "../components/Loader/Loader";
import { DocumentMissing } from "../components/MissingDocument/DocumentMissing";
import { FirebaseReviewData } from "../interfaces/firebase-review-data.interface";
import { Payment } from "../interfaces/payment.interface";
import { RevisedOperation } from "../interfaces/revised-operation.interface";
import { Bank, banks } from "../interfaces/bank.interface";
import { calculateAmortizingPayments } from "../functions/calculateAmortizingPayments.function";
import { reviseOperation } from "../functions/reviseOperation.function";
import { Review } from "../models/review.model";
import "./Logs.css";
import FloatingButton from "../components/FloatingButton/FloatingButton";
import { CalculationsContent } from "../components/TablePages/CalculationsContent";
import { DifferencesContent } from "../components/TablePages/DifferencesContent";
import html2canvas from "html2canvas";
import jsPDF, { jsPDFOptions } from "jspdf";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import { calculateAnnualEffectiveInterestRate } from "../functions/calculateAnnualEffectiveInterestRate.function";
import { roundToDecimals } from "../functions/roundToDecimals";
import { numberFormat } from "../constants/number-format.const";
import { createTheme, ThemeProvider } from "@mui/material/styles";
const theme = createTheme({
  palette: {
    primary: {
      main: "#6D712E", // Change this to your desired primary color
    },
    secondary: {
      main: "#bada55", // Change this to your desired secondary color
    },
  },
});

interface LogsProps {}

export const Logs: React.FC<LogsProps> = () => {
  const { uuid } = useParams();
  const { db } = useContext(Context);
  const [isLoading, setIsloading] = useState(true);
  const [review, setReview] = useState<Review | undefined>(undefined);
  const [revisedPayments, setRevisedPayments] = useState<Payment[] | undefined>(
    undefined
  );

  const [referenceInterestRate, setReferenceInterestRate] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);

  const handleChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue);
  };

  const [defendant, setDefendant] = useState<Bank | undefined>(undefined);

  useEffect(() => {
    if (!review) return;
    const foundDefendant = banks.find(
      (b) => b.document === review.bankDocument
    );
    setDefendant(foundDefendant);
  }, [review]);

  const [isHtml, setIsHtml] = useState(true);

  const [revisedOperation, setRevisedOperation] = useState<
    RevisedOperation | undefined
  >(undefined);

  useEffect(() => {
    if (!uuid) return;
    const reviewsDocRef = doc(db, "reviews", uuid);

    const fetchDoc = async () => {
      try {
        const snapshot = await getDoc(reviewsDocRef);
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
    const interestRateDocRef = doc(db, "interest_rate", "1");

    const fetchDoc = async () => {
      try {
        const snapshot = await getDoc(interestRateDocRef);
        setIsloading(false);
        if (!snapshot.exists()) {
          throw new Error(`missing doc id`);
        }
        const docData = snapshot.data() as {
          interestRateReference: number;
          updatedAt: Timestamp;
        };

        setReferenceInterestRate(docData.interestRateReference / 100);
      } catch (error) {
        console.error({ error });
      }
    };

    fetchDoc();
  }, [db]);

  useEffect(() => {
    if (!review || !referenceInterestRate) return;
    const {
      totalLoaned,
      installments,
      firstInstallmentDate,
      contractStartDate,
      effectiveInterestRate,
      paidInstallments,
      firstInstallmentValue,
    } = review;

    const dueDay = firstInstallmentDate.getDate();

    const revisedPayments = calculateAmortizingPayments(
      totalLoaned,
      installments,
      dueDay,
      referenceInterestRate,
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
      paidInstallments,
      firstInstallmentValue
    );

    setRevisedOperation(revisedOperation);
  }, [review, referenceInterestRate]);

  const generatePDF = () => {
    setIsHtml(false);
    setTimeout(async () => {
      const options: jsPDFOptions = {
        orientation: "p",
        unit: "mm",
        format: "a4",
      };
      let logIdentifier = "calculations";
      switch (tabIndex) {
        case 0:
          logIdentifier = "calculations";
          break;
        case 1:
          logIdentifier = "petition";
          break;
        case 2:
          logIdentifier = "technical-report";
          break;
        default:
          logIdentifier = "calculations";
          break;
      }
      const pdf = new jsPDF(options);
      const elements = document.querySelectorAll(
        `[id^="page-${logIdentifier}"]`
      );
      let index = 0;
      for (const element of elements) {
        if (index !== 0) {
          pdf.addPage();
        }
        const canvas = await html2canvas(element as HTMLElement, {
          scale: 1.35,
        });
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
            <Box sx={{ borderBottom: 1, borderColor: "divider", padding: 0 }}>
              <ThemeProvider theme={theme}>
                <Tabs
                  indicatorColor="secondary"
                  value={tabIndex}
                  onChange={handleChange}
                >
                  <Tab label="Cálculo Completo" {...a11yProps(0)} />
                  <Tab label="Petição Completa" {...a11yProps(1)} />
                  <Tab label="Parecer Técnico" {...a11yProps(2)} />
                </Tabs>
              </ThemeProvider>
            </Box>
            <CustomTabPanel value={tabIndex} index={0}>
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
            </CustomTabPanel>
            <CustomTabPanel value={tabIndex} index={1}>
              {defendant &&
                referenceInterestRate &&
                revisedPayments?.length &&
                revisedOperation && (
                  <div>
                    <div id="page-petition-0-1">
                      <p>
                        EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO
                        DA ___ VARA CÍVEL DA COMARCA DE _______.
                      </p>
                      <p>
                        {review.clientName.toUpperCase()}, brasileiro(a),
                        portador(a) do CPF sob nº ___.____.___-__, residente e
                        domiciliado(a) no endereço
                        _______________________________________________________,
                        vem, por seus advogados conforme procuração em anexo, à
                        presença de Vossa Excelência, propor
                        <span>AÇÃO REVISIONAL C/C TUTELA DE URGENCIA</span>
                        em face de {defendant.name.toUpperCase()}, pessoa
                        jurídica de direito privado, devidamente inscrita no
                        CNPJ sob o nº
                        {defendant.document}, com sede no endereço{" "}
                        {defendant.address.toUpperCase()}, em{" "}
                        {review.contractStartDate.toLocaleDateString("pt-br")},
                        pelos fatos e fundamentos a seguir apresentados:
                      </p>
                      <h5>I. DA SINOPSE FÁTICA</h5>
                      <p>
                        A parte Autora e o Banco Réu celebraram contrato
                        bancário, na modalidade aquisição de veículo, na data de
                        {review.contractStartDate.toLocaleDateString("pt-br")} .
                        O valor do crédito concedido foi de R${" "}
                        {roundToDecimals(review.totalLoaned, 2).toLocaleString(
                          "pt-br"
                        )}
                        , já inclusos impostos e taxas administrativas.
                      </p>
                      <p>
                        As partes pactuaram que o pagamento deveria ser
                        realizado em
                        {review.installments} parcelas fixas, mensais e
                        sucessivas, cada uma no valor R$
                        {roundToDecimals(
                          review.firstInstallmentValue,
                          2
                        ).toLocaleString("pt-br", numberFormat)}
                        totalizando um Custo Efetivo Total da operação no valor
                        de R$
                        {roundToDecimals(
                          revisedOperation.agreedTotal,
                          2
                        ).toLocaleString("pt-br", numberFormat)}
                      </p>
                      <p>
                        O instrumento particular de crédito firmado entre as
                        partes apresenta, a taxa nominal de juros de{" "}
                        {roundToDecimals(review.effectiveInterestRate * 100, 2)}{" "}
                        %a.m. e{" "}
                        {roundToDecimals(
                          calculateAnnualEffectiveInterestRate(
                            referenceInterestRate
                          ) * 100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % a.a.
                      </p>
                      <p>
                        Ocorre que determinada taxa de juros remuneratórios
                        imposta pelo banco réu está é abusiva, uma vez que a
                        mesma está em considerável discrepância da taxa média do
                        mercado financeiro, segundo o Bacen, para a mesma
                        operação de crédito, à época da celebração do
                        instrumento particular.
                      </p>
                      <p>
                        A época da celebração do contrato de crédito entre as
                        partes, 01 de junho de 2023, a taxa média do mercado
                        financeiro, segundo o Bacen, para a respectiva operação
                        de crédito era de{" "}
                        {roundToDecimals(referenceInterestRate * 100, 2)} % ao
                        mês e{" "}
                        {roundToDecimals(
                          calculateAnnualEffectiveInterestRate(
                            referenceInterestRate
                          ) * 100,
                          2
                        )}{" "}
                        % ao ano, ou seja, valor bem menor do que o pactuado.
                      </p>
                      <p>
                        Para fins de comprovação da taxa média de juros
                        remuneratórios para respectiva operação de crédito,
                        segundo o Banco Central, basta uma consulta simples no
                        portal eletrônico
                        (https://www3.bcb.gov.br/sgspub/localizarseries/localizarSeries.do?method=prepararTelaLocalizarSeries),
                        utilizando-se dos seguintes códigos de pesquisa: 25471
                        para taxa média mensal, ou ainda 20749 para taxa média
                        anual.
                      </p>
                      <p>
                        Logo, por simples cálculo matemático, é possível auferir
                        que a taxa de juros remuneratórios celebrada ao ano
                        entre as partes está{" "}
                        {roundToDecimals(
                          ((review.effectiveInterestRate -
                            referenceInterestRate) /
                            referenceInterestRate) *
                            100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % acima da taxa média do mercado financeiro, conforme o
                        BACEN. Determinada discrepância em relação a taxa média
                        configura ABUSIVIDADE por parte do Banco Réu.
                      </p>
                      <p>
                        Caso a taxa média de juros remuneratórios do mercado
                        financeiro tivesse sido aplicada desde o inicio, o valor
                        original da parcela, segundo a taxa do Bacen, seria de
                        R${" "}
                        {roundToDecimals(
                          review.revisedFirstInstallmentValue,
                          2
                        ).toLocaleString("pt-br", numberFormat)}
                        . Logo, a parte autora arcou com valores em excesso, os
                        quais devem ser considerados para o abatimento
                      </p>
                    </div>
                    <div id="page-petition-0-2">
                      <p>
                        do saldo devedor e cálculo do novo valor de parcela, que
                        redistribui o novo saldo devedor, a partir da limitação
                        dos juros, pelo prazo restante do contrato.
                      </p>
                      <p>
                        Desta maneira, conforme entendimento jurisprudencial
                        pacífico, além da limitação da taxa de juros
                        remuneratórios, deve ser reconhecida a abusividade do
                        contrato para fim de que sejam afastados os efeitos
                        decorrentes da mora.
                      </p>
                      <p>
                        {" "}
                        Para tanto, a parte autora, requer, em sede de tutela de
                        urgência, que seja autorizado o depósito judicial dos
                        valores tido como incontroversos, segundo a planilha de
                        cálculos que acompanha a presente peça exordial, o que
                        representa o pagamento de R${" "}
                        {roundToDecimals(
                          review.revisedFirstInstallmentValue,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        mensais.
                      </p>
                      <p>
                        No mérito, a parte requer que a taxa de juros
                        remuneratórios seja limitada a média do mercado, segundo
                        o Bacen, com a consequente limitação da parcela ao novo
                        valor apresentado.
                      </p>
                      <p>
                        A planilha de cálculo em anexo permite que Vossa
                        Excelência visualize os valores que acabam onerando
                        excessivamente a parte autora, em decorrência da
                        respectiva taxa de juros remuneratórios abusivos e muito
                        acima da média do mercado financeiro.
                      </p>
                      <h5>II. DO DIREITO</h5>
                      <h5>A. DA APLICAÇÃO DO CÓDIGO DE DEFESA DO CONSUMIDOR</h5>
                      <p>
                        Trata-se de uma relação de consumo, em que fica evidente
                        a incidência do Código de Defesa do Consumidor, havendo
                        inclusive Súmula do STJ que concretiza este
                        entendimento.{" "}
                        <b>
                          A relação de consumo pode ser observada na origem dos
                          débitos, ao analisarmos as operações de crédito que
                          configuram
                        </b>
                        .
                      </p>
                      <p className="small-text">
                        STJ - Súmula 297 O Código de Defesa do Consumidor é
                        aplicável as instituições financeiras.
                      </p>
                      <p>
                        Assim, estão presentes os elementos que formam a relação
                        jurídica consumerista, quais sejam a presença do
                        consumidor, do fornecedor, da prestação de um serviço e
                        da vulnerabilidade do Requerente perante a Requerida,
                        incidindo a Lei nº 8.078/90, o Código de Defesa do
                        Consumidor.
                      </p>
                      <p className="small-text">
                        “Art. 2° Consumidor é toda pessoa física ou jurídica que
                        adquire ou utiliza produto ou serviço como destinatário
                        final. (...) Art. 3° Fornecedor é toda pessoa física ou
                        jurídica, pública ou privada, nacional ou estrangeira,
                        bem como os entes despersonalizados, que desenvolvem
                        atividade de produção, montagem, criação, construção,
                        transformação, importação, exportação, distribuição ou
                        comercialização de produtos ou prestação de serviços.
                        (...)”
                      </p>
                      <p>
                        Sabe-se que sendo o consumidor, ora Requerente, parte
                        mais fraca e vulnerável nesta relação jurídica, o ônus
                        da prova inverte-se, cabendo este à parte que detém o
                        maior poder.
                      </p>
                      <p>
                        Assim é a previsão do artigo 6º, inciso VIII, do CDC,
                        onde define que é um direito básico do consumidor, a
                        inversão do ônus da prova, cabendo ao fornecedor
                        apresentar as provas que se fizerem necessárias.
                      </p>
                      <p className="small-text">
                        “Art. 6º{" "}
                        <b>
                          São direitos básicos do consumidor: (...) VIII - a
                          facilitação da defesa de seus direitos, inclusive com
                          a inversão do ônus da prova, a seu favor
                        </b>
                        , no processo civil, quando, a critério do juiz, for
                        verossímil a alegação ou quando for ele hipossuficiente,
                        segundo as regras ordinárias de experiências;”
                      </p>
                      <p>
                        Logo, o ônus da prova deve recair sobre a parte
                        requerida, em conformidade com o texto legal do Código
                        de Defesa do Consumidor. Segundo o artigo 51, § 1º,
                        inciso III, a cláusula que se mostra excessivamente
                        onerosa para o consumidor é nula de pleno direito, uma
                        vez que se enquadra como abusiva.
                      </p>
                    </div>
                    {/* <div id="page-petition-0-3"></div> */}
                    {/* <div id="page-petition-0-4"></div> */}
                    <div id="page-petition-0-5">
                      <p className="small-text">
                        “Art. 51. São nulas de pleno direito, entre outras, as
                        cláusulas contratuais relativas ao fornecimento de
                        produtos e serviços que: (...)
                      </p>
                      <p className="small-text">
                        § 1º Presume-se exagerada, entre outros casos, a
                        vantagem que: (...) III - se mostra excessivamente
                        onerosa para o consumidor, considerando-se a natureza e
                        conteúdo do contrato, o interesse das partes e outras
                        circunstâncias peculiares ao caso.”
                      </p>
                      <p>
                        Destaca-se ainda que a limitação existente à fixação dos
                        juros remuneratórios é referente à média das taxas de
                        juros das principais instituições financeiras da época
                        de celebração do negócio jurídico, conforme dados
                        divulgados regularmente pelo Banco Central.
                      </p>
                      <h5>
                        B. DA RELATIVIZAÇÃO DO PRÍNCIPIO “PACTA SUN SERVANDA”
                      </h5>
                      <p>
                        O Código Civil de 2002 trouxe importantes inovações
                        acerca do ordenamento jurídico brasileiro. Introduziu
                        novos princípios dentro da teoria geral dos contratos,
                        como o princípio da função social e da boa-fé objetiva,
                        que foram inseridos pelos artigos 421 e 422
                        respectivamente. Vejamos:
                      </p>
                      <p className="small-text">
                        “Art. 421. A liberdade de contratar será exercida em
                        razão e nos limites da função social do contrato”
                      </p>
                      <p className="small-text">
                        Art. 422. Os contratantes são obrigados a guardar, assim
                        na conclusão do contrato, como em sua execução, os
                        princípios de probidade e boa-fé.
                      </p>
                      <p>
                        Pode se dizer que o princípio do “pacta sun servanda”
                        acabou por sofrer certa relativização, ao ponto que o
                        mesmo ainda é válido para que se faça cumprir as
                        obrigações contratuais entre as partes, entretanto, não
                        é mais completamente absoluto, devendo ser colocado em
                        segundo plano quando houver clara violação da boa-fé
                        contratual. Determinado entendimento já restou
                        consagrado na I Jornada de Direito Civil, através do
                        enunciado n° 23 que preceitua:
                      </p>
                      <p className="small-text">
                        A função social do contrato, prevista no art. 421 do
                        novo Código Civil, não elimina o princípio da autonomia
                        contratual, mas atenua ou reduz o alcance desse
                        princípio quando presentes interesses metaindividuais ou
                        interesse individual relativo à dignidade da pessoa
                        humana.
                      </p>
                      <p>
                        Desta maneira resta demonstrado que o princípio da
                        liberdade contratual entre as partes não é absoluto,
                        devendo respeitar os
                      </p>
                      <p>
                        limites legais impostos pelo Código Civil de 2002 por
                        meio da boa-fé contratual e da função social do
                        contrato.
                      </p>
                      <p>
                        Neste sentido, é a súmula nº 286 do Colendo Superior
                        Tribunal de Justiça, com o seguinte verbete:{" "}
                        <i>
                          “a renegociação de contrato bancário ou a confissão da
                          dívida não impede a possibilidade de discussão sobre
                          eventuais ilegalidades dos contratos anteriores”
                        </i>
                        .{" "}
                      </p>
                      <p>
                        Essa possibilidade de revisão do contrato e de
                        modificação de suas cláusulas implica na relativização
                        do princípio de que “pacta sunt servanda”, mas apenas
                        com o intuito de afastar as ilegalidades e restabelecer
                        o equilíbrio entre as partes, mantendo-se, sempre que
                        possível, a relação jurídica
                      </p>
                      <p>
                        Neste contexto, ao contrário do sustentado pelo
                        recorrente, é possível, no nosso ordenamento jurídico, a
                        revisão de contratos diante da alegação de existência de
                        abusividades, sobretudo pela aplicação das normas do
                        Código de Defesa do Consumidor à espécie, nos termos de
                        seu artigo 6º, inciso V, que dispõe:
                      </p>
                      <p className="small-text">
                        “Art. 6º São direitos básicos do consumidor: (...) V - a
                        modificação das cláusulas contratuais que estabeleçam
                        prestações desproporcionais ou sua revisão em razão de
                        fatos supervenientes que as tornem excessivamente
                        onerosas;”
                      </p>
                    </div>
                    <div id="page-petition-0-6">
                      <p>
                        A referida revisão não importa em violação do ato
                        jurídico perfeito, pois objetiva extirpar cláusulas
                        ilegais, de modo que a presente ação é adequada para tal
                        fim.
                      </p>
                      <h5>
                        C. DA POSSIBILIDADE DE LIMITAÇÃO DOS JUROS
                        REMUNERATÓRIOS.
                      </h5>
                      <p>
                        A possibilidade de limitação dos juros remuneratórios,
                        quando há abusividade comprovada já é assentada na
                        jurisprudência nacional, a partir do posicionamento do
                        Superior Tribunal de Justiça no julgamento do Resp.
                        1.061.530/RS, sob o rito dos recursos repetitivos,
                        conforme disposto na “alínea d”, da orientação do
                        referido julgado sobre juros remuneratórios:
                      </p>
                      <p className="small-text">
                        ORIENTAÇÃO 1 - JUROS REMUNERATÓRIOS É admitida a revisão
                        das taxas de juros remuneratórios em situações
                        excepcionais, desde que caracterizada a relação de
                        consumo e que a abusividade (capaz de colocar o
                        consumidor em desvantagem exagerada - art. 51, §1º, do
                        CDC) fique cabalmente demonstrada, ante as
                        peculiaridades do julgamento em concreto. (...)” (REsp
                        1061530 RS, Rel. Ministra NANCY ANDRIGHI, SEGUNDA SEÇÃO,
                        julgado em 22/10/2008, DJe 10/03/2009).
                      </p>
                      <p>
                        A partir da respectiva perspectiva de admissão da
                        revisão da taxa de juros remuneratórios, em situações de
                        abusividade, têm-se tanto o Superior Tribunal de
                        Justiça, como os demais Tribunais em território nacional
                        passaram a valer-se da taxa média divulgada pelo Banco
                        Central (Bacen) para averiguar possíveis abusos das
                        Instituições Financeiras.
                      </p>
                      <p>
                        Ou seja, a celebração de taxas de juros remuneratórios
                        em discrepância com a taxa média do mercado financeiro,
                        segundo dados do Banco Central do Brasil, configura
                        prática abusiva e enseja a possibilidade de readequação
                        dos respectivos índices. Conforme manifestação do STJ no
                        julgamento do{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Resp. 1.061.530/RS:
                        </b>
                      </p>
                      <p className="small-text">
                        1.2. A Revisão dos Juros Remuneratórios Pactuados Fixada
                        a premissa de que, salvo situações excepcionais, os
                        juros remuneratórios podem ser livremente pactuados em
                        contratos de empréstimo no âmbito do Sistema Financeiro
                        Nacional, questiona-se a possibilidade de o Poder
                        Judiciário exercer o controle da liberdade de convenção
                        de taxa de juros naquelas situações que são
                        evidentemente abusivas. (...)
                        <b>
                          O Ministro César Asfor Rocha, diante de juros
                          remuneratórios pactuados à taxa de 34,87% ao mês
                          contra uma taxa média, apurada por perícia, de 14,19%
                          ao mês, entendeu que, estando “cabalmente comprovada
                          por perícia, nas instâncias ordinárias, que a
                          estipulação da taxa de juros remuneratórios foi
                          aproximadamente 150% maior que a taxa média praticada
                          no mercado, nula é a cláusula do contrato” (REsp
                          327.727/SP, Segunda Seção, DJ de 08.03.2004)
                        </b>
                        . (...) Assim, a análise da abusividade ganhou muito
                        quando o Banco Central do Brasil passou, em outubro de
                        1999, a divulgar as taxas médias, ponderada segundo o
                        volume de crédito concedido, para os juros praticados
                        pelas instituições financeiras nas operações de crédito
                        realizadas com recursos livres (conf. Circular nº 2957,
                        de 30.12.1999). (...)
                      </p>
                      <p className="small-text">
                        <b>
                          A taxa média apresenta vantagens porque é calculada
                          segundo as informações prestadas por diversas
                          instituições financeiras e, por isso, representa as
                          forças do mercado
                        </b>
                        . Ademais, traz embutida em si o custo médio das
                        instituições financeiras e seu lucro médio, ou seja, um
                        'spread' médio. É certo, ainda, que o cálculo da taxa
                        média não é completo, na medida em que não abrange todas
                        as modalidades de concessão de crédito, mas, sem dúvida,
                        presta-se como parâmetro de tendência das taxas de
                        juros.{" "}
                        <b>
                          Assim, dentro do universo regulatório atual, a taxa
                          média constitui o melhor parâmetro para a elaboração
                          de um juízo sobre abusividade.
                        </b>
                        (...){" "}
                        <b>
                          A jurisprudência, conforme registrado anteriormente,
                          tem considerado abusivas taxas superiores a uma vez e
                          meia
                        </b>{" "}
                        (voto proferido pelo Min. Ari Pargendler no REsp
                        271.214/RS, Rel. p. Acórdão Min. Menezes Direito, DJ de
                        04.08.2003), ao dobro (Resp 1.036.818, Terceira Turma,
                        minha relatoria, DJe de 20.06.2008) ou ao triplo (REsp
                        971.853/RS, Quarta Turma, Min. Pádua Ribeiro, DJ de
                        24.09.2007) da média.” (REsp 1061530 RS, Rel. Ministra
                        NANCY ANDRIGHI, SEGUNDA SEÇÃO, julgado em 22/10/2008,
                        DJe 10/03/2009).
                      </p>
                    </div>
                    {/* <div id="page-petition-0-7"></div> */}
                    <div id="page-petition-0-8">
                      <p>
                        Ou seja,{" "}
                        <span style={{ textDecoration: "underline" }}>
                          percebe-se que taxas de juros remuneratórios que
                          estejam “uma vez e meia” acima da taxa média, segundo
                          o Bacen, para a mesma operação, à época da celebração
                          do contrato, são consideradas abusivas, ensejando a
                          revisão contratual e, consequentemente, sua limitação
                          ao índice divulgado pelo Banco Central
                        </span>
                        .
                      </p>
                      <p>
                        Logo, os demais Tribunais Pátrios vêm adotando o
                        respectivo parâmetro, qual seja, que taxas de juros que
                        discrepem uma vez e meia em relação à média do mercado,
                        segundo o Bacen, estão em patamar de abusividade, sendo
                        hipótese onde é cabível a revisão contratual e a
                        consequente limitação dos juris remuneratórios.
                        Vejamos:.
                      </p>
                      <p className="small-text">
                        APELAÇÃO CÍVEL. NEGÓCIOS JURÍDICOS BANCÁRIOS. AÇÃO
                        REVISIONAL DE JUROS. CONTRATO DE EMPRÉSTIMO PESSOAL.
                        PRETENSÃO REVISIONAL. ALEGAÇÃO DE ABUSIVIDADES NAS
                        CLÁUSULAS CONTRATUAIS. PRELIMINAR CONTRARRECURSAL DE NÃO
                        CONHECIMENTO DO APELO. [...] JUROS REMUNERATÓRIOS.
                        <b style={{ textDecoration: "underline" }}>
                          Mostra-se possível a limitação dos juros
                          remuneratórios praticados quando esses excederem a uma
                          vez e meia a taxa média de mercado divulgada pelo
                          Banco Central do Brasil. No caso concreto, os
                          percentuais estipulados ultrapassam um vez e meia às
                          médias de mercado estipuladas para o mesmo período e
                          modalidade de contrato, devem readequadas as taxas de
                          juros
                        </b>
                      </p>
                      <p className="small-text">
                        <b style={{ textDecoration: "underline" }}>
                          remuneratórios contratadas, de acordo com as médias
                          divulgadas pelo Banco Central do Brasil.
                        </b>{" "}
                        [...] DESCARACTERIZAÇÃO DA MORA. Nos termos da Súmula n.
                        380 do Superior Tribunal de Justiça, o simples
                        ajuizamento de ação revisional não é o bastante para
                        impedir a constituição do devedor em mora, havendo a
                        necessidade de avaliar-se a existência de abusividade
                        nos encargos do período de normalidade contratual (juros
                        remuneratórios e capitalização dos juros).{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Na situação concreta, em decorrência da revisão das
                          taxas dos juros remuneratórios previstos no contrato
                          revisando, afasta-se a mora da devedora, não sendo
                          possível a incidência de encargos moratórios até a
                          apuração dos valores realmente devidos ao Banco
                          credor.
                        </b>{" "}
                        COMPENSAÇÃO E REPETIÇÃO DE INDÉBITO.{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Cabível a compensação dos valores eventualmente pagos
                          a maior e a repetição simples do que exceder à dívida,
                          como forma de evitar o enriquecimento indevido da
                          instituição financeira ré
                        </b>
                        . PRELIMINAR CONTRARRECURSAL AFASTADA. APELO
                        PARCIALMENTE PROVIDO.(Apelação Cível, Nº 70083411496,
                        Décima Segunda Câmara Cível,
                        <b style={{ textDecoration: "underline" }}>
                          Tribunal de Justiça do RS
                        </b>
                        , Relator: Ana Lúcia Carvalho Pinto Vieira Rebout,
                        Julgado em:{" "}
                        <b style={{ textDecoration: "underline" }}>
                          23-07-2020
                        </b>
                        )
                      </p>
                      <p className="small-text">
                        AÇÃO REVISIONAL – CONTRATO BANCÁRIO DE FINANCIAMENTO DE
                        VEÍCULO – Sentença de parcial procedência – Insurgências
                        do Autor e Réu –{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Aplicação do Código de Defesa do Consumidor que não
                          veda o princípio da 'pacta sunt servanda'
                        </b>{" "}
                        – Capitalização de juros - Possibilidade da
                        capitalização contratada, já que a avença foi celebrada
                        sob o crivo de legislação que permite tal prática –
                        Inocorrência de qualquer ofensa à legislação
                        consumerista – Tabela Price - Licitude na sua aplicação
                        que prevê o pagamento dos juros na parcela mensal, não
                        havendo, com sua aplicação, capitalização de juros –
                        Comissão de permanência que não incidiu no contrato em
                        questão - Seguro de proteção financeira – Nos contratos
                        bancários, o consumidor não pode ser compelido a
                        contratar seguro – Configuração de venda casada –
                        Entendimento do E. STJ consolidado no julgamento do REsp
                        nº 1.639.259/SP, sob o rito dos recursos repetitivos -
                        <b style={{ textDecoration: "underline" }}>
                          Nos termos da orientação jurisprudencial do STJ, não
                          será considerada abusiva a taxa dos juros
                          remuneratórios contratada quando ela for até uma vez e
                          meia superior à taxa de juros média praticada pelo
                          mercado, divulgada pelo Banco Central do Brasil, para
                          o tipo específico de contrato, na época de sua
                          celebração – Autor que comprovou que a taxa contratada
                          no empréstimo supera em uma vez e meia a taxa média
                          mercado - Sentença reforma em parte
                        </b>{" "}
                        – Apelo do autor parcialmente provido e desprovido o
                        apelo do réu.(
                        <b style={{ textDecoration: "underline" }}>TJSP</b>;
                        Apelação Cível 1005477-95.2019.8.26.0268; Relator (a):
                        Jacob Valente; Órgão Julgador: 12ª Câmara de Direito
                        Privado; Foro de Itapecerica da Serra - 3ª Vara;{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Data do Julgamento: 12/11/2020
                        </b>
                        ; Data de Registro: 12/11/2020)
                      </p>
                    </div>
                    {/* <div id="page-petition-0-9"></div> */}
                    <div id="page-petition-1-0">
                      <p className="small-text">
                        Apelação cível. Ação revisional de cláusulas
                        contratuais. Empréstimo pessoal consignado.
                        <b style={{ textDecoration: "underline" }}>
                          Apelo interposto pela instituição financeira condenada
                          a conformar a cobrança dos juros às taxas médias
                          cobradas pelas instituições financeiras segundo
                          divulgado pelo BACEN. Cobrança de juros remuneratórios
                          muito acima da taxa média cobrada em contratos
                          similares. Jurisprudência que estabeleceu ser abusiva
                          a cobrança de juros que ultrapassem uma vez e meia a
                          média do mercado.
                        </b>
                        Alteração da base de cálculo dos honorários
                        advocatícios. Prevalência do critério do proveito
                        econômico. Inteligência do §2º do art. 85 CPC/15.
                        Precedentes do STJ. Apelo parcialmente provido.
                        (Apelação Cível nº: 0015833-64.2016.8.19.0205, Quinta
                        Câmara Cível,{" "}
                        <b style={{ textDecoration: "underline" }}>TJRJ</b>,
                        Relator: Des. Cristina Tereza Gaulia, julgado em:
                        <b style={{ textDecoration: "underline" }}>
                          10-03-2020
                        </b>
                        ).
                      </p>
                      <p className="small-text">
                        APELAÇÃO CÍVEL - REVISIONAL DE CONTRATO BANCÁRIO -
                        CÓDIGO DE DEFESA DO CONSUMIDOR - APLICABILIDADE - JUROS
                        REMUNERATÓRIOS - ABUSIVIDADE - CONSTATAÇÃO - MÉDIA DE
                        MERCADO - COBRANÇA EM PERCENTUAL SUPERIOR A UMA VEZ E
                        MEIA - CAPITALIZAÇÃO MENSAL DE JUROS - VIABILIDADE -
                        COMISSÃO DE PERMANÊNCIA - NÃO INCIDÊNCIA - REPETIÇÃO DO
                        INDÉBITO - MÁ-FÉ NÃO COMPROVADA.{" "}
                        <b style={{ textDecoration: "underline" }}>
                          São aplicáveis aos contratos bancários celebrados com
                          instituições financeiras as regras do Código de Defesa
                          do Consumidor para afastar as eventuais cláusulas
                          abusivas. Constatada a cobrança de juros
                          remuneratórios em percentual que superam em uma vez e
                          meia a média praticada no mercado à época da
                          celebração do contrato, impõe-se a sua limitação
                        </b>
                        . É viável a capitalização mensal de juros nos contratos
                        posteriores a 31/03/2000, desde que haja previsão
                        expressa, comumente representada pela estipulação da
                        taxa de juros remuneratórios anual em percentual
                        superior ao duodécuplo da mensal. Não havendo previsão
                        no contrato de comissão de permanência e não tendo o
                        autor comprovado a incidência de tal encargo, não há que
                        se falar em abusividade. A repetição em dobro dos
                        valores efetivamente cobrados a maior depende de prova
                        da má-fé por parte do credor (Apelação Cível n°
                        1.0000.20.545236-0/001, 10 Câmara Cível,{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Tribunal de Justiça do Estado de Minas Gerais
                        </b>
                        , Relator:
                      </p>
                      <p className="small-text">
                        Des.(a) Jaqueline Calábria Albuquerque, Data do
                        Julgamento:{" "}
                        <b style={{ textDecoration: "underline" }}>
                          05/11/2020
                        </b>{" "}
                        Data da Publicação: 18/11/2020)
                      </p>
                      <p>
                        É importante destacar que a taxa de juros remuneratórios
                        estabelecidos no contrato celebrado entre as partes é{" "}
                        {roundToDecimals(
                          ((review.effectiveInterestRate -
                            referenceInterestRate) /
                            referenceInterestRate) *
                            100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % maior que a taxa média do mercado, o que indica,
                        conforme jurisprudência pacificada do Superior Tribunal
                        de Justiça, bem como nos demais Tribunais Brasileiros a
                        presença de elemento que justifica a revisão contratual.
                      </p>
                      <p>
                        Pois bem, Vossa Excelência, o presente contrato
                        celebrado entre as partes apresenta a taxa nominal de
                        juros estipulada da seguinte forma:{" "}
                        {roundToDecimals(
                          review.effectiveInterestRate * 100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % ao mês e
                        {roundToDecimals(
                          calculateAnnualEffectiveInterestRate(
                            review.effectiveInterestRate
                          ) * 100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % ao ano. Uma rápida consulta ao site do Bacen, nos
                        permite auferir que a taxa média do mercado financeiro,
                        para a mesma operação, a época da celebração do
                        contrato, era de{" "}
                        {roundToDecimals(
                          referenceInterestRate * 100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % a.m. e{" "}
                        {roundToDecimals(
                          calculateAnnualEffectiveInterestRate(
                            referenceInterestRate
                          ) * 100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % a.a.
                      </p>
                      <p>
                        Logo, um simples cálculo matemático nos permite auferir
                        que a taxa celebrada entre as partes, excede a
                        tolerância de 50% acima da taxa média, estabelecida pelo
                        Superior Tribunal de Justiça, como parâmetro para
                        determinar a abusividade da taxa de juros
                        remuneratórios.
                      </p>
                      <p>
                        Portanto, o banco réu impôs a parte autora uma taxa de
                        juros remuneratória em patamar abusivo, incorrendo em
                        flagrante ilegalidade, conforme entendimento já
                        consolidado na jurisprudência das mais variadas Cortes
                        Jurídicas do país.
                      </p>
                    </div>
                    <div id="page-petition-1-1">
                      <h5>D. DA DESCARACTERIZAÇÃO DA MORA</h5>
                      <p>
                        A possibilidade de descaracterização da mora, quando há
                        abusividade contratual comprovada é assentada e
                        pacificada na jurisprudência nacional, a partir do
                        posicionamento do Superior Tribunal de Justiça no
                        julgamento do{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Resp. 1.061.530/RS
                        </b>
                        , sob o rito dos recursos repetitivos, conforme disposto
                        na “alínea a”, da orientação do referido julgado sobre
                        mora, vejamos:
                      </p>
                      <p className="small-text">
                        ORIENTAÇÃO 2 - CONFIGURAÇÃO DA MORA
                      </p>
                      <p className="small-text">
                        a) O reconhecimento da abusividade nos encargos exigidos
                        no período da normalidade contratual (juros
                        remuneratórios e capitalização) descarateriza a mora;
                        [...] (REsp 1061530 RS, Rel. Ministra NANCY ANDRIGHI,
                        SEGUNDA SEÇÃO, julgado em 22/10/2008, DJe 10/03/2009).
                      </p>
                      <p>
                        Ademais, com o passar dos últimos anos a jurisprudência
                        dos Tribunais reconheceu que a descaracterização da mora
                        implica na impossibilidade de que qualquer um dos seus
                        efeitos incidam sobre o devedor, sejam eles: a cobrança
                        de multa contratual, a incidência de juros moratórios, a
                        apreensão de veículo financiado e até mesmo a inclusão
                        do nome do mesmo em cadastro de inadimplentes.
                      </p>
                      <p>
                        Ou seja, caso comprovado mediante os autos a existência
                        de clausula contratual abusiva, em decorrência da taxa
                        de juros remuneratórios em patamar ilegal, ou de
                        capitalização de juros não expressamente pactuada,
                        têm-se que a mora e seus efeitos legais serão
                        completamente afastados pelo juízo.
                      </p>
                      <p>
                        Nesse caso, a jurisprudência dos principais Tribunais é
                        pacífica no respectivo sentido:
                      </p>
                      <p className="small-text">
                        APELAÇÃO CÍVEL. CONTRATOS DE CARTÃO DE CRÉDITO. AÇÃO
                        REVISIONAL. JUROS REMUNERATÓRIOS. MORA DESCARACTERIZADA.
                        REPETIÇÃO DO INDÉBITO. Juros remuneratórios. Possível a
                        revisão contratual na hipótese de os juros
                        remuneratórios exorbitarem a taxa média de mercado.
                        Situação ocorrida nos autos, em que a taxa aplicada é
                        superior à taxa média publicada pelo BACEN.{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Afastamento da mora e inscrição nos cadastros de
                          devedores. Afastada a mora contratual não cabe a
                          inscrição em cadastro de inadimplentes, ou outros atos
                          tendentes à cobrança do débito
                        </b>
                        . Compensação. Repetição de indébito. Devem ser
                        devolvidos ou compensados, de forma simples, os valores
                        eventualmente pagos a maior pelo consumidor. APELAÇÃO
                        PROVIDA.(Apelação Cível, Nº 70083826081, Vigésima
                        Terceira Câmara Cível, Tribunal de Justiça do RS,
                        Relator: Alberto Delgado Neto, Julgado em: 28-04-2020)
                      </p>
                      <p className="small-text">
                        Ação revisional - Cédulas de crédito bancário –
                        Indexador contratual – Certificado de Depósitos
                        Interbancários (CDI) – Comissão de abertura de crédito –
                        Comissão de permanência cumulada com outros encargos –
                        Justiça gratuita – Diferimento das custas ao final da
                        demanda. [...] 4.{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Verificada a cobrança de encargo abusivo no período de
                          normalidade do contrato, resta descaracterizada a
                          mora.
                        </b>
                        .
                      </p>
                      <p className="small-text">
                        5. A alegação de abusividade na cobrança de comissão de
                        permanência e de indevida cumulação com outros encargos
                        é de ser repelida quando ausente previsão contratual ou
                        início de prova de cobrança de tal encargo. 6. A
                        concessão de assistência gratuita ou de diferimento das
                        custas ao final da demanda à pessoa jurídica é
                        admissível em casos excepcionalíssimos e quando
                        demonstrada a sua fragilidade econômica, ainda que
                        momentânea, para suportar as despesas do processo. Ação
                        parcialmente procedente. Acolhido o pedido de
                        diferimento do pagamento das custas ao final da demanda.
                        Recurso da autora parcialmente provido, não provido o do
                        réu. (
                        <b style={{ textDecoration: "underline" }}>TJSP</b>;
                        Apelação Cível 1054195-19.2017.8.26.0002; Relator (a):
                        Itamar Gaino; Órgão Julgador: 21ª Câmara de Direito
                        Privado; Foro Central Cível - 39ª Vara Cível; Data do
                        Julgamento: 16/11/2020; Data de Registro:{" "}
                        <b style={{ textDecoration: "underline" }}>
                          18/11/2020
                        </b>
                        )
                      </p>
                    </div>
                    <div id="page-petition-1-2">
                      <p className="small-text">
                        DIREITO DO CONSUMIDOR. APELAÇÕES CÍVEIS. AÇÃO
                        REVISIONAL. FINANCIAMENTO DE AUTOMÓVEL. JUROS
                        REMUNERATÓRIOS. ABUSIVIDADE. CONFIGURAÇÃO. TAXA
                        CONTRATADA DEMASIADAMENTE ACIMA DA MÉDIA DO MERCADO.
                        COMISSÃO DE PERMANÊNCIA. INEXISTÊNCIA DE COBRANÇA.
                        AUSÊNCIA DE INTERESSE NO PONTO. REPETIÇÃO DO INDÉBITO NA
                        FORMA SIMPLES. JURISPRUDÊNCIA SEDIMENTADA DO TJCE E STJ.
                        <b style={{ textDecoration: "underline" }}>
                          RECURSO CONHECIDO E PARCIALMENTE PROVIDO, NO SENTIDO
                          DE RECONHECER A ABUSIVIDADE DA TAXA DE JUROS
                          CONTRATADA, COM A CONSEQUENTE DESCARACTERIZAÇÃO DE
                          EVENTUAL MORA E REPETIÇÃO DE INDÉBITO SIMPLES
                        </b>
                        . ACÓRDÃO: Vistos, relatados e discutidos estes autos,
                        acorda a 4ª Câmara Direito Privado do{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Tribunal de Justiça do Estado do Ceará
                        </b>
                        , unanimemente, pelo conhecimento e parcial provimento
                        do recurso, nos termos do voto do Relator, que passa a
                        integrar este acórdão. Fortaleza, 17 de novembro de 2020
                        FRANCISCO BEZERRA CAVALCANTE Presidente do Órgão
                        Julgador DESEMBARGADOR DURVAL AIRES FILHO Relator
                        PROCURADOR(A) DE JUSTIÇA (Relator (a): DURVAL AIRES
                        FILHO; Comarca: Fortaleza; Órgão julgador: 8ª Vara
                        Cível; Data do julgamento: 17/11/2020; Data de registro:
                        17/11/2020).
                      </p>
                      <p>
                        APELAÇÕES CÍVEIS. EMBARGOS À EXECUÇÃO. CÉDULA DE CRÉDITO
                        BANCÁRIO. TOGADO A QUO QUE JULGOU PARCIALMENTE
                        PROCEDENTES OS PEDIDOS DEDUZIDOS NA PETIÇÃO INICIAL.
                        INCONFORMISMO DE AMBOS OS CONTENDORES. [...]
                        <b style={{ textDecoration: "underline" }}>
                          DESCARACTERIZAÇÃO DA MORA. RESSONÂNCIA JURÍDICA DO
                          RECONHECIMENTO DE ABUSIVIDADE NO PERÍODO DE
                          NORMALIDADE CONTRATUAL. ENTENDIMENTO SUFRAGADO NO
                          RECURSO ESPECIAL N. 1.061.530/RS, DE RELATORIA DA
                          MINISTRA NANCY ANDRIGHI. AFASTAMENTO COGENTE DA MORA
                          DEBENDI.
                        </b>
                      </p>
                      <p className="small-text">
                        (<b style={{ textDecoration: "underline" }}>TJSC</b>,
                        Apelação n. 0306508-33.2017.8.24.0038, do
                        <b style={{ textDecoration: "underline" }}>
                          Tribunal de Justiça de Santa Catarina
                        </b>
                        , rel. José Carlos Carstens Kohler, Quarta Câmara de
                        Direito Comercial, j.
                        <b style={{ textDecoration: "underline" }}>
                          17-11-2020
                        </b>
                        ).
                      </p>
                      <p>
                        Desta maneira, toda e qualquer possível mora a qual o
                        devedor possa ter incorrido deve ser afastada, em
                        virtude da flagrante prática abusiva da instituição
                        financeira na cobrança de juros remuneratórios.
                      </p>
                      <p>
                        Portanto, deve ser reconhecido o direito do autor ao
                        afastamento da mora, bem como vedado ao banco réu
                        proceder a cobrança dos efeitos correspondentes, quais
                        sejam: cobrança de multa contratual, a incidência de
                        juros moratórios, a apreensão de veículo financiado e
                        até mesmo a inclusão do nome da parte autora em cadastro
                        de inadimplentes.
                      </p>
                    </div>
                    {/* <div id="page-petition-1-3"></div> */}
                    <div id="page-petition-1-4">
                      <h5>E. DA COMPOSIÇÃO DO NOVO VALOR DA PARCELA MENSAL</h5>
                      <p>
                        Cumpre ressaltar, que a parte autora não pleiteia que o
                        Poder Judiciário reconheça qualquer tipo de
                        inadimplência, apenas requer que os juros remuneratórios
                        sejam adequados a média do mercado financeiro, de forma
                        que os valores já pagos sejam descontados e o saldo
                        devedor redistribuído dentro do n° de parcelas previstas
                        originalmente no contrato.
                      </p>
                      <p>
                        Determinado valor da parcela é composto do saldo devedor
                        que se entende existente, ou seja, com a taxa de juros
                        redimensionada e descontado os valores pagos em excesso,
                        por sua vez diluído no prazo contratual restante.
                      </p>
                      <p>
                        Ainda, destaca-se que os valores já pagos,
                        eventualmente, a título de mora das parcelas já
                        adimplidas, deverão ser abatidos do saldo devedor, ou
                        devolvidos via indébito simples, caso constatada a
                        existência de crédito em favor da parte autora.
                      </p>
                      <p>
                        <b style={{ textDecoration: "underline" }}>
                          Logo, mediante a apresentação dos cálculos elaborados
                          em software especializado em cálculos financeiros, que
                          permitem a Vossa Excelência visualizar em números
                          objetivos a abusividade imposta a parte autora, têm-se
                          que seu direito a revisão das cláusulas contratuais
                          abusivas deve ser concedido, ante a devida instrução
                          do presente feito.
                        </b>
                      </p>
                      <p>
                        Portanto, não restam dúvidas que o banco réu instituiu
                        uma taxa de juros remuneratórios abusiva em desfavor da
                        parte autora, de modo que a revisão contratual é a
                        medida que se impõe, com a referida limitação dos juros
                        a taxa média do Bacen, à época da contratação do
                        referido crédito.
                      </p>
                    </div>
                    <div id="page-petition-1-5">
                      <h5>III. DA TUTELA DE URGÊNCIA.</h5>
                      <p>
                        O artigo 300 do Código de Processo Civil dispõe assim
                        dispõe sobre a possibilidade de tutela de urgência:
                      </p>
                      <p className="small-text">
                        Art. 300. A tutela de urgência será concedida quando
                        houver elementos que evidenciem a probabilidade do
                        direito e o perigo de dano ou o risco ao resultado útil
                        do processo.
                      </p>
                      <p>
                        A probabilidade do direito alegado é evidente, uma vez
                        que resta amplamente demonstrado que a taxa de juros
                        remuneratórios pactuada em contrato entre as partes está
                        em patamar abusivo, se comparada com a taxa média de
                        juros do mercado financeiro, ensejando a revisão
                        contratual conforme amplo entendimento jurisprudencial.
                      </p>
                      <p>
                        O perigo de dano ao resultado útil da presente ação
                        reside no fato que o contrato de crédito celebrado entre
                        as partes diz respeito a financiamento de veículo
                        automotivo, o qual foi alienado fiduciariamente em favor
                        do banco réu. Logo, como já narrado, a parte autora está
                        inadimplente com suas parcelas, havendo o risco iminente
                        de que seja realizada “busca e apreensão” do veículo.
                      </p>
                      <p>
                        Desta maneira, a parte autora requer que seja concedida
                        a tutela de urgência afastando qualquer possibilidade de
                        mora da parte autora, mediante a autorização para que a
                        mesma proceda aos depósitos, em juízo, dos valores tidos
                        como incontroversos.
                      </p>
                      <p>
                        O posicionamento da jurisprudência é pacifico e unânime
                        em relação à possibilidade de descaracterização da mora,
                        mediante o depósito dos valores incontroversos, o que
                        veta o Credor em proceder a inclusão do nome da parte
                        autora em cadastro negativo e em tomar qualquer medida
                        que culmine na busca e apreensão do veículo, ou ainda
                        acrescer a cobrança de multa ou juros moratórios:
                      </p>
                      <p className="small-text">
                        APELAÇÃO CÍVEL. NEGÓCIOS JURÍDICOS BANCÁRIOS.
                        REVISIONAL. EMPRÉSTIMO PESSOAL E CONFISSÃO DE DÍVIDA.
                        Juros remuneratórios. Excesso na cobrança configurado,
                        pois fixados juros acima dos parâmetros da taxa média de
                        mercado divulgada pelo BACEN, considerado o período e a
                        natureza da contratação. Capitalização mensal dos juros.
                        Viabilidade no caso concreto, pois não comprovada a
                        pactuação. Comissão de permanência. Afastamento da
                        cobrança dos demais encargos de mora cumulados à
                        comissão de permanência. Tarifas administrativas.
                        Descabimento de cobrança de TAC e TEC com relação ao
                        instrumento de confissão de dívida (Súmula nº 565 do
                        STJ).{" "}
                        <b style={{ textDecoration: "underline" }}>
                          Descaracterização da mora. Ocorrência, pois
                          reconhecida abusividade no período de normalidade.
                          Repetição/Compensação do indébito. Possibilidade, se
                          verificada a cobrança indevida. Desconto de parcelas
                          em conta, proibição da inscrição em cadastros
                          restritivos de crédito e manutenção de posse do bem
                          objeto da contratação. Cabimento uma vez que há
                          ilegalidade nas cobranças normais, a mora restou
                          descaracterizada e as medidas estão condicionadas ao
                          depósito do valor incontroverso das parcelas
                        </b>
                        . APELAÇÕES PARCIALMENTE PROVIDAS.(Apelação Cível, Nº
                        70083039719, Décima Oitava Câmara Cível, Tribunal de
                        Justiça do RS, Relator: Heleno Tregnago Saraiva, Julgado
                        em: 28-04-2020)
                      </p>
                      <p>
                        O desembargador Pedro Celso Dal Prá, relator do acórdão
                        ementado acima (Apelação Cível, Nº 70083039719), ainda
                        se manifestou nos seguintes termos em seu voto,
                        admitindo explicitamente o pedido de manutenção da posse
                        por parte do devedor, desde que fosse depositado
                        mensalmente os valores incontroversos sob juízo
                      </p>
                      <p className="small-text">
                        Descaracterizada a mora em razão da abusividade da
                        cobrança dos encargos da normalidade, viável a concessão
                        das tutelas de urgência para determinar que o requerido
                        se abstenha de lançar o nome da autora nos cadastros dos
                        órgãos de restrição de crédito, bem como para suspender
                        o desconto em conta das parcelas e manter a posse do bem
                        com a parte autora, sobretudo quando tais medidas
                        ficaram devidamente condicionadas ao depósito judicial
                        mensal das parcelas incontroversas do débito.
                      </p>
                    </div>
                    {/* <div id="page-petition-1-6"></div> */}
                    <div id="page-petition-1-7">
                      <p>
                        Desta maneira, requer-se desde já a concessão da tutela
                        de urgência para fim de:
                      </p>
                      <p className="small-text">
                        a) Seja deferido o depósito mensal e sucessivo dos
                        valores incontroversos da parcela, na importância de R$
                        1.695,95 de modo a descaracterizar qualquer mora da
                        parte autora, tendo em vista a taxa de juros
                        remuneratórios abusiva;
                      </p>
                      <p className="small-text">
                        b) Seja o banco réu impedido de incluir a parte autora
                        em qualquer cadastro negativo de inadimplência, devendo
                        remover o respectivo registro caso já efetuado;
                      </p>
                      <p className="small-text">
                        c) Seja deferida a manutenção da posse do veículo
                        alienado fiduciariamente à parte autora, vedando
                        qualquer operação de “busca e apreensão” do mesmo por
                        parte do banco réu.
                      </p>
                      <p className="small-text">
                        d) Seja afastada a cobrança de penalidades de mora em
                        desfavor da parte autora, tais como multa moratória e
                        juros de mora;
                      </p>
                      <p>
                        <b style={{ textDecoration: "underline" }}>
                          Diante da probabilidade do direito da parte autora,
                          bem como do perigo de dano irreparável em caso de
                          demora na prestação jurisdicional, deve ser deferida
                          os pedidos em tutela de urgência, uma vez que baseados
                          em entendimento pacífico do Superior Tribunal de
                          Justiça.
                        </b>
                      </p>
                      <h5>IV. DA ASSISTENCIA JUDICIÁRIA GRATUITA.</h5>
                      <p>
                        A parte autora não possui condições de arcar com as
                        custas processuais e honorários advocatícios sem
                        prejuízo do sustento próprio bem como o de sua família,
                        razão pela qual faz jus ao benefício da gratuidade da
                        justiça, assegurado pela Constituição Federal, Artigo
                        5º, LXXIV e pela Lei 13.105/2015 (CPC), artigo 98 e
                        seguintes.
                      </p>
                      <p>
                        O contracheque da parte autora atesta a condição de
                        hipossuficiência econômica, devendo o Poder Judiciário
                        acolher o requerimento de gratuidade da justiça.
                      </p>
                    </div>
                    <div id="page-petition-1-8">
                      <h5>V. DOS PEDIDOS</h5>
                      <p>Ante o exposto, requer-se a Vossa Excelência:</p>
                      <p>
                        1. Seja deferida a tutela de urgência, a fim de que:
                      </p>
                      <p>
                        a) Seja deferido o depósito mensal e sucessivo dos
                        valores incontroversos da parcela, na importância de R$
                        {roundToDecimals(
                          review.revisedFirstInstallmentValue,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        de modo a descaracterizar qualquer mora da parte autora,
                        tendo em vista a taxa de juros remuneratórios abusiva;
                      </p>
                      <p>
                        b) Seja o banco réu impedido de incluir a parte autora
                        em qualquer cadastro negativo de inadimplência, devendo
                        remover o respectivo registro caso já efetuado;
                      </p>
                      <p>
                        c) Seja deferida a manutenção da posse do veículo
                        alienado fiduciariamente à parte autora, vedando
                        qualquer operação de “busca e apreensão” do mesmo por
                        parte do banco réu.
                      </p>
                      <p>
                        d) Seja afastada a cobrança de qualquer penalidade de
                        mora, tais como multa moratória ou juros de mora em
                        desfavor da parte autora, por possíveis atrasos no
                        transcurso do contrato entre as partes.
                      </p>
                      <p>
                        2. Seja concedido o benefício da Assistência Judiciária
                        Gratuita, uma vez que a parte autora não possui
                        condições de arcar com as despesas processuais, conforme
                        declaração de hipossuficiência e extratos bancários em
                        anexo;
                      </p>
                      <p>
                        3. Seja designada a citação da Requerida quanto à
                        presente ação, para que, querendo, apresente a defesa,
                        sob pena de confissão e revelia;
                      </p>
                      <p>
                        4. Seja concedida a inversão do ônus da prova, ante a
                        hipossuficiência da Requerente perante a Requerida, nos
                        termos do artigo 6º, VIII, do Código de Defesa do
                        Consumidor;
                      </p>
                      <p>
                        5. Que a presente ação revisional seja recebida e
                        julgada totalmente procedente para fim de adequar a taxa
                        de juros remuneratórios do contrato bancário firmado
                        entre as partes ao patamar médio do mercado, qual seja
                        {roundToDecimals(
                          referenceInterestRate * 100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % ao mês e{" "}
                        {roundToDecimals(
                          calculateAnnualEffectiveInterestRate(
                            review.effectiveInterestRate
                          ) * 100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        %ao ano, reconhecendo que o novo valor da parcela mensal
                        a ser pago é de{" "}
                        {roundToDecimals(
                          review.revisedFirstInstallmentValue,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        .
                      </p>
                      <p>
                        6. Seja confirmada a tutela de urgência, para fim de
                        afastar-se definitivamente a caracterização da mora por
                        parte da autora bem como seus efeitos, restando a mesma
                        livre de registro em cadastro de inadimplentes, bem como
                        na posse direta do bem alienado fiduciariamente;
                      </p>
                      <p>
                        7. Sejam os valores pagos em excesso em favor do banco
                        réu, levando em consideração as parcelas mensais e
                        sucessivas já adimplidas, abatidos do possível saldo
                        devedor residual, a fim de evitar o enriquecimento
                        ilícito e injustificado da parte requerida;
                      </p>
                      <p>
                        8. Condenar o banco réu ao pagamento das custas
                        processuais e honorários sucumbenciais;
                      </p>
                      <p>
                        9. Seja deferida a produção de provas em todos os meios
                        admitidos em direito.
                      </p>
                      <p>
                        Atribui-se a causa o valor de R${" "}
                        {roundToDecimals(
                          revisedOperation.revisedInstallmentsTotal,
                          2
                        ).toLocaleString("pt-br", numberFormat)}
                      </p>
                    </div>
                    {/* <div id="page-petition-1-9"></div> */}
                    <div id="page-petition-2-0">
                      <p>Nestes termos, Pede deferimento.</p>
                      <p>
                        {new Date().toLocaleDateString("pt-br", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>

                      <p>___________________</p>
                      <p>OAB/__ _____</p>
                    </div>
                  </div>
                )}
            </CustomTabPanel>
            <CustomTabPanel value={tabIndex} index={2}>
              {defendant &&
                referenceInterestRate &&
                revisedPayments?.length &&
                revisedOperation && (
                  <div>
                    <div id="page-technical-report-1">
                      <h3>PARECER TÉCNICO DO CÁLCULO</h3>
                      <p>
                        Autor:{" "}
                        <b>
                          {review.clientName.toUpperCase()}, brasileiro(a),
                          portador(a) do CPF sob nº ___.____.___-__, residente e
                          domiciliado(a) no endereço
                          _______________________________________________________________
                        </b>
                      </p>
                      <p>
                        Réu: {defendant.name.toUpperCase()}, pessoa jurídica de
                        direito privado, devidamente inscrita no CNPJ sob o nº
                        {defendant.document}, com sede no endereço{" "}
                        {defendant.address.toUpperCase()}.
                      </p>
                      <h4>I. RELATÓRIO DO CASO CONCRETO.</h4>
                      <p>
                        O consumidor{" "}
                        <b>
                          {review.clientName.toUpperCase()}, brasileiro(a),
                          portador(a) do CPF sob nº ___.___.___-__, residente e
                          domiciliado(a) no endereço
                          _____________________________________________________________
                        </b>
                        celebrou celebrou contrato de Aquisição de veículos com
                        o {defendant.name.toUpperCase()}, pessoa jurídica de
                        direito privado, devidamente inscrita no CNPJ sob o nº
                        {defendant.document}, com sede no endereço{" "}
                        {defendant.address.toUpperCase()}, em{" "}
                        {review.contractStartDate.toLocaleDateString("pt-br")}
                      </p>
                      <p>
                        A taxa de juros remuneratórios imposta pelo{" "}
                        <b>
                          {defendant.name.toUpperCase()}, pessoa jurídica de
                          direito privado, devidamente inscrita no CNPJ sob o nº
                          {defendant.document}, com sede no endereço{" "}
                          {defendant.address}
                        </b>
                        , atingiu o patamar de{" "}
                        <b>
                          {roundToDecimals(
                            review.effectiveInterestRate * 100,
                            2
                          )}
                        </b>
                        % a.m. e{" "}
                        <b>
                          {roundToDecimals(
                            calculateAnnualEffectiveInterestRate(
                              review.effectiveInterestRate
                            ) * 100,
                            2
                          ).toLocaleString("pt-br", numberFormat)}
                        </b>
                        % a.a, ultrapassando a taxa média de juros
                        remuneratórios do mercado financeiro, para determinada
                        operação, à época da assinatura do contrato entre as
                        partes, conforme o Bacen, a qual restou estipulada da
                        seguinte forma:{" "}
                        <b>
                          {roundToDecimals(
                            referenceInterestRate * 100,
                            2
                          ).toLocaleString("pt-br", numberFormat)}
                        </b>{" "}
                        % ao mês e{" "}
                        <b>
                          {roundToDecimals(
                            calculateAnnualEffectiveInterestRate(
                              referenceInterestRate
                            ) * 100,
                            2
                          ).toLocaleString("pt-br", numberFormat)}
                        </b>{" "}
                        % ao ano.
                      </p>
                      <p>
                        A respectiva abusividade no patamar da taxa de juros
                        remuneratórios, praticada por
                        <b>
                          {defendant.name.toUpperCase()}, pessoa jurídica de
                          direito privado, devidamente inscrita no CNPJ sob o nº
                          {defendant.document}, com sede no endereço{" "}
                          {defendant.address}
                        </b>
                        causou imenso prejuizo financeiro ao Consumidor, uma vez
                        que se fosse utilizado à taxa média do BACEN para a
                        operação financeira, teriamos as seguintes conclusões:
                      </p>

                      <table>
                        <thead className="white-bg">
                          <tr>
                            <th className="col-6">Cliente</th>
                            <th className="col-6">
                              <b>
                                {review.clientName}, brasileiro(a), portador(a)
                                do CPF sob nº ___.___.___-__, residente e
                                domiciliado(a) no endereço
                                _____________________________________________________________
                              </b>
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>Modalidade do Contrato</td>
                            <td>
                              <b>Aquisição de veículos</b>
                            </td>
                          </tr>
                          <tr>
                            <td>Nº de Parcelas</td>
                            <td>
                              <b>{review.installments}</b>
                            </td>
                          </tr>
                          <tr>
                            <td>Valor Financiado</td>
                            <td>
                              <b>
                                {roundToDecimals(
                                  review.totalLoaned,
                                  2
                                ).toLocaleString("pt-br", numberFormat)}
                              </b>
                            </td>
                          </tr>

                          <tr>
                            <td>Taxa Média BACEN</td>
                            <td>
                              <b>
                                {referenceInterestRate * 100}% a.m. e{" "}
                                {roundToDecimals(
                                  calculateAnnualEffectiveInterestRate(
                                    referenceInterestRate
                                  ) * 100,
                                  2
                                ).toLocaleString("pt-br", numberFormat)}
                                % a.a.
                              </b>
                            </td>
                          </tr>
                          <tr>
                            <td>Taxa Praticada</td>
                            <td>
                              <b>
                                {roundToDecimals(
                                  review.effectiveInterestRate * 100,
                                  2
                                )}
                                % a.m. e{" "}
                                {roundToDecimals(
                                  calculateAnnualEffectiveInterestRate(
                                    review.effectiveInterestRate
                                  ) * 100,
                                  2
                                ).toLocaleString("pt-br", numberFormat)}
                                % a.a.
                              </b>
                            </td>
                          </tr>
                          <tr>
                            <td>Valor da 1a parcela original</td>
                            <td>
                              <b>
                                {roundToDecimals(
                                  review.firstInstallmentValue,
                                  2
                                ).toLocaleString("pt-br", numberFormat)}
                              </b>
                            </td>
                          </tr>
                          <tr>
                            <td>Valor revisado da 1a parcela</td>
                            <td>
                              <b>
                                {roundToDecimals(
                                  review.revisedFirstInstallmentValue,
                                  2
                                ).toLocaleString("pt-br", numberFormat)}
                              </b>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      <p>
                        Novo Saldo Devedor:{" "}
                        <b>
                          {roundToDecimals(
                            revisedOperation.revisedInstallmentsTotal,
                            2
                          ).toLocaleString("pt-br", numberFormat)}
                        </b>
                      </p>
                    </div>
                    <div id="page-technical-report-2">
                      <h4>II. OBJETO DO CÁLCULO.</h4>
                      <p>
                        Os cálculos financeiros em anexo foram realizados para a
                        verificação de abusividade praticada em operação de
                        crédito bancária, tendo como base a taxa média apurada
                        pelo Banco Central Brasileiro para a operação
                        contratada, à época da assinatura do contrato.
                      </p>
                      <p></p>
                      <p>
                        Para tanto, foram utilizados os mesmos valores e
                        referencias da operação de crédito firmada entre as
                        partes, quais sejam o valor contratado e o prazo de
                        pagamento, substituindo apenas a taxa de juros
                        remuneratórios pactuada pela taxa média apurada pelo
                        Bacen.
                      </p>
                      <p>
                        {" "}
                        Assim apurou-se o valor original da parcela, caso a taxa
                        média do Bacen tivesse sido praticada desde o início do
                        respectivo acordo, apurando eventuais diferenças de
                        valores do que foi efetivamente pago.
                      </p>
                      <p>
                        Dessa forma, os valores excedentes foram atualizados
                        monetariamente pelo IGP- M, com incidência de juros de
                        1% a.m. e descontados do respectivo saldo devedor, que
                        por sua vez foi redistribuido pelo prazo restante de
                        pagamento previsto no contrato.
                      </p>
                      <p>
                        {" "}
                        Por fim, ressalta-se que foram utilizadas operações de
                        matemática aritmética, nos termos do que determina o
                        Código de Processo Civil Brasileiro.
                      </p>
                      <h4>
                        III. TAXA MÉDIA DE JUROS REMUNERATÓRIOS DO MERCADO
                        FINANCEIRO SEGUNDO O BACEN.
                      </h4>
                      <p>
                        O Banco Central do Brasil apurou que, na data de
                        celebração do contrato entre as partes, qual seja 01 de
                        junho de 2023, o mercado financeiro práticou, em média,
                        a taxa de{" "}
                        {roundToDecimals(referenceInterestRate, 2) * 100}% ao
                        mês e{" "}
                        {roundToDecimals(
                          calculateAnnualEffectiveInterestRate(
                            referenceInterestRate
                          ) * 100,
                          2
                        ).toLocaleString("pt-br", numberFormat)}{" "}
                        % ao ano, para a respectiva operação de crédito.
                      </p>
                      <p>
                        Para fins de verificação da taxa média de juros
                        remuneratórios para respectiva operação de crédito,
                        segundo o Banco Central, basta uma consulta simples no
                        portal eletrônico
                        (https://www3.bcb.gov.br/sgspub/localizarseries/localizarSeries.do?
                        method=prepararTelaLocalizarSeries), utilizando-se dos
                        seguintes códigos de pesquisa: <b>25471</b> para taxa
                        média mensal, ou ainda <b>20749</b> para taxa média
                        anual.
                      </p>
                      <h4>IV. DO ENTENDIMENTO JURISPRUDENCIAL.</h4>
                      <p>
                        A utilização da taxa média do BACEN como referencia para
                        fins de apuração de abusividade na prática da taxa de
                        juros remuneratórios por Bancos e Instituições
                        Financeiras é respaldada por entendimento proferido pelo
                        Superior Tribunal de Justiça no{" "}
                        <b>julgamento do Resp. 1.061.530/RS</b> e adotado pelas
                        demais Cortes Jurídicas do País. Vejamos:
                      </p>
                      <p className="small-text">
                        1.2. A Revisão dos Juros Remuneratórios Pactuados Fixada
                        a premissa de que, salvo situações excepcionais, os
                        juros remuneratórios podem ser livremente pactuados em
                        contratos de empréstimo no âmbito do Sistema Financeiro
                        Nacional, questiona-se a possibilidade de o Poder
                        Judiciário exercer o controle da liberdade de convenção
                        de taxa de juros naquelas situações que são
                        evidentemente abusivas.
                      </p>
                      <p className="small-text">(...)</p>
                    </div>
                    <div id="page-technical-report-3">
                      <p className="small-text">
                        Assim, a análise da abusividade ganhou muito quando o
                        Banco Central do Brasil passou, em outubro de 1999, a
                        divulgar as taxas médias, ponderada segundo o volume de
                        crédito concedido, para os juros praticados pelas
                        instituições financeiras nas operações de crédito
                        realizadas com recursos livres (conf. Circular nº 2957,
                        de 30.12.1999).
                      </p>
                      <p className="small-text">(...)</p>
                      <p className="small-text">
                        <b>
                          A taxa média apresenta vantagens porque é calculada
                          segundo as informações prestadas por diversas
                          instituições financeiras e, por isso, representa as
                          forças do mercado
                        </b>
                        . Ademais, traz embutida em si o custo médio das
                        instituições financeiras e seu lucro médio, ou seja, um
                        'spread' médio. É certo, ainda, que o cálculo da taxa
                        média não é completo, na medida em que não abrange todas
                        as modalidades de concessão de crédito, mas, sem dúvida,
                        presta-se como parâmetro de tendência das taxas de
                        juros.{" "}
                        <b>
                          Assim, dentro do universo regulatório atual, a taxa
                          média constitui o melhor parâmetro para a elaboração
                          de um juízo sobre abusividade.
                        </b>
                      </p>
                      <p className="small-text">(...)</p>
                      <p className="small-text">
                        <b>
                          A jurisprudência, conforme registrado anteriormente,
                          tem considerado abusivas taxas superiores a uma vez e
                          meia
                        </b>
                        (voto proferido pelo Min. Ari Pargendler no REsp
                        271.214/RS, Rel. p. Acórdão Min. Menezes Direito, DJ de
                        04.08.2003), ao dobro (Resp 1.036.818, Terceira Turma,
                        minha relatoria, DJe de 20.06.2008) ou ao triplo (REsp
                        971.853/RS, Quarta Turma, Min. Pádua Ribeiro, DJ de
                        24.09.2007) da média.” (REsp 1061530 RS, Rel. Ministra
                        NANCY ANDRIGHI, SEGUNDA SEÇÃO, julgado em 22/10/2008,
                        DJe 10/03/2009).
                      </p>
                      <p>
                        Logo a respectiva taxa média, apurada mensalmente pelo
                        Bacen, é importante instrumento para apuração de
                        possíveis ilegalidades cometidas contra o consumidor no
                        momento da contratação de operações de crédito, como bem
                        reconheceu o Superior Tribunal de Justiça e os demais
                        Tribunais de Justiça e Tribunais Regionais Federais.
                      </p>
                      <h4>V. DA DESCONSIDERAÇÃO DA MORA.</h4>
                      <p>
                        Diante do entendimento jurisprudencial destacado acima,
                        percebe-se que quando constatada abusividade contratual
                        na estipulação dos juros remuneratórios, como no
                        presente contrato, para fins de cálculo, deve
                        descaracterizar toda e qualquer eventual mora do
                        consumidor.
                      </p>
                      <p>
                        Logo, o presente cálculo desconsiderou todos os valores
                        que, porventura, o consumidor tenha vindo a pagar em
                        atraso, abatendo os valores pagos com encargos
                        moratórios (multa e/ou juros moratórios) do saldo
                        devedor remanescente.
                      </p>
                      <h4>VI. CONCLUSÃO DO CÁLCULO.</h4>
                      <p>
                        Conclui-se que no contrato que restou sob análise, a
                        Instituição Financeira praticou patamares abusivos de
                        juros remuneratóros, isto porque a taxa imposta superou
                        a taxa média, apurada pelo BACEN, para a operação
                        contratada, à época da assinatura do pacto entre as
                        partes.
                      </p>
                      <p>
                        Dessa forma, readequando a taxa de juros remuneratórios
                        aos patamares médios do mercado financeiro, segundo
                        Bacen, e abatendo os valores eventualmente pagos a
                        maior, os quais foram atualizados monetariamente pelo ,
                        ou ainda abatendo eventuais valores cobrados a título de
                        mora, que foram corrigidos da mesma forma anteriormente
                        descrita, têm se que o novo saldo devedor remanescente
                        apurado é de R${" "}
                        <b>
                          {roundToDecimals(
                            revisedOperation.revisedInstallmentsTotal,
                            2
                          ).toLocaleString("pt-br", numberFormat)}
                        </b>
                        .
                      </p>
                      <p>
                        Desta maneira, o novo valor da parcela a ser pago foi
                        estipulado a partir do saldo devedor remanescente
                        apurado e do prazo restante do contrato pactuado,
                        restando assim como novo valor da parcela mensal a
                        quantia de R${" "}
                        {roundToDecimals(
                          review.revisedFirstInstallmentValue,
                          2
                        ).toLocaleString("pt-br", numberFormat)}
                      </p>
                    </div>
                  </div>
                )}
            </CustomTabPanel>
          </div>
          <FloatingButton onClick={generatePDF} />
        </>
      )}
    </>
  );
};

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3, padding: 0 }}>{children}</Box>}
    </div>
  );
}
