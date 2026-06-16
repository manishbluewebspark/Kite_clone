export interface CryptoData {
  symbol: string;
  "1h": number;
  "1d": number;
  "1w": number;
  "1m": number;
}

export const marketData: CryptoData[] = [
  { symbol: "ADA_USDT",  "1h": -0.89, "1d": -6.69, "1w":  3.11, "1m": -2.68 },
  { symbol: "BNB_USDT",  "1h": -0.45, "1d": -4.12, "1w": -0.06, "1m":  5.68 },
  { symbol: "BTC_USDT",  "1h": -0.61, "1d": -4.86, "1w":  0.52, "1m":  4.41 },
  { symbol: "DOGE_USDT", "1h": -0.15, "1d": -4.90, "1w":  1.66, "1m": -3.99 },
  { symbol: "ETH_USDT",  "1h": -0.44, "1d": -6.32, "1w":  6.31, "1m":  9.47 },
  { symbol: "HYPE_USDT", "1h": -2.60, "1d": -3.78, "1w":  8.86, "1m": 37.27 },
  { symbol: "LINK_USDT", "1h": -0.50, "1d": -7.09, "1w":  1.82, "1m":  4.73 },
  { symbol: "PAXG_USDT", "1h": -0.16, "1d": -4.96, "1w": -8.58, "1m": -5.58 },
  { symbol: "SOL_USDT",  "1h": -0.31, "1d": -4.67, "1w":  4.36, "1m":  8.71 },
  { symbol: "SUI_USDT",  "1h": -0.84, "1d": -6.07, "1w": -1.66, "1m":  3.24 },
  { symbol: "TRX_USDT",  "1h": -0.34, "1d":  0.03, "1w":  4.45, "1m":  8.04 },
  { symbol: "XRP_USDT",  "1h": -0.45, "1d": -3.68, "1w":  6.17, "1m":  2.00 },
];