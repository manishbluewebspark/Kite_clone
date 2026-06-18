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

export default function BottomTabs({
  tabs,
  activeTabId,
  onSwitch,
  onLayersClick,
}: BottomTabsProps) {
  return (
    <div
      className="flex items-center border-t shrink-0 px-2"
      style={{ borderColor: "var(--border-overlay-12)" }}
    >
      {tabs.map((tab) => (
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