// Mapping from generic/TwelveData symbols to Yahoo Finance suffixes
// US stocks generally don't need a mapping (e.g. AAPL is AAPL on both).
// This map covers major international and KZ stocks.

export const yahooSymbolMap = {
  // KZ Stocks (London Stock Exchange or KASE equivalents)
  "KSPI": "KSPI",    // Kaspi.kz (Now on NASDAQ!)
  "HSBK": "HSBK.IL", // Halyk Bank
  "KAP": "KAP.IL",   // Kazatomprom
  "KMG": "KMG.IL",   // KazMunayGas
  "KEGC": "KEGC.KZ", // KEGOC
  "KZTK": "KZTK.KZ", // Kazakhtelecom
  "CCBN": "CCBN.KZ", // Bank CenterCredit
  "KCELL": "KCEL.KZ",// Kcell
  
  // Popular Global (Non-US)
  "TTE": "TTE.PA",   // TotalEnergies (Paris)
  "LVMH": "MC.PA",   // LVMH (Paris)
  "ASML": "ASML.AS", // ASML (Amsterdam)
  "SAP": "SAP.DE",   // SAP (Germany)
  "SIE": "SIE.DE",   // Siemens
  "TM": "7203.T",    // Toyota (Tokyo)
  "SONY": "6758.T",  // Sony (Tokyo)
  "TCEHY": "0700.HK",// Tencent (Hong Kong)
  "BABA": "9988.HK", // Alibaba (Hong Kong)
  "TSM": "2330.TW",  // TSMC (Taiwan)
  "NVO": "NOVO-B.CO",// Novo Nordisk (Copenhagen)
  "AZN": "AZN.L",    // AstraZeneca (London)
  "SHEL": "SHEL.L",  // Shell (London)
  "HSBA": "HSBA.L",  // HSBC (London)
  "RY": "RY.TO",     // Royal Bank of Canada (Toronto)
  "SHOP": "SHOP.TO", // Shopify (Toronto)
  "BHP": "BHP.AX",   // BHP (Australia)
  "CBA": "CBA.AX",   // CommBank (Australia)
  
  // Crypto (Yahoo uses -USD for most pairs)
  "BTC/USD": "BTC-USD",
  "ETH/USD": "ETH-USD",
  "BNB/USD": "BNB-USD",
  "SOL/USD": "SOL-USD",
  "XRP/USD": "XRP-USD",
  "ADA/USD": "ADA-USD"
};

export function getYahooSymbol(symbol) {
  const upper = symbol.toUpperCase();
  return yahooSymbolMap[upper] || upper; // Fallback to the original symbol if not in map
}
