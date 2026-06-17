import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import BottomTabs from "../modal/BottomTabs";

interface WatchlistTab {
  id: number;
  name: string;
  groups: any[];
}

interface ListsPanelProps {
  isOpen: boolean;
  tabs: WatchlistTab[];
  activeTabId: number;
  onSelectTab: (id: number) => void;
  onClose: () => void;
  onCreateList: (name: string) => void;
}

export default function ListsPanel({
  isOpen,
  tabs,
  activeTabId,
  onSelectTab,
  onClose,
  onCreateList,
}: ListsPanelProps) {
  const [listsTab, setListsTab] = useState<"my" | "discover">("my");
  const [listsSearchQuery, setListsSearchQuery] = useState("");
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [newListName, setNewListName] = useState("");

  if (!isOpen) return null;

  const filtered = tabs.filter((t) =>
    t.name.toLowerCase().includes(listsSearchQuery.toLowerCase())
  );

  const handleCreateList = () => {
    if (!newListName.trim()) return;
    onCreateList(newListName.trim());
    setNewListName("");
    setShowNewListForm(false);
  };

  return (
    <div
      className="absolute inset-0 flex flex-col z-50"
      style={{ backgroundColor: "var(--color-primary)" }}
    >
      <div
        className="flex items-center gap-2 px-3 py-2 border-b shrink-0"
        style={{ borderColor: "var(--border-overlay-12)" }}
      >
        <FiSearch style={{ color: "var(--text-on-dark-45)", fontSize: "14px", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search lists"
          value={listsSearchQuery}
          onChange={(e) => setListsSearchQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm"
          style={{ color: "var(--text-on-dark)" }}
          autoFocus
        />
        <span
          className="text-[10px] px-1.5 py-0.5 rounded border shrink-0"
          style={{ color: "var(--text-on-dark-45)", borderColor: "var(--border-overlay-20)" }}
        >
          Ctrl + Shift + K
        </span>
      </div>

      <div
        className="flex items-center border-b px-3 shrink-0"
        style={{ borderColor: "var(--border-overlay-12)" }}
      >
        {(["my", "discover"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setListsTab(t)}
            className="text-sm py-2 mr-5 border-b-2 capitalize"
            style={{
              color: listsTab === t ? "#e64c00" : "var(--text-on-dark-55)",
              borderBottomColor: listsTab === t ? "#e64c00" : "transparent",
              fontWeight: listsTab === t ? 600 : 400,
              backgroundColor: "transparent",
            }}
          >
            {t === "my" ? "My lists" : "Discover"}
          </button>
        ))}
        <button
          className="ml-auto text-sm"
          style={{ color: "#387ed1" }}
          onClick={() => setShowNewListForm(true)}
        >
          + New list
        </button>
      </div>

      {showNewListForm && (
        <div
          className="mx-3 mt-3 rounded border p-3 shrink-0"
          style={{
            borderColor: "var(--border-overlay-20)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
          }}
        >
          <div className="relative border rounded mb-3" style={{ borderColor: "var(--border-overlay-20)" }}>
            <span
              className="absolute -top-2.5 left-2.5 text-[10px] px-1 rounded"
              style={{
                color: "var(--text-on-dark-45)",
                backgroundColor: "var(--color-primary)",
                border: "1px solid var(--border-overlay-20)",
              }}
            >
              Name
            </span>
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              autoFocus
              className="w-full bg-transparent outline-none px-3 py-2 text-sm"
              style={{ color: "var(--text-on-dark)" }}
              onKeyDown={(e) => e.key === "Enter" && handleCreateList()}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCreateList}
              disabled={!newListName.trim()}
              className="text-xs px-4 py-1.5 rounded text-white font-semibold disabled:opacity-50"
              style={{ backgroundColor: "#387ed1" }}
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowNewListForm(false);
                setNewListName("");
              }}
              className="text-xs px-4 py-1.5 rounded border font-semibold"
              style={{
                color: "var(--text-on-dark-80)",
                borderColor: "var(--border-overlay-20)",
                backgroundColor: "transparent",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        <div
          className="px-3 py-2 text-[10px] font-bold tracking-widest"
          style={{ color: "var(--text-on-dark-35)" }}
        >
          FAVORITES
        </div>

        {filtered.map((tab, i) => (
          <button
            key={tab.id}
            onClick={() => {
              onSelectTab(tab.id);
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 border-b text-left"
            style={{
              borderColor: "var(--border-overlay-08)",
              backgroundColor: "transparent",
            }}
          >
            <span
              className="text-sm w-5 text-center"
              style={{
                color: tab.id === activeTabId ? "#e64c00" : "var(--text-on-dark-45)",
              }}
            >
              {i + 1}
            </span>
            <span
              className="text-sm"
              style={{
                color: tab.id === activeTabId ? "#e64c00" : "var(--text-on-dark-80)",
                fontWeight: tab.id === activeTabId ? 600 : 400,
              }}
            >
              {tab.name}
            </span>
          </button>
        ))}
      </div>

      <BottomTabs
        tabs={tabs}
        activeTabId={activeTabId}
        onSwitch={(id) => {
          onSelectTab(id);
          onClose();
        }}
        onLayersClick={onClose}
      />
    </div>
  );
}