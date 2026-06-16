import fs from "fs";
import path from "path";
import axios from "axios";

const SCRIP_MASTER_URL =
  "https://margincalculator.angelbroking.com/OpenAPI_File/files/OpenAPIScripMaster.json";

const CACHE_DIR = path.join(process.cwd(), "cache");
const CACHE_FILE = path.join(CACHE_DIR, "instruments.json");
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const ALLOWED_EXCHANGES = ["NSE", "BSE", "NFO", "BFO", "MCX", "CDS"];

let instrumentCache = [];
let lastLoaded = 0;

export const loadInstruments = async (force = false) => {
  const now = Date.now();

  if (!force && instrumentCache.length > 0 && now - lastLoaded < CACHE_TTL) {
    return instrumentCache;
  }

  // 1. Try local cache file first
  if (!force && fs.existsSync(CACHE_FILE)) {
    const stat = fs.statSync(CACHE_FILE);
    if (now - stat.mtimeMs < CACHE_TTL) {
      instrumentCache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf-8"));
      lastLoaded = now;
      console.log(`✅ Instruments loaded from cache (${instrumentCache.length})`);
      return instrumentCache;
    }
  }

  // 2. Download fresh copy
  console.log("⏳ Downloading Angel One Script Master...");
  const { data } = await axios.get(SCRIP_MASTER_URL, {
    timeout: 120000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
  });

  const filtered = data
    .filter((inst) => ALLOWED_EXCHANGES.includes(inst.exch_seg))
    .map((inst) => ({
      token: inst.token,
      symbol: inst.symbol,
      name: inst.name,
      expiry: inst.expiry,
      strike: inst.strike,
      lotsize: inst.lotsize,
      instrumenttype: inst.instrumenttype,
      exch_seg: inst.exch_seg,
      tick_size: inst.tick_size,
    }));

  instrumentCache = filtered;
  lastLoaded = now;

  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(filtered));

  console.log(`✅ Script Master loaded & cached (${filtered.length} instruments)`);
  return instrumentCache;
};

export const searchInstruments = (query, { exchange, limit } = {}) => {
  const q = query ? query.trim().toUpperCase() : "";

  let results = instrumentCache.filter((inst) => {
    const matchesQuery = q
      ? inst.symbol.toUpperCase().includes(q) || inst.name.toUpperCase().includes(q)
      : true;
    const matchesExchange = exchange
      ? inst.exch_seg === exchange.toUpperCase()
      : true;
    return matchesQuery && matchesExchange;
  });

  if (q) {
    results.sort((a, b) => {
      const aStarts = a.symbol.toUpperCase().startsWith(q) ? 0 : 1;
      const bStarts = b.symbol.toUpperCase().startsWith(q) ? 0 : 1;
      return aStarts - bStarts;
    });
  }

  // limit explicitly diya gaya ho tabhi slice karo, warna full return
  return typeof limit === "number" ? results.slice(0, limit) : results;
};

export const getInstrumentCount = () => instrumentCache.length;