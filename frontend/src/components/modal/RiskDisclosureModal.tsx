import { useState } from "react";

export default function RiskDisclosureModal() {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f0f0",
          fontFamily: "sans-serif",
        }}
      >
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: "10px 24px",
            background: "#1a73e8",
            color: "#fff",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          Show Risk Disclosure
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        fontFamily: "'Segoe UI', Arial, sans-serif",
      }}
    >
      {/* Modal Box */}
      <div
        style={{
          background: "#ffffff",
          borderRadius: "8px",
          padding: "32px 36px 28px 36px",
          maxWidth: "580px",
          width: "90%",
          boxShadow: "0 4px 32px rgba(0,0,0,0.18)",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "22px",
          }}
        >
          {/* Document icon */}
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span
            style={{
              fontWeight: "700",
              fontSize: "17px",
              color: "#222",
              letterSpacing: "0.01em",
            }}
          >
            Risk disclosures on derivatives
          </span>
        </div>

        {/* Divider */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e0e0e0",
            margin: "0 0 20px 0",
          }}
        />

        {/* Bullet Points */}
        <ul
          style={{
            margin: "0 0 24px 0",
            padding: "0 0 0 20px",
            color: "#333",
            fontSize: "14.5px",
            lineHeight: "1.75",
          }}
        >
          <li style={{ marginBottom: "12px" }}>
            9 out of 10 individual traders in equity Futures and Options
            Segment, incurred net losses.
          </li>
          <li style={{ marginBottom: "12px" }}>
            On an average, loss makers registered net trading loss close to
            ₹50,000.
          </li>
          <li style={{ marginBottom: "12px" }}>
            Over and above the net trading losses incurred, loss makers expended
            an additional 28% of net trading losses as transaction costs.
          </li>
          <li>
            Those making net trading profits, incurred between 15% to 50% of
            such profits as transaction cost.
          </li>
        </ul>

        {/* Source */}
        <p
          style={{
            fontSize: "11px",
            color: "#888",
            lineHeight: "1.6",
            margin: "0 0 28px 0",
          }}
        >
          Source:{" "}
          <a
            href="https://www.sebi.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#1a73e8", textDecoration: "none" }}
          >
            SEBI study
          </a>{" "}
          dated January 25, 2023 on "Analysis of Profit and Loss of Individual
          Traders dealing in equity Futures and Options (F&O) Segment", wherein
          Aggregate Level findings are based on annual Profit/Loss incurred by
          individual traders in equity F&O during FY 2021-22.
        </p>

        {/* Divider */}
        <hr
          style={{
            border: "none",
            borderTop: "1px solid #e0e0e0",
            margin: "0 0 20px 0",
          }}
        />

        {/* Footer Button */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: "#1e6de5",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              padding: "10px 28px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: "pointer",
              letterSpacing: "0.02em",
              transition: "background 0.15s",
            }}
            onMouseOver={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#1558c0")
            }
            onMouseOut={(e) =>
              ((e.target as HTMLButtonElement).style.background = "#1e6de5")
            }
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
}