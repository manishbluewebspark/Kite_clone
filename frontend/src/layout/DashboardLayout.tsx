import Header from "../components/Header";
import WatchlistPanel from "../components/WatchlistPanel";

export default function DashboardLayout({ children }: any) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── HEADER with nav links ── */}
      <Header />

      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 max-w-full px-20 mx-auto w-full overflow-hidden">
          {/* ── LEFT: Fixed Watchlist Panel (Zerodha style) ── */}
          <WatchlistPanel />

          {/* ── MAIN CONTENT ── */}
          <div
            className="flex-1 overflow-y-auto"
            // style={{ backgroundColor: "var(--color-primary-light)" }}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}