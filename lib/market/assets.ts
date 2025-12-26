/**
 * FINANCEQUEST - ASSETS LIST
 * Liste complète des 105 actifs disponibles avec métadonnées
 */

export type AssetType = 'stock' | 'bond' | 'index';

export interface Asset {
  symbol: string;
  name: string;
  type: AssetType;
  category?: string;
  exchange?: string;
}

// ==========================================
// STOCKS (40 symboles)
// ==========================================

const STOCKS: Asset[] = [
  // Tech (15)
  { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'ADBE', name: 'Adobe Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'CRM', name: 'Salesforce Inc.', type: 'stock', category: 'Tech', exchange: 'NYSE' },
  { symbol: 'ORCL', name: 'Oracle Corporation', type: 'stock', category: 'Tech', exchange: 'NYSE' },
  { symbol: 'INTC', name: 'Intel Corporation', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'AMD', name: 'Advanced Micro Devices', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'QCOM', name: 'Qualcomm Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },
  { symbol: 'CSCO', name: 'Cisco Systems Inc.', type: 'stock', category: 'Tech', exchange: 'NASDAQ' },

  // Finance (10)
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'BAC', name: 'Bank of America Corp.', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'WFC', name: 'Wells Fargo & Company', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'GS', name: 'Goldman Sachs Group', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'MS', name: 'Morgan Stanley', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'MA', name: 'Mastercard Inc.', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'AXP', name: 'American Express Company', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'BLK', name: 'BlackRock Inc.', type: 'stock', category: 'Finance', exchange: 'NYSE' },
  { symbol: 'SCHW', name: 'Charles Schwab Corp.', type: 'stock', category: 'Finance', exchange: 'NYSE' },

  // Santé (8)
  { symbol: 'JNJ', name: 'Johnson & Johnson', type: 'stock', category: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'UNH', name: 'UnitedHealth Group', type: 'stock', category: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'PFE', name: 'Pfizer Inc.', type: 'stock', category: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'ABBV', name: 'AbbVie Inc.', type: 'stock', category: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'TMO', name: 'Thermo Fisher Scientific', type: 'stock', category: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'LLY', name: 'Eli Lilly and Company', type: 'stock', category: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'MRK', name: 'Merck & Co. Inc.', type: 'stock', category: 'Healthcare', exchange: 'NYSE' },
  { symbol: 'ABT', name: 'Abbott Laboratories', type: 'stock', category: 'Healthcare', exchange: 'NYSE' },

  // Consommation (7)
  { symbol: 'WMT', name: 'Walmart Inc.', type: 'stock', category: 'Consumer', exchange: 'NYSE' },
  { symbol: 'PG', name: 'Procter & Gamble Co.', type: 'stock', category: 'Consumer', exchange: 'NYSE' },
  { symbol: 'KO', name: 'Coca-Cola Company', type: 'stock', category: 'Consumer', exchange: 'NYSE' },
  { symbol: 'PEP', name: 'PepsiCo Inc.', type: 'stock', category: 'Consumer', exchange: 'NASDAQ' },
  { symbol: 'COST', name: 'Costco Wholesale Corp.', type: 'stock', category: 'Consumer', exchange: 'NASDAQ' },
  { symbol: 'NKE', name: 'Nike Inc.', type: 'stock', category: 'Consumer', exchange: 'NYSE' },
  { symbol: 'MCD', name: "McDonald's Corporation", type: 'stock', category: 'Consumer', exchange: 'NYSE' },

  // Énergie (8)
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', type: 'stock', category: 'Energy', exchange: 'NYSE' },
  { symbol: 'CVX', name: 'Chevron Corporation', type: 'stock', category: 'Energy', exchange: 'NYSE' },
  { symbol: 'COP', name: 'ConocoPhillips', type: 'stock', category: 'Energy', exchange: 'NYSE' },
  { symbol: 'SLB', name: 'Schlumberger Limited', type: 'stock', category: 'Energy', exchange: 'NYSE' },
  { symbol: 'EOG', name: 'EOG Resources Inc.', type: 'stock', category: 'Energy', exchange: 'NYSE' },
  { symbol: 'MPC', name: 'Marathon Petroleum Corp.', type: 'stock', category: 'Energy', exchange: 'NYSE' },
  { symbol: 'PSX', name: 'Phillips 66', type: 'stock', category: 'Energy', exchange: 'NYSE' },
  { symbol: 'VLO', name: 'Valero Energy Corporation', type: 'stock', category: 'Energy', exchange: 'NYSE' },

  // Industrie (10)
  { symbol: 'BA', name: 'Boeing Company', type: 'stock', category: 'Industrial', exchange: 'NYSE' },
  { symbol: 'CAT', name: 'Caterpillar Inc.', type: 'stock', category: 'Industrial', exchange: 'NYSE' },
  { symbol: 'GE', name: 'General Electric Co.', type: 'stock', category: 'Industrial', exchange: 'NYSE' },
  { symbol: 'HON', name: 'Honeywell International', type: 'stock', category: 'Industrial', exchange: 'NASDAQ' },
  { symbol: 'MMM', name: '3M Company', type: 'stock', category: 'Industrial', exchange: 'NYSE' },
  { symbol: 'UPS', name: 'United Parcel Service', type: 'stock', category: 'Industrial', exchange: 'NYSE' },
  { symbol: 'RTX', name: 'Raytheon Technologies', type: 'stock', category: 'Industrial', exchange: 'NYSE' },
  { symbol: 'LMT', name: 'Lockheed Martin Corp.', type: 'stock', category: 'Industrial', exchange: 'NYSE' },
  { symbol: 'DE', name: 'Deere & Company', type: 'stock', category: 'Industrial', exchange: 'NYSE' },
  { symbol: 'EMR', name: 'Emerson Electric Co.', type: 'stock', category: 'Industrial', exchange: 'NYSE' },

  // Télécommunications (5)
  { symbol: 'T', name: 'AT&T Inc.', type: 'stock', category: 'Telecom', exchange: 'NYSE' },
  { symbol: 'VZ', name: 'Verizon Communications', type: 'stock', category: 'Telecom', exchange: 'NYSE' },
  { symbol: 'TMUS', name: 'T-Mobile US Inc.', type: 'stock', category: 'Telecom', exchange: 'NASDAQ' },
  { symbol: 'CHTR', name: 'Charter Communications', type: 'stock', category: 'Telecom', exchange: 'NASDAQ' },
  { symbol: 'CMCSA', name: 'Comcast Corporation', type: 'stock', category: 'Telecom', exchange: 'NASDAQ' },

  // Retail & E-commerce (7)
  { symbol: 'HD', name: 'Home Depot Inc.', type: 'stock', category: 'Retail', exchange: 'NYSE' },
  { symbol: 'LOW', name: "Lowe's Companies Inc.", type: 'stock', category: 'Retail', exchange: 'NYSE' },
  { symbol: 'TGT', name: 'Target Corporation', type: 'stock', category: 'Retail', exchange: 'NYSE' },
  { symbol: 'SBUX', name: 'Starbucks Corporation', type: 'stock', category: 'Retail', exchange: 'NASDAQ' },
  { symbol: 'TJX', name: 'TJX Companies Inc.', type: 'stock', category: 'Retail', exchange: 'NYSE' },
  { symbol: 'BABA', name: 'Alibaba Group', type: 'stock', category: 'Retail', exchange: 'NYSE' },

  // Matériaux & Chimie (5)
  { symbol: 'LIN', name: 'Linde plc', type: 'stock', category: 'Materials', exchange: 'NYSE' },
  { symbol: 'APD', name: 'Air Products & Chemicals', type: 'stock', category: 'Materials', exchange: 'NYSE' },
  { symbol: 'SHW', name: 'Sherwin-Williams Company', type: 'stock', category: 'Materials', exchange: 'NYSE' },
  { symbol: 'NEM', name: 'Newmont Corporation', type: 'stock', category: 'Materials', exchange: 'NYSE' },
  { symbol: 'FCX', name: 'Freeport-McMoRan Inc.', type: 'stock', category: 'Materials', exchange: 'NYSE' },

  // Utilities (5)
  { symbol: 'NEE', name: 'NextEra Energy Inc.', type: 'stock', category: 'Utilities', exchange: 'NYSE' },
  { symbol: 'DUK', name: 'Duke Energy Corporation', type: 'stock', category: 'Utilities', exchange: 'NYSE' },
  { symbol: 'SO', name: 'Southern Company', type: 'stock', category: 'Utilities', exchange: 'NYSE' },
  { symbol: 'D', name: 'Dominion Energy Inc.', type: 'stock', category: 'Utilities', exchange: 'NYSE' },
  { symbol: 'AEP', name: 'American Electric Power', type: 'stock', category: 'Utilities', exchange: 'NASDAQ' },

  // Immobilier (5)
  { symbol: 'AMT', name: 'American Tower Corp.', type: 'stock', category: 'Real Estate', exchange: 'NYSE' },
  { symbol: 'PLD', name: 'Prologis Inc.', type: 'stock', category: 'Real Estate', exchange: 'NYSE' },
  { symbol: 'CCI', name: 'Crown Castle Inc.', type: 'stock', category: 'Real Estate', exchange: 'NYSE' },
  { symbol: 'EQIX', name: 'Equinix Inc.', type: 'stock', category: 'Real Estate', exchange: 'NASDAQ' },
  { symbol: 'SPG', name: 'Simon Property Group', type: 'stock', category: 'Real Estate', exchange: 'NYSE' },

  // Actions Françaises (50)
  { symbol: 'LIGH.PA', name: 'LightOn', type: 'stock', category: 'Tech', exchange: 'Euronext Paris' },
  { symbol: 'MC.PA', name: 'LVMH', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'OR.PA', name: "L'Oréal", type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'SAN.PA', name: 'Sanofi', type: 'stock', category: 'Healthcare', exchange: 'Euronext Paris' },
  { symbol: 'TTE.PA', name: 'TotalEnergies', type: 'stock', category: 'Energy', exchange: 'Euronext Paris' },
  { symbol: 'AI.PA', name: 'Air Liquide', type: 'stock', category: 'Materials', exchange: 'Euronext Paris' },
  { symbol: 'BNP.PA', name: 'BNP Paribas', type: 'stock', category: 'Finance', exchange: 'Euronext Paris' },
  { symbol: 'ACA.PA', name: 'Crédit Agricole', type: 'stock', category: 'Finance', exchange: 'Euronext Paris' },
  { symbol: 'GLE.PA', name: 'Société Générale', type: 'stock', category: 'Finance', exchange: 'Euronext Paris' },
  { symbol: 'SU.PA', name: 'Schneider Electric', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'SAF.PA', name: 'Safran', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'AIR.PA', name: 'Airbus', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'CS.PA', name: 'AXA', type: 'stock', category: 'Finance', exchange: 'Euronext Paris' },
  { symbol: 'DG.PA', name: 'Vinci', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'EL.PA', name: 'EssilorLuxottica', type: 'stock', category: 'Healthcare', exchange: 'Euronext Paris' },
  { symbol: 'BN.PA', name: 'Danone', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'KER.PA', name: 'Kering', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'RMS.PA', name: 'Hermès', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'EN.PA', name: 'Bouygues', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'CAP.PA', name: 'Capgemini', type: 'stock', category: 'Tech', exchange: 'Euronext Paris' },
  { symbol: 'SGO.PA', name: 'Saint-Gobain', type: 'stock', category: 'Materials', exchange: 'Euronext Paris' },
  { symbol: 'RNO.PA', name: 'Renault', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'STM.PA', name: 'STMicroelectronics', type: 'stock', category: 'Tech', exchange: 'Euronext Paris' },
  { symbol: 'PUB.PA', name: 'Publicis Groupe', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'UG.PA', name: 'Peugeot', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'DSY.PA', name: 'Dassault Systèmes', type: 'stock', category: 'Tech', exchange: 'Euronext Paris' },
  { symbol: 'VIE.PA', name: 'Veolia', type: 'stock', category: 'Utilities', exchange: 'Euronext Paris' },
  { symbol: 'ORA.PA', name: 'Orange', type: 'stock', category: 'Telecom', exchange: 'Euronext Paris' },
  { symbol: 'RI.PA', name: 'Pernod Ricard', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'URW.PA', name: 'Unibail-Rodamco-Westfield', type: 'stock', category: 'Real Estate', exchange: 'Euronext Paris' },
  { symbol: 'ML.PA', name: 'Michelin', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'HO.PA', name: 'Thales', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'VIV.PA', name: 'Vivendi', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'WLN.PA', name: 'Worldline', type: 'stock', category: 'Tech', exchange: 'Euronext Paris' },
  { symbol: 'ATO.PA', name: 'Atos', type: 'stock', category: 'Tech', exchange: 'Euronext Paris' },
  { symbol: 'FP.PA', name: 'Société BIC', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'NK.PA', name: 'Imerys', type: 'stock', category: 'Materials', exchange: 'Euronext Paris' },
  { symbol: 'GET.PA', name: 'Getlink', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'SW.PA', name: 'Sodexo', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'SOI.PA', name: 'Soitec', type: 'stock', category: 'Tech', exchange: 'Euronext Paris' },
  { symbol: 'AF.PA', name: 'Air France-KLM', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'LR.PA', name: 'Legrand', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'FGR.PA', name: 'Eiffage', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'ENGI.PA', name: 'ENGIE', type: 'stock', category: 'Utilities', exchange: 'Euronext Paris' },
  { symbol: 'BOL.PA', name: 'Bolloré', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'ADP.PA', name: 'Aéroports de Paris', type: 'stock', category: 'Industrial', exchange: 'Euronext Paris' },
  { symbol: 'COV.PA', name: 'Covivio', type: 'stock', category: 'Real Estate', exchange: 'Euronext Paris' },
  { symbol: 'FR.PA', name: 'Valeo', type: 'stock', category: 'Consumer', exchange: 'Euronext Paris' },
  { symbol: 'MAU.PA', name: 'Maurel & Prom', type: 'stock', category: 'Energy', exchange: 'Euronext Paris' },
  { symbol: 'TEP.PA', name: 'Teleperformance', type: 'stock', category: 'Tech', exchange: 'Euronext Paris' },

  // Actions Européennes non-françaises (50)
  // Allemagne
  { symbol: 'VOW3.DE', name: 'Volkswagen', type: 'stock', category: 'Consumer', exchange: 'XETRA' },
  { symbol: 'SIE.DE', name: 'Siemens', type: 'stock', category: 'Industrial', exchange: 'XETRA' },
  { symbol: 'SAP.DE', name: 'SAP', type: 'stock', category: 'Tech', exchange: 'XETRA' },
  { symbol: 'MBG.DE', name: 'Mercedes-Benz Group', type: 'stock', category: 'Consumer', exchange: 'XETRA' },
  { symbol: 'BMW.DE', name: 'BMW', type: 'stock', category: 'Consumer', exchange: 'XETRA' },
  { symbol: 'ALV.DE', name: 'Allianz', type: 'stock', category: 'Finance', exchange: 'XETRA' },
  { symbol: 'BAS.DE', name: 'BASF', type: 'stock', category: 'Materials', exchange: 'XETRA' },
  { symbol: 'BAYN.DE', name: 'Bayer', type: 'stock', category: 'Healthcare', exchange: 'XETRA' },
  { symbol: 'DTE.DE', name: 'Deutsche Telekom', type: 'stock', category: 'Telecom', exchange: 'XETRA' },
  { symbol: 'DBK.DE', name: 'Deutsche Bank', type: 'stock', category: 'Finance', exchange: 'XETRA' },
  { symbol: 'ADS.DE', name: 'Adidas', type: 'stock', category: 'Consumer', exchange: 'XETRA' },
  { symbol: 'MUV2.DE', name: 'Munich Re', type: 'stock', category: 'Finance', exchange: 'XETRA' },
  { symbol: 'IFX.DE', name: 'Infineon', type: 'stock', category: 'Tech', exchange: 'XETRA' },
  { symbol: 'HEN3.DE', name: 'Henkel', type: 'stock', category: 'Consumer', exchange: 'XETRA' },
  
  // Royaume-Uni
  { symbol: 'BP.L', name: 'BP', type: 'stock', category: 'Energy', exchange: 'LSE' },
  { symbol: 'SHEL.L', name: 'Shell', type: 'stock', category: 'Energy', exchange: 'LSE' },
  { symbol: 'HSBA.L', name: 'HSBC', type: 'stock', category: 'Finance', exchange: 'LSE' },
  { symbol: 'AZN.L', name: 'AstraZeneca', type: 'stock', category: 'Healthcare', exchange: 'LSE' },
  { symbol: 'GSK.L', name: 'GSK', type: 'stock', category: 'Healthcare', exchange: 'LSE' },
  { symbol: 'ULVR.L', name: 'Unilever', type: 'stock', category: 'Consumer', exchange: 'LSE' },
  { symbol: 'DGE.L', name: 'Diageo', type: 'stock', category: 'Consumer', exchange: 'LSE' },
  { symbol: 'RIO.L', name: 'Rio Tinto', type: 'stock', category: 'Materials', exchange: 'LSE' },
  { symbol: 'BARC.L', name: 'Barclays', type: 'stock', category: 'Finance', exchange: 'LSE' },
  { symbol: 'VOD.L', name: 'Vodafone', type: 'stock', category: 'Telecom', exchange: 'LSE' },
  { symbol: 'LLOY.L', name: 'Lloyds Banking Group', type: 'stock', category: 'Finance', exchange: 'LSE' },
  { symbol: 'LSEG.L', name: 'London Stock Exchange', type: 'stock', category: 'Finance', exchange: 'LSE' },
  
  // Suisse
  { symbol: 'NESN.SW', name: 'Nestlé', type: 'stock', category: 'Consumer', exchange: 'SIX' },
  { symbol: 'ROG.SW', name: 'Roche', type: 'stock', category: 'Healthcare', exchange: 'SIX' },
  { symbol: 'NOVN.SW', name: 'Novartis', type: 'stock', category: 'Healthcare', exchange: 'SIX' },
  { symbol: 'UBS.SW', name: 'UBS', type: 'stock', category: 'Finance', exchange: 'SIX' },
  { symbol: 'ABBN.SW', name: 'ABB', type: 'stock', category: 'Industrial', exchange: 'SIX' },
  { symbol: 'ZURN.SW', name: 'Zurich Insurance', type: 'stock', category: 'Finance', exchange: 'SIX' },
  
  // Pays-Bas
  { symbol: 'ASML.AS', name: 'ASML', type: 'stock', category: 'Tech', exchange: 'AEX' },
  { symbol: 'INGA.AS', name: 'ING Group', type: 'stock', category: 'Finance', exchange: 'AEX' },
  { symbol: 'PHIA.AS', name: 'Philips', type: 'stock', category: 'Healthcare', exchange: 'AEX' },
  { symbol: 'HEIA.AS', name: 'Heineken', type: 'stock', category: 'Consumer', exchange: 'AEX' },
  
  // Espagne
  { symbol: 'ITX.MC', name: 'Inditex (Zara)', type: 'stock', category: 'Consumer', exchange: 'BME' },
  { symbol: 'SAN.MC', name: 'Banco Santander', type: 'stock', category: 'Finance', exchange: 'BME' },
  { symbol: 'IBE.MC', name: 'Iberdrola', type: 'stock', category: 'Utilities', exchange: 'BME' },
  { symbol: 'TEF.MC', name: 'Telefónica', type: 'stock', category: 'Telecom', exchange: 'BME' },
  { symbol: 'BBVA.MC', name: 'BBVA', type: 'stock', category: 'Finance', exchange: 'BME' },
  
  // Italie
  { symbol: 'ENI.MI', name: 'Eni', type: 'stock', category: 'Energy', exchange: 'Borsa' },
  { symbol: 'ENEL.MI', name: 'Enel', type: 'stock', category: 'Utilities', exchange: 'Borsa' },
  { symbol: 'ISP.MI', name: 'Intesa Sanpaolo', type: 'stock', category: 'Finance', exchange: 'Borsa' },
  { symbol: 'UCG.MI', name: 'UniCredit', type: 'stock', category: 'Finance', exchange: 'Borsa' },
  { symbol: 'STLA.MI', name: 'Stellantis', type: 'stock', category: 'Consumer', exchange: 'Borsa' },
  
  // Suède
  { symbol: 'VOLV-B.ST', name: 'Volvo', type: 'stock', category: 'Consumer', exchange: 'OMX' },
  { symbol: 'ERIC-B.ST', name: 'Ericsson', type: 'stock', category: 'Tech', exchange: 'OMX' },
  { symbol: 'HM-B.ST', name: 'H&M', type: 'stock', category: 'Consumer', exchange: 'OMX' },
  
  // Danemark
  { symbol: 'NOVO-B.CO', name: 'Novo Nordisk', type: 'stock', category: 'Healthcare', exchange: 'OMX' },
];

// ==========================================
// BONDS (10 symboles)
// ==========================================

const BONDS: Asset[] = [
  { symbol: '^TNX', name: 'US Treasury 10Y', type: 'bond' },
  { symbol: '^TYX', name: 'US Treasury 30Y', type: 'bond' },
  { symbol: '^FVX', name: 'US Treasury 5Y', type: 'bond' },
  { symbol: '^IRX', name: 'US Treasury 13W', type: 'bond' },
  { symbol: 'TLT', name: '20+ Year Treasury ETF', type: 'bond' },
  { symbol: 'IEF', name: '7-10 Year Treasury ETF', type: 'bond' },
  { symbol: 'SHY', name: '1-3 Year Treasury ETF', type: 'bond' },
  { symbol: 'LQD', name: 'Investment Grade Corp', type: 'bond' },
  { symbol: 'HYG', name: 'High Yield Corp', type: 'bond' },
  { symbol: 'EMB', name: 'Emerging Markets Bonds', type: 'bond' },
];

// ==========================================
// INDICES (20 symboles)
// ==========================================

const INDICES: Asset[] = [
  // US (8)
  { symbol: '^GSPC', name: 'S&P 500', type: 'index', category: 'US' },
  { symbol: '^DJI', name: 'Dow Jones', type: 'index', category: 'US' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', type: 'index', category: 'US' },
  { symbol: '^RUT', name: 'Russell 2000', type: 'index', category: 'US' },
  { symbol: '^VIX', name: 'Volatility Index', type: 'index', category: 'US' },
  { symbol: '^FTSE', name: 'FTSE 100', type: 'index', category: 'Europe' },
  { symbol: '^N225', name: 'Nikkei 225', type: 'index', category: 'Asia' },
  { symbol: '^HSI', name: 'Hang Seng', type: 'index', category: 'Asia' },

  // Europe (7)
  { symbol: '^FCHI', name: 'CAC 40', type: 'index', category: 'Europe' },
  { symbol: '^GDAXI', name: 'DAX', type: 'index', category: 'Europe' },
  { symbol: '^STOXX50E', name: 'EURO STOXX 50', type: 'index', category: 'Europe' },
  { symbol: '^AEX', name: 'AEX', type: 'index', category: 'Europe' },
  { symbol: '^IBEX', name: 'IBEX 35', type: 'index', category: 'Europe' },
  { symbol: '^FTMIB', name: 'FTSE MIB', type: 'index', category: 'Europe' },
  { symbol: '^SSMI', name: 'SMI', type: 'index', category: 'Europe' },

  // Autres (5)
  { symbol: '^AXJO', name: 'ASX 200', type: 'index', category: 'Australia' },
  { symbol: '^BVSP', name: 'Bovespa', type: 'index', category: 'Brazil' },
  { symbol: '^GSPTSE', name: 'TSX', type: 'index', category: 'Canada' },
  { symbol: '000001.SS', name: 'SSE Composite', type: 'index', category: 'China' },
  { symbol: '^JKSE', name: 'Jakarta Composite', type: 'index', category: 'Indonesia' },
];

// ==========================================
// EXPORTS
// ==========================================

/**
 * Liste complète des 240+ actifs disponibles
 * - 90+ actions US
 * - 50 actions françaises
 * - 50 actions européennes
 * - 30 indices
 * - 10 obligations
 * Note: Cryptos et commodities seront ajoutés ultérieurement
 */
export const ALL_ASSETS: Asset[] = [...STOCKS, ...BONDS, ...INDICES];

/**
 * Map symbole → Asset pour lookup rapide
 */
export const ASSETS_MAP = new Map<string, Asset>(
  ALL_ASSETS.map((asset) => [asset.symbol, asset])
);

/**
 * Tous les symboles (pour batch fetch)
 */
export const ALL_SYMBOLS = ALL_ASSETS.map((asset) => asset.symbol);

/**
 * Assets par type
 */
export const ASSETS_BY_TYPE = {
  stock: STOCKS,
  bond: BONDS,
  index: INDICES,
};

/**
 * Vérifier si un symbole est valide
 */
export function isValidSymbol(symbol: string): boolean {
  return ASSETS_MAP.has(symbol);
}

/**
 * Obtenir un asset par symbole
 */
export function getAsset(symbol: string): Asset | undefined {
  return ASSETS_MAP.get(symbol);
}

/**
 * Filtrer assets par type
 */
export function getAssetsByType(type: AssetType): Asset[] {
  return ASSETS_BY_TYPE[type] || [];
}

/**
 * Rechercher assets par nom ou symbole
 */
export function searchAssets(query: string): Asset[] {
  const lowerQuery = query.toLowerCase();
  return ALL_ASSETS.filter(
    (asset) =>
      asset.symbol.toLowerCase().includes(lowerQuery) ||
      asset.name.toLowerCase().includes(lowerQuery)
  );
}