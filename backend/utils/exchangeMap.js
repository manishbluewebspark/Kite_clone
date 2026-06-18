// utils/exchangeMap.js (naya helper file)
export const EXCHANGE_TYPE_MAP = {
  NSE: 1,
  NFO: 2,
  BSE: 3,
  BFO: 4,
  MCX: 5,
  NCDEX: 7,
  CDS: 13,
};

export const getExchangeType = (exchange) => {
  const type = EXCHANGE_TYPE_MAP[exchange?.toUpperCase()];
  if (!type) throw new Error(`Unknown exchange: ${exchange}`);
  return type;
};