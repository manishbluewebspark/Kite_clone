// src/data/trading-guide.ts

export interface CardData {
  iconPath: string;
  title: string;
  shortcut: string;
  borderClass: string;
  desc: string;
  example: string;
  risk: string;
}

export const tradingGuideData: CardData[] = [
  {
    iconPath: "buy-long",
    title: "Buy Long",
    shortcut: "Shift+ArrowUp",
    borderClass: "border-l-green-500",
    desc: "Open a long position when you expect the price to increase",
    example: "If BTC is $50,000 and you buy, you profit when it rises to $52,000",
    risk: "Loss if price decreases",
  },
  {
    iconPath: "sell-close",
    title: "Sell/Close Long",
    shortcut: "Shift+ArrowLeft",
    borderClass: "border-l-red-500",
    desc: "Close your long position to realize your profit or loss",
    example: "Exit your $50,000 BTC buy at $52,000 for a $2,000 profit",
    risk: "Missing further gains if price continues up",
  },
  {
    iconPath: "short-sell",
    title: "Short Sell",
    shortcut: "Shift+ArrowDown",
    borderClass: "border-l-orange-500",
    desc: "Open a short position when you expect the price to decrease",
    example: "If BTC is $50,000 and you short, you profit when it falls to $48,000",
    risk: "Loss if price increases (unlimited potential loss)",
  },
  {
    iconPath: "cover-close",
    title: "Cover/Close Short",
    shortcut: "Shift+ArrowRight",
    borderClass: "border-l-sky-400",
    desc: "Close your short position to realize your profit or loss",
    example: "Exit your $50,000 BTC short at $48,000 for a $2,000 profit",
    risk: "Missing further gains if price continues down",
  },
];