import { useState } from "react";

const GROUP_COLORS = [
  "#888888",
  "#6c8ebf",
  "#7b61ff",
  "#4caf7d",
  "#62b36e",
  "#e6a817",
  "#9e9e9e",
  "#e04040",
];

interface NewGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
}

export default function NewGroupModal({ isOpen, onClose, onCreate }: NewGroupModalProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupColor, setNewGroupColor] = useState(GROUP_COLORS[0]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!newGroupName.trim()) return;
    onCreate(newGroupName.trim(), newGroupColor);
    setNewGroupName("");
    setNewGroupColor(GROUP_COLORS[0]);
    onClose();
  };

  return (
    <div
      className="mx-3 mb-30 rounded border p-3"
      style={{
        borderColor: "var(--border-overlay-20)",
        backgroundColor: "var(--color-primary)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.12)",
        flexShrink: 0,
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
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          autoFocus
          className="w-full bg-transparent outline-none px-3 py-2 text-sm"
          style={{ color: "var(--text-on-dark)" }}
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />
      </div>

      <div className="flex items-center gap-2 mb-3">
        {GROUP_COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setNewGroupColor(c)}
            className="rounded-full shrink-0"
            style={{
              width: "16px",
              height: "16px",
              backgroundColor: c,
              border: newGroupColor === c ? "2px solid var(--text-on-dark-80)" : "2px solid transparent",
            }}
          />
        ))}
      </div>

      <div className="flex justify-end gap-2">
        <button
          onClick={handleCreate}
          disabled={!newGroupName.trim()}
          className="text-xs px-4 py-1.5 rounded text-white font-semibold disabled:opacity-50"
          style={{ backgroundColor: "#387ed1" }}
        >
          Create
        </button>
        <button
          onClick={onClose}
          className="text-xs px-4 py-1.5 rounded border font-semibold"
          style={{
            color: "var(--text-on-dark-80)",
            borderColor: "var(--border-overlay-20)",
            backgroundColor: "transparent",
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}