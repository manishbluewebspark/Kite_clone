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

// export const searchInstruments = (query, { exchange, limit } = {}) => {
//   const q = query ? query.trim().toUpperCase() : "";

//   if (!q) {
//     return typeof limit === "number"
//       ? instrumentCache.slice(0, limit)
//       : instrumentCache;
//   }

//   // ── Angel One symbol format: NAME + DDMMMYY + STRIKE + CE/PE ─────────────
//   // e.g. NIFTY30JUN2623400CE
//   //      SENSEX26JUN2677400CE
//   //      BANKNIFTY07JUL2652000PE

//   const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
//   const OPTION_TYPES = ["CE", "PE"];

//   // ── Query parse karo ───────────────────────────────────────────────────────
//   let remaining = q;

//   // Option type (CE/PE) — end me
//   let optionType = null;
//   for (const ot of OPTION_TYPES) {
//     if (remaining.endsWith(ot)) {
//       optionType = ot;
//       remaining = remaining.slice(0, -2);
//       break;
//     }
//   }

//   // Month extract karo (JAN-DEC)
//   let monthStr = null;
//   let dayStr = null;
//   let yearStr = null;
//   for (const m of MONTHS) {
//     const idx = remaining.indexOf(m);
//     if (idx !== -1) {
//       monthStr = m;
//       // Month se pehle digits = DD (day) aur/ya YY (year) ka part
//       const before = remaining.slice(0, idx);
//       const after = remaining.slice(idx + 3);
//       // before me last 2 digits = day
//       const dayMatch = before.match(/(\d{2})$/);
//       if (dayMatch) {
//         dayStr = dayMatch[1];
//         remaining = before.slice(0, -2) + after;
//       } else {
//         remaining = before + after;
//       }
//       // after me year digits ho sakte hain
//       const yearMatch = after.match(/^(\d{2})/);
//       if (yearMatch) {
//         yearStr = yearMatch[1];
//         remaining = remaining.replace(yearMatch[0], "");
//       }
//       remaining = remaining.replace(monthStr, "");
//       break;
//     }
//   }

//   // Strike — remaining me numbers
//   const strikeMatch = remaining.match(/\d+/g);
//   const strikeInput = strikeMatch ? strikeMatch.join("") : null;

//   // Underlying — remaining me letters
//   const nameMatch = remaining.match(/[A-Z-&]+/g);
//   const underlyingInput = nameMatch ? nameMatch.join("") : null;

//   // Strike ko Angel One format me convert karo (×100)
//   // User "23400" type kare → Angel One "2340000"
//   const strikeInPaise = strikeInput ? String(parseFloat(strikeInput) * 100) : null;

//   // ── Filter ────────────────────────────────────────────────────────────────
//   let results = instrumentCache.filter((inst) => {
//     const matchesExchange = exchange
//       ? inst.exch_seg === exchange.toUpperCase()
//       : true;
//     if (!matchesExchange) return false;

//     const sym = inst.symbol.toUpperCase();
//     const name = (inst.name || "").toUpperCase();
//     const instStrike = inst.strike ? String(parseFloat(inst.strike)) : "";

//     // Direct match — agar koi part match kare directly
//     if (sym.includes(q)) return true;

//     // Parts-based match
//     // Underlying match (required agar diya gaya)
//     if (underlyingInput) {
//       const nameOk = sym.startsWith(underlyingInput) || name === underlyingInput;
//       if (!nameOk) return false;
//     }

//     // Strike match (required agar diya gaya)
//     if (strikeInPaise) {
//       // Angel One strike "2340000.000000" → parseFloat = 2340000
//       const instStrikeNum = parseFloat(inst.strike || "0");
//       const inputStrikeNum = parseFloat(strikeInPaise);
//       if (Math.abs(instStrikeNum - inputStrikeNum) > 0.1) return false;
//     }

//     // Option type match (required agar diya gaya)
//     if (optionType) {
//       if (!sym.endsWith(optionType)) return false;
//     }

//     // Month match (optional — filter karo agar diya gaya)
//     if (monthStr) {
//       if (!sym.includes(monthStr)) return false;
//     }

//     // Day match (optional)
//     if (dayStr) {
//       // Symbol me DDMMMYY format hai — dayStr check karo
//       if (!sym.includes(dayStr + (monthStr || ""))) return false;
//     }

//     // Agar kuch bhi extract nahi hua to direct match hi use karo
//     if (!underlyingInput && !strikeInPaise && !optionType && !monthStr) {
//       return sym.includes(q) || name.includes(q);
//     }

//     return true;
//   });

//   // ── Sorting — nearest expiry pehle, phir strike closeness ─────────────────
//   results.sort((a, b) => {
//     // Expiry sort (aaj se nearest pehle)
//     const expA = a.expiry || "";
//     const expB = b.expiry || "";
//     if (expA !== expB) return expA.localeCompare(expB);

//     // CE pehle PE baad (optional — CE more common)
//     const typeA = a.symbol.endsWith("CE") ? 0 : 1;
//     const typeB = b.symbol.endsWith("CE") ? 0 : 1;
//     if (typeA !== typeB) return typeA - typeB;

//     return a.symbol.localeCompare(b.symbol);
//   });

//   return typeof limit === "number" ? results.slice(0, limit) : results;
// };

// ── Expiry helpers ────────────────────────────────────────────────────────
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const OPTION_TYPES = ["CE", "PE"];

// Angel One expiry format: "30JUN2026" (DDMMMYYYY) — parse karo Date object me
function parseExpiryDate(expiryStr) {
  if (!expiryStr || expiryStr.length < 9) return null;
  const day = parseInt(expiryStr.slice(0, 2), 10);
  const monStr = expiryStr.slice(2, 5).toUpperCase();
  const year = parseInt(expiryStr.slice(5, 9), 10);
  const monthIdx = MONTHS.indexOf(monStr);
  if (monthIdx === -1 || isNaN(day) || isNaN(year)) return null;
  return new Date(year, monthIdx, day);
}

// Days window — default 15 (current date se next 15 din, inclusive)
function isWithinExpiryWindow(expiryStr, days = 15) {
  const expiryDate = parseExpiryDate(expiryStr);
  if (!expiryDate) return false; // expiry parse na ho paaye to safe-side exclude karo

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const windowEnd = new Date(today);
  windowEnd.setDate(windowEnd.getDate() + days);
  windowEnd.setHours(23, 59, 59, 999);

  // expiryDate >= today (purane/expired hide) AND expiryDate <= windowEnd (next 15 din)
  return expiryDate >= today && expiryDate <= windowEnd;
}

export const searchInstruments = (query, { exchange, limit, expiryWindowDays = 15 } = {}) => {
  const q = query ? query.trim().toUpperCase() : "";

  // ── Base list — hamesha expiry window apply karo (F&O instruments ke liye) ──
  // Equity/cash segment instruments (jinka expiry field empty hai) ko exclude nahi karna
  const filterByExpiryWindow = (list) =>
    list.filter((inst) => {
      // Agar instrument ka expiry hi nahi hai (e.g. equity/cash) → hamesha include karo
      if (!inst.expiry) return true;
      // F&O instrument hai → window check karo
      return isWithinExpiryWindow(inst.expiry, expiryWindowDays);
    });

  if (!q) {
    const windowed = filterByExpiryWindow(instrumentCache);
    return typeof limit === "number" ? windowed.slice(0, limit) : windowed;
  }

  // ── Angel One symbol format: NAME + DDMMMYY + STRIKE + CE/PE ─────────────
  // e.g. NIFTY30JUN2623400CE
  //      SENSEX26JUN2677400CE
  //      BANKNIFTY07JUL2652000PE

  // ── Query parse karo ───────────────────────────────────────────────────────
  let remaining = q;

  // Option type (CE/PE) — end me
  let optionType = null;
  for (const ot of OPTION_TYPES) {
    if (remaining.endsWith(ot)) {
      optionType = ot;
      remaining = remaining.slice(0, -2);
      break;
    }
  }

  // Month extract karo (JAN-DEC)
  let monthStr = null;
  let dayStr = null;
  let yearStr = null;
  for (const m of MONTHS) {
    const idx = remaining.indexOf(m);
    if (idx !== -1) {
      monthStr = m;
      // Month se pehle digits = DD (day) aur/ya YY (year) ka part
      const before = remaining.slice(0, idx);
      const after = remaining.slice(idx + 3);
      // before me last 2 digits = day
      const dayMatch = before.match(/(\d{2})$/);
      if (dayMatch) {
        dayStr = dayMatch[1];
        remaining = before.slice(0, -2) + after;
      } else {
        remaining = before + after;
      }
      // after me year digits ho sakte hain
      const yearMatch = after.match(/^(\d{2})/);
      if (yearMatch) {
        yearStr = yearMatch[1];
        remaining = remaining.replace(yearMatch[0], "");
      }
      remaining = remaining.replace(monthStr, "");
      break;
    }
  }

  // Strike — remaining me numbers
  const strikeMatch = remaining.match(/\d+/g);
  const strikeInput = strikeMatch ? strikeMatch.join("") : null;

  // Underlying — remaining me letters
  const nameMatch = remaining.match(/[A-Z-&]+/g);
  const underlyingInput = nameMatch ? nameMatch.join("") : null;

  // Strike ko Angel One format me convert karo (×100)
  // User "23400" type kare → Angel One "2340000"
  const strikeInPaise = strikeInput ? String(parseFloat(strikeInput) * 100) : null;

  // ── Filter ────────────────────────────────────────────────────────────────
  let results = instrumentCache.filter((inst) => {
    const matchesExchange = exchange
      ? inst.exch_seg === exchange.toUpperCase()
      : true;
    if (!matchesExchange) return false;

    // ── Expiry window check (purane/expired exclude, sirf next N din) ───────
    // Equity/cash instruments (no expiry) hamesha allow; F&O instruments window ke andar hone chahiye
    if (inst.expiry && !isWithinExpiryWindow(inst.expiry, expiryWindowDays)) {
      return false;
    }

    const sym = inst.symbol.toUpperCase();
    const name = (inst.name || "").toUpperCase();
    const instStrike = inst.strike ? String(parseFloat(inst.strike)) : "";

    // Direct match — agar koi part match kare directly
    if (sym.includes(q)) return true;

    // Parts-based match
    // Underlying match (required agar diya gaya)
    if (underlyingInput) {
      const nameOk = sym.startsWith(underlyingInput) || name === underlyingInput;
      if (!nameOk) return false;
    }

    // Strike match (required agar diya gaya)
    if (strikeInPaise) {
      // Angel One strike "2340000.000000" → parseFloat = 2340000
      const instStrikeNum = parseFloat(inst.strike || "0");
      const inputStrikeNum = parseFloat(strikeInPaise);
      if (Math.abs(instStrikeNum - inputStrikeNum) > 0.1) return false;
    }

    // Option type match (required agar diya gaya)
    if (optionType) {
      if (!sym.endsWith(optionType)) return false;
    }

    // Month match (optional — filter karo agar diya gaya)
    if (monthStr) {
      if (!sym.includes(monthStr)) return false;
    }

    // Day match (optional)
    if (dayStr) {
      // Symbol me DDMMMYY format hai — dayStr check karo
      if (!sym.includes(dayStr + (monthStr || ""))) return false;
    }

    // Agar kuch bhi extract nahi hua to direct match hi use karo
    if (!underlyingInput && !strikeInPaise && !optionType && !monthStr) {
      return sym.includes(q) || name.includes(q);
    }

    return true;
  });

  // ── Sorting — nearest expiry pehle, phir strike closeness ─────────────────
  results.sort((a, b) => {
    // Expiry sort (aaj se nearest pehle)
    const expA = a.expiry || "";
    const expB = b.expiry || "";
    if (expA !== expB) return expA.localeCompare(expB);

    // CE pehle PE baad (optional — CE more common)
    const typeA = a.symbol.endsWith("CE") ? 0 : 1;
    const typeB = b.symbol.endsWith("CE") ? 0 : 1;
    if (typeA !== typeB) return typeA - typeB;

    return a.symbol.localeCompare(b.symbol);
  });

  return typeof limit === "number" ? results.slice(0, limit) : results;
};

export const getInstrumentCount = () => instrumentCache.length;