export interface Bank {
  document: string;
  name: string;
  address: string;
  code?: string;
  monthlyInterestRate: number;
  effectiveYearlyInterestRate: number;
}

export const banks: Bank[] = [
  {
    document: "00.000.000/0000-00",
    name: "TEST BANK",
    address: "",
    monthlyInterestRate: 2.0,
    effectiveYearlyInterestRate: 26.48,
  },
  {
    document: "02.992.446/0001-75",
    name: "BANCO CNH INDUSTRIAL CAPITAL S.A",
    address:
      "Avenida Juscelino Kubitschek de Oliveira, 11825, CIDADE INDUSTRIAL, CURITIBA - PR, CEP 81170-901",
    code: "M19",
    monthlyInterestRate: 1.01,
    effectiveYearlyInterestRate: 12.8,
  },
  {
    document: "59.274.605/0001-13",
    name: "BCO GM S.A.",
    address: "Av Indianopolis, 3096, Indianopolis - SP, CEP 04062-003",
    code: "390",
    monthlyInterestRate: 1.11,
    effectiveYearlyInterestRate: 14.21,
  },
  {
    document: "04.452.473/0001-80",
    name: "BMW FINANCEIRA S.A. - CFI",
    address:
      "AVENIDA DOUTOR CHUCRI ZAIDAN, 1240, ANDAR 22CONJ2202 E 2204 PARTE - VILA SAO FRANCISCO ZONA SUL - SP, CEP 04711-130",
    monthlyInterestRate: 1.21,
    effectiveYearlyInterestRate: 15.35,
  },
  {
    document: "28.517.628/0001-88",
    name: "BANCO PACCAR S.A",
    address:
      "AVENIDA SENADOR FLAVIO CARVALHO GUIMARAES, 6000, PONTA GROSSA - PR, CEP 84072-190",
    monthlyInterestRate: 1.22,
    effectiveYearlyInterestRate: 15.63,
  },
  {
    document: "60.814.191/0001-57",
    name: "BCO MERCEDES-BENZ S.A.",
    address:
      "Avenida Alfred Jurzykowski, 562, Andar 2, PAULICEIA, SAO BERNARDO DO CAMPO - SP, CEP 09680-900",
    code: "	381",
    monthlyInterestRate: 1.23,
    effectiveYearlyInterestRate: 15.83,
  },
  {
    document: "11.417.016/0001-10",
    name: "SCANIA BCO S.A.",
    address:
      "Avenida Jose Odorizzi, 151, Sao Bernardo Do Campo - SP, CEP 09810-000",
    monthlyInterestRate: 1.27,
    effectiveYearlyInterestRate: 16.34,
  },
  {
    document: "58.017.179/0001-70",
    code: "M23",
    address:
      "Avenida Juscelino Kubitscheck de Oliveira, 2.600, Predio 160, Cidade Industrial, Curitiba - PR, CEP 81260-900",
    name: "BCO VOLVO BRASIL S.A.",
    monthlyInterestRate: 1.31,
    effectiveYearlyInterestRate: 16.87,
  },
  {
    document: "03.502.961/0001- 92",
    code: "M24",
    address:
      "AVENIDA MARIA COELHO AGUIAR, 215, BLOCO F ANDAR 5 - JARDIM SAO LUIS, SÃO PAULO - SP, CEP 05804-900",
    name: "BCO PSA FINANCE BRASIL S.A.",
    monthlyInterestRate: 1.34,
    effectiveYearlyInterestRate: 17.26,
  },
  {
    document: "59.109.165/0007-34",
    code: "393",
    address:
      "Rua Padre Carapuceiro, 733 - 5 Andar, Boa Viagem, Recife - PE, CEP 51020-280",
    name: "BCO VOLKSWAGEN S.A",
    monthlyInterestRate: 1.38,
    effectiveYearlyInterestRate: 17.91,
  },
  {
    document: "62.307.848/0001-15",
    name: "BCO RCI BRASIL S.A.",
    address: "RUA PASTEUR, 463, AGUA VERDE, CURITIBA - PR, CEP 80250-104",
    monthlyInterestRate: 1.47,
    effectiveYearlyInterestRate: 19.09,
  },
  {
    document: "33.603.457/0001-40",
    code: "120",
    address:
      "Rua Estado de Israel, 975, Vila Clementino, SÃO PAULO - SP, CEP 04022-002",
    name: "BCO RODOBENS S.A.",
    monthlyInterestRate: 1.62,
    effectiveYearlyInterestRate: 21.25,
  },
  {
    document: "30.172.491/0001-19",
    name: "BANCO HYUNDAI CAPITAL BRASIL",
    address:
      "Avenida Das Nacoes Unidas, 14171, 24 Andar - Parte Torre Crystal, Vila Gertrudes, SÃO PAULO - SP, 04794-000",
    monthlyInterestRate: 1.62,
    effectiveYearlyInterestRate: 21.25,
  },
  {
    document: "60.746.948/0001-12",
    code: "237",
    address: "NUC CIDADE DE DEUS S/N, OSASCO - SP, CEP 06029-900",
    name: "BCO BRADESCO S.A.",
    monthlyInterestRate: 1.67,
    effectiveYearlyInterestRate: 21.96,
  },
  {
    document: "17.167.412/0001-13",
    name: "FINANC ALFA S.A. CFI",
    address:
      "ALAMEDA SANTOS, 466, 4 ANDAR - PARTE, CERQUEIRA CESAR, SÃO PAULO - SP, CEP 01418-000",
    monthlyInterestRate: 1.68,
    effectiveYearlyInterestRate: 22.08,
  },
  {
    document: "92.702.067/0001-96",
    code: "041",
    name: "BCO DO ESTADO DO RS S.A.",
    address:
      "RUA CAPITAO MONTANHA, 177, CENTRO, PORTO ALEGRE - RS, CEP 90010-040",
    monthlyInterestRate: 1.72,
    effectiveYearlyInterestRate: 22.74,
  },
  {
    document: "3.215.790/0001-10",
    code: "387",
    name: "BCO TOYOTA DO BRASIL S.A.",
    address:
      "Avenida Jornalista Roberto Marinho, 85, ANDAR 3, SÃO PAULO - SP, CEP 04576-010",
    monthlyInterestRate: 1.75,
    effectiveYearlyInterestRate: 23.12,
  },
  {
    document: "60.872.504/0001-23",
    code: "652",
    name: "ITAÚ UNIBANCO HOLDING S.A.",
    address:
      "PRAÇA ALFREDO EGYDIO DE SOUZA ARANHA, 100, SÃO PAULO - SP, CEP 04344-902",
    monthlyInterestRate: 1.8,
    effectiveYearlyInterestRate: 23.83,
  },
  {
    document: "00.000.000/0001-91",
    code: "1",
    name: "BCO DO BRASIL S.A.",
    address:
      "QUADRA SAUN QUADRA 5 BLOCO B TORRE I, II, III, SN, ANDAR T I SL S101 A S1602 T II SL C101 A C1602 TIII SL N101 A N1602, BRASÍLIA - DF, CEP 70040-912",
    monthlyInterestRate: 1.85,
    effectiveYearlyInterestRate: 24.65,
  },
  {
    document: "22.639.377/0001-28",
    name: "SINOSSERRA S/A - SCFI",
    address:
      "AVENIDA PEDRO ADAMS FILHO, 3790, SALA: 401 - PATRIA NOVA, NOVO HAMBURGO - RS, CEP 93410-038",
    monthlyInterestRate: 1.86,
    effectiveYearlyInterestRate: 24.77,
  },
  {
    document: "00.360.305/0001-04",
    code: "104",
    address:
      "ST BANCARIO SUL QUADRA 04, 34, BLOCO A, CEP 70092-900, BRASÍLIA, DF",
    name: "CAIXA ECONOMICA FEDERAL",
    monthlyInterestRate: 1.86,
    effectiveYearlyInterestRate: 24.77,
  },
  {
    document: "45.437.547/0001-97",
    address:
      " Avenida Paulista, 2150, Bela Vista, São Paulo - SP, CEP 01310-300",
    code: "104",
    name: "SAFRA CFI S.A.",
    monthlyInterestRate: 1.87,
    effectiveYearlyInterestRate: 24.83,
  },
  {
    document: "31.872.495/0001-72",
    code: "336",
    name: "BCO C6 S.A.",
    address:
      "Av. 9 de Julho, 3.186, Jd. Paulista, São Paulo - SP, CEP 01406-000",
    monthlyInterestRate: 1.9,
    effectiveYearlyInterestRate: 25.36,
  },
  {
    document: "07.707.650/0001-10",
    name: "AYMORÉ CFI S.A.",
    address: "RUA AMADOR BUENO, 474, SANTO AMARO, SÃO PAULO - SP, 04752-901",
    monthlyInterestRate: 1.9,
    effectiveYearlyInterestRate: 25.36,
  },
  {
    document: "01.852.137/0001-37",
    name: "BCO BRASILEIRO DE CRÉDITO S.A.",
    address:
      "Rua Doutor Renato Paes de Barros 1017 Conj 91 Sala L Edif Corporate Park, Itaim Bibi São Paulo - SP, CEP 04530-001",
    monthlyInterestRate: 1.95,
    effectiveYearlyInterestRate: 26.02,
  },
  {
    document: "07.207.996/0001-50",
    code: "394",
    name: "BCO BRADESCO FINANC. S.A.",
    address:
      "NÚCLEO CIDADE DE DEUS, S/N, ANDAR 4, PRED. PRATA - VILA YARA, OSASCO - SP, CEP 06029-900",
    monthlyInterestRate: 1.98,
    effectiveYearlyInterestRate: 26.48,
  },
  {
    document: "59.588.111/0001-03",
    code: "655",
    address:
      "AVENIDA DAS NACOES UNIDAS, 14171 TORRE A ANDAR 18 - VILA GERTRUDES, SÃO PAULO - SP, CEP 04794-000",
    name: "BCO VOTORANTIM S.A.",
    monthlyInterestRate: 2.07,
    effectiveYearlyInterestRate: 27.89,
  },
  {
    document: "28.127.603/0001-78",
    code: "021",
    name: "BCO BANESTES S.A.",
    address:
      "Avenida Princesa Isabel, 574, Edif Palas Center Bloco B Andar 9, VITÓRIA - ES, CEP 29010-930",
    monthlyInterestRate: 2.09,
    effectiveYearlyInterestRate: 28.17,
  },
  {
    document: "04.862.600/0001-10",
    name: "PORTOSEG S.A. CFI",
    address:
      "ALAMEDA BARÃO DE PIRACICABA, 740, ANDAR 4 BLOCO LADO B COND TORRE B, CAMPOS ELÍSEOS, SÃO PAULO - SP, CEP 01216-012",
    monthlyInterestRate: 2.09,
    effectiveYearlyInterestRate: 28.2,
  },
  {
    document: "90.400.888/0001-42",
    code: "33",
    name: "BCO SANTANDER (BRASIL) S.A.",
    address:
      "AVENIDA PRES JUSCELINO KUBITSCHEK, 2041, CONJ 281 BLOCO A COND WTORRE JK, VILA NOVA CONCEICAO, SÃO PAULO - SP, CEP 04543-011",
    monthlyInterestRate: 2.27,
    effectiveYearlyInterestRate: 30.87,
  },
  {
    document: "03.634.220/0001-65",
    code: "M22",
    name: "BCO HONDA S.A.",
    address:
      "RUA DOUTOR JOSE AUREO BUSTAMANTE, 377 ANDAR 3 ANDAR - SANTO AMARO, SÃO PAULO - SP, CEP 04710-090",
    monthlyInterestRate: 2.29,
    effectiveYearlyInterestRate: 31.16,
  },
  {
    document: "60.701.190/0001-04",
    code: "341",
    address:
      "PRACA ALFREDO EGYDIO DE SOUZA ARANHA, 100, BLOCO TORRE OLAVO SETUBAL, PARQUE JABAQUARA, SÃO PAULO - SP, CEP 04344-902",
    name: "ITAÚ UNIBANCO S.A.",
    monthlyInterestRate: 2.32,
    effectiveYearlyInterestRate: 31.74,
  },
  {
    document: "10.371.492/0001-85",
    name: "BCO YAMAHA MOTOR S.A.",
    address:
      "AVENIDA MAGALHAES DE CASTRO, 4800 CONJ71 E 72 TORRE 3 SETOR R1 E R3 EDIFCONTINENTAL TOWER - CIDADE JARDIM, SÃO PAULO - SP, CEP 05676-120",
    monthlyInterestRate: 2.57,
    effectiveYearlyInterestRate: 35.62,
  },
  {
    document: "92.874.270/0001-40",
    name: "BCO DIGIMAIS S.A.",
    address:
      "RUA ELVIRA FERRAZ, 250 CONJ1102 - VILA OLIMPIA, SÃO PAULO - SP, CEP 04552-040",
    monthlyInterestRate: 2.73,
    effectiveYearlyInterestRate: 38.13,
  },
  {
    document: "33.136.888/0001-43",
    name: "BRB - CFI S/A",
    address: "QUADRA SAUN QUADRA 5 BLOCO C TORRE III, S/N, SALA 301, ASA NORTE, BRASÍLIA - DF, CEP 70040-250",
    monthlyInterestRate: 2.77,
    effectiveYearlyInterestRate: 38.88,
  },
  {
    document: "34.991.938/0001-32",
    name: "SIMPALA S.A. CFI",
    address: "Avenida Ipiranga, 6500, PORTO ALEGRE - RS, CEP 90610-000",
    monthlyInterestRate: 2.91,
    effectiveYearlyInterestRate: 41.05,
  },
  {
    document: "05.676.026/0001-78",
    address: "Avenida Veneza, 1033, SAO ROQUE, FARROUPILHA - RS, CEP9 5176-053",
    name: "CREDIARE CFI S.A.",
    monthlyInterestRate: 2.91,
    effectiveYearlyInterestRate: 41.09,
  },
  {
    document: "00.411.939/0001-49",
    name: "FINAMAX S.A. CFI",
    address: "Rua Rangel Pestana 681, CENTRO, JUNDIAÍ - SP, CEP 13201-000",
    monthlyInterestRate: 3.04,
    effectiveYearlyInterestRate: 41.09,
  },
  {
    document: "59.285.411/0001-13",
    code: "623",
    address: "AVENIDA PAULISTA, 1374, ANDAR 7-8-15-16-17 E 18, BELA VISTA, SÃO PAULO - SP, CEP 01310-916",
    name: "BANCO PAN",
    monthlyInterestRate: 3.05,
    effectiveYearlyInterestRate: 43.44,
  },
  {
    document: "62.232.889/0001-90",
    code: "707",
    address: "AVENIDA PAULISTA, 1793, BELA VISTA, SÃO PAULO - SP, CEP 01311-200",
    name: "BCO DAYCOVAL S.A",
    monthlyInterestRate: 3.1,
    effectiveYearlyInterestRate: 44.29,
  },
  {
    document: "92.228.410/0001-02",
    address: "AVENIDA SAO GABRIEL, 555, JARDIM PAULISTA, SÃO PAULO - SP, CEP 01435-001",
    name: "OMNI SA CFI",
    monthlyInterestRate: 3.39,
    effectiveYearlyInterestRate: 49.26,
  },
  {
    document: "05.503.849/0001-00",
    name: "SF3 CFI S.A.",
    address: "RUA VOLUNTARIOS DA PATRIA, 1284 ANDAR 7 CONJ709 - SANTANA, SÃO PAULO - SP, CEP 02010-200",
    monthlyInterestRate: 3.99,
    effectiveYearlyInterestRate: 59.9,
  },
  {
    document: "80.271.455/0001-80",
    name: "BCO RNX S.A.",
    address: "RUA HEITOR STOCKLER DE FRANCA, 396 SALA303 ANDAR 03CONDNEO SUPER QUADRA ED BLOCO NEO SUPER QUADRA TOR - CENTRO CIVICO, CURITIBA - PR, CEP 80030-030",
    monthlyInterestRate: 4.02,
    effectiveYearlyInterestRate: 60.52,
  },
];
