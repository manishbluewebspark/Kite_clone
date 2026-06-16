import React, { useEffect, useRef, useCallback } from "react";
import { tradingGuideData, type CardData } from "../../data/trading-guide";
import { MdOutlineCircle, MdOutlineArrowUpward, MdOutlineArrowDownward } from "react-icons/md";
import { BiTrendingUp, BiTrendingDown } from "react-icons/bi";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TradingGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// ─── Icon Renderer ────────────────────────────────────────────────────────────

const renderIcon = (iconPath: string): React.ReactNode => {
  switch (iconPath) {
    case "buy-long":
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <MdOutlineCircle className="w-6 h-6 text-green-500" strokeWidth="1.5" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MdOutlineArrowUpward className="w-3 h-3 text-green-500 font-bold" />
          </div>
        </div>
      );
    case "sell-close":
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <MdOutlineCircle className="w-6 h-6 text-red-500" strokeWidth="1.5" />
          <div className="absolute inset-0 flex items-center justify-center">
            <MdOutlineArrowDownward className="w-3 h-3 text-red-500 font-bold" />
          </div>
        </div>
      );
    case "short-sell":
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <BiTrendingDown className="w-6 h-6 text-orange-500" />
          <div className="absolute -bottom-1 -right-1">
            <MdOutlineArrowDownward className="w-2 h-2 text-orange-500" />
          </div>
        </div>
      );
    case "cover-close":
      return (
        <div className="relative w-6 h-6 flex items-center justify-center">
          <BiTrendingUp className="w-6 h-6 text-blue-500" />
          <div className="absolute -bottom-1 -right-1">
            <MdOutlineArrowUpward className="w-2 h-2 text-blue-500" />
          </div>
        </div>
      );
    default:
      return null;
  }
};

// ─── TradingCard (internal) ───────────────────────────────────────────────────

interface TradingCardProps extends CardData {}

const TradingCard: React.FC<TradingCardProps> = ({
  iconPath,
  title,
  borderClass,
  desc,
  example,
  risk,
}) => (
  <div className={`bg-primary border border-gray-700 border-l-4 ${borderClass} rounded-xl p-5 flex flex-col gap-2`}>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {renderIcon(iconPath)}
        <span className="font-bold text-base tracking-tight font-mono">
          {title}
        </span>
      </div>
    </div>
    <p className="text-slate-secondary text-sm leading-relaxed">{desc}</p>
    <p className="text-slate-primary text-sm">
      <span className="font-bold text-slate-secondary">Example: </span>{example}
    </p>
    <p className="text-slate-primary text-sm">
      <span className="font-bold text-danger">Risk: </span>{risk}
    </p>
  </div>
);

// ─── TradingGuideModal ────────────────────────────────────────────────────────

const TradingGuideModal: React.FC<TradingGuideModalProps> = ({ isOpen, onClose }) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === overlayRef.current) onClose();
    },
    [onClose]
  );

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === "Escape" && isOpen) onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 backdrop-blur-xs bg-opacity-70 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-primary-light border border-secondary rounded-2xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-6 pb-4 border-b border-secondary">
          <div>
            <h1 className="text-xl font-bold font-mono tracking-tight">
              Trading Actions Guide
            </h1>
            <p className="text-body text-sm mt-1">
              Learn about each trading action and when to use them
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="btn-global"
          >
            ✕
          </button>
        </div>

        {/* Cards */}
        <div className="p-5 flex flex-col gap-3">
          {tradingGuideData.map((card: CardData) => (
            <TradingCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TradingGuideModal;