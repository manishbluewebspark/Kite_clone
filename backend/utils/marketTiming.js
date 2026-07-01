// utils/marketTiming.js
// IST time helpers — market hours check ke liye

export const getISTTime = () => {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

export const isMarketOpen = () => {
  const ist = getISTTime();
  const day = ist.getDay(); // 0 = Sunday, 6 = Saturday
  if (day === 0 || day === 6) return false;

  const currentMinutes = ist.getHours() * 60 + ist.getMinutes();
  const marketOpen = 9 * 60 + 15;   // 9:15 AM
  const marketClose = 15 * 60 + 30; // 3:30 PM

  return currentMinutes >= marketOpen && currentMinutes <= marketClose;
};

export const isPastMarketClose = () => {
  const ist = getISTTime();
  const day = ist.getDay();
  if (day === 0 || day === 6) return true; // weekend = market band hi hai

  const currentMinutes = ist.getHours() * 60 + ist.getMinutes();
  return currentMinutes > (15 * 60 + 30);
};

// Aaj ka start/end (IST) — DB query ke liye UTC me convert
export const getTodayRangeUTC = () => {
  const ist = getISTTime();
  const startIST = new Date(ist);
  startIST.setHours(0, 0, 0, 0);
  const endIST = new Date(ist);
  endIST.setHours(23, 59, 59, 999);

  // IST se UTC me wapas convert karo (offset -5:30)
  const start = new Date(startIST.getTime() - 5.5 * 60 * 60000);
  const end = new Date(endIST.getTime() - 5.5 * 60 * 60000);
  return { start, end };
};