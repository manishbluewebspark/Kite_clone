import React from "react";

interface EmptyGroupProps {
  name: string;
}

export default function EmptyGroup({ name }: EmptyGroupProps) {
  return (
    <>
      <div
        className="px-3 py-1.5 text-[13px] font-semibold border-b"
        style={{
          color: "var(--text-on-dark-80)",
          borderColor: "var(--border-overlay-12)",
          backgroundColor: "var(--bg-overlay-08)",
        }}
      >
        {name}
      </div>
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b"
        style={{ borderColor: "var(--border-overlay-08)" }}
      >
        <span className="text-xs" style={{ color: "var(--text-on-dark-45)" }}>
          No items.
        </span>
        <button className="text-xs" style={{ color: "#387ed1" }}>
          + Add item
        </button>
      </div>
    </>
  );
}