import { useState } from "react";

interface WatchlistTab {
  id: number;
  name: string;
  groups: any[];
}

interface BottomTabsProps {
  tabs: WatchlistTab[];
  activeTabId: number;
  onSwitch: (id: number) => void;
  onLayersClick: () => void;
}

const VISIBLE_COUNT = 7; // kitne tabs ek baar dikhenge

export default function BottomTabs({
  tabs,
  activeTabId,
  onSwitch,
  onLayersClick,
}: BottomTabsProps) {
  const [startIndex, setStartIndex] = useState(0);

  const canGoPrev = startIndex > 0;
  const canGoNext = startIndex + VISIBLE_COUNT < tabs.length;
  const visibleTabs = tabs.slice(startIndex, startIndex + VISIBLE_COUNT);

  const handlePrev = () => {
    if (canGoPrev) setStartIndex((i) => i - 1);
  };

  const handleNext = () => {
    if (canGoNext) setStartIndex((i) => i + 1);
  };

  // Jab active tab visible range se bahar ho to auto-scroll
  const activeIndex = tabs.findIndex((t) => t.id === activeTabId);
  if (activeIndex < startIndex) {
    setStartIndex(activeIndex);
  } else if (activeIndex >= startIndex + VISIBLE_COUNT) {
    setStartIndex(activeIndex - VISIBLE_COUNT + 1);
  }

  return (
    <div
      className="flex items-center border-t shrink-0 px-2"
      style={{ borderColor: "var(--border-overlay-12)" }}
    >
      {/* Left Arrow — sirf tab dikhao jab tabs VISIBLE_COUNT se zyada hon */}
      {tabs.length > VISIBLE_COUNT && (
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className="flex items-center justify-center px-1 py-1.5"
          style={{
            color: canGoPrev ? "var(--text-on-dark-45)" : "var(--border-overlay-20)",
            cursor: canGoPrev ? "pointer" : "not-allowed",
            fontSize: "12px",
            background: "transparent",
            border: "none",
            lineHeight: 1,
          }}
          title="Previous tabs"
        >
          ‹
        </button>
      )}

      {/* Visible Tabs */}
      {visibleTabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onSwitch(tab.id)}
          className="text-xs px-2.5 py-1.5 border-t-2 transition-colors"
          style={{
            color: tab.id === activeTabId ? "#e64c00" : "var(--text-on-dark-45)",
            borderTopColor: tab.id === activeTabId ? "#e64c00" : "transparent",
            backgroundColor: "transparent",
            fontWeight: tab.id === activeTabId ? 600 : 400,
          }}
        >
          {tab.id}
        </button>
      ))}

      {/* Right Arrow */}
      {tabs.length > VISIBLE_COUNT && (
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className="flex items-center justify-center px-1 py-1.5"
          style={{
            color: canGoNext ? "var(--text-on-dark-45)" : "var(--border-overlay-20)",
            cursor: canGoNext ? "pointer" : "not-allowed",
            fontSize: "12px",
            background: "transparent",
            border: "none",
            lineHeight: 1,
          }}
          title="Next tabs"
        >
          ›
        </button>
      )}

      {/* Layers / All Lists Button */}
      <button
        onClick={onLayersClick}
        className="ml-auto flex items-center gap-0.5 px-2 py-1.5"
        style={{ color: "var(--text-on-dark-45)" }}
        title="All lists"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2" y="2.5" width="12" height="2.5" rx="0.5" />
          <rect x="2" y="6.5" width="12" height="2.5" rx="0.5" />
          <rect x="2" y="10.5" width="12" height="2.5" rx="0.5" />
        </svg>
        <span style={{ fontSize: "13px" }}>+</span>
      </button>
    </div>
  );
}