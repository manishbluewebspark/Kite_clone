import toast from "react-hot-toast";
import type { DisplayRow } from "../pages/Positions";

// Inject style once
const styleId = "trade-toast-style";
if (!document.getElementById(styleId)) {
  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `
    .trade-toast { border-left: 10px solid var(--toast-border) !important; width: 380px !important; }
    .trade-toast-success { --toast-border: #4CAF50; }
    .trade-toast-error { --toast-border: #f44336; }
  `;
  document.head.appendChild(style);
}

export function showTradeToast(pos: DisplayRow, type: "success" | "error", overrideSide?: string) {
  const side = overrideSide ?? (pos.transaction_type === "BUY" ? "SELL" : "BUY");
  const sideColor = side === "SELL" ? "#e53935" : "#1976d2";
  const heading = type === "success" ? "Complete" : "Failed";
  const status = type === "success" ? "complete" : "failed";
  // const orderId = pos.token ?? String(pos.id);
  const orderId = String(pos.id) ?? pos.token;

  toast.custom(
    (t) => (
      <div
        className={`trade-toast trade-toast-${type}`}
        style={{
          background: "#ffffff",
          border: "0.5px solid #e5e5e5",
          borderRadius: "4px",
          padding: "14px 16px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
          opacity: t.visible ? 1 : 0,
          transition: "opacity 0.2s ease",
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
          <span style={{ fontSize: "16px", fontWeight: 500, color: "#111" }}>
            {heading}
          </span>
          <button
            onClick={() => toast.dismiss(t.id)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "22px",
              color: "#aaa",
              lineHeight: 1,
              padding: 0,
            }}
          >
            ×
          </button>
        </div>

        <p style={{ fontSize: "15px", margin: "0 0 5px", lineHeight: 1.5 }}>
          <span>{side}</span>{" "}
          {pos.instrument} is {status}.
        </p>

        <p style={{ fontSize: "14px", color: "#555", margin: "0 0 7px" }}>
          {Math.abs(pos.netQty)} qty @ {pos.ltp}
        </p>

        <p style={{ fontSize: "13px", color: "#999", margin: 0 }}>
          #{orderId}
        </p>
      </div>
    ),
    { duration: 4000 }
  );
}