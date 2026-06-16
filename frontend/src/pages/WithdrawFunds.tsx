// src/pages/WithdrawFunds.tsx
import { CreditCard, Clock } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";
import { useAuthStore } from "../store/useAuthStore";
import { useFunds, useWithdrawFunds, useWithdrawalHistory } from "../hooks/useFundHook";

// ─── Badges ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const base = "text-[11px] font-semibold px-3 py-1 rounded-sm tracking-wide";
  if (status === "PROCESSED")
    return <span className={`${base} text-blue-500 bg-blue-50 border border-blue-200`}>PROCESSED</span>;
  if (status === "FAILED")
    return <span className={`${base} text-red-400 bg-red-50 border border-red-200`}>FAILED</span>;
  return <span className={`${base} text-yellow-600 bg-yellow-50 border border-yellow-200`}>{status}</span>;
}

function TagBadge({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-semibold px-2 py-0.5 rounded border border-yellow-400 text-yellow-600 bg-yellow-50 tracking-wide">
      {label}
    </span>
  );
}

function InstantBadge() {
  return (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-green-500 text-white tracking-wide">
      INSTANT
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="py-4 pr-6">
          <div className="h-3 bg-gray-100 rounded animate-pulse w-24" />
        </td>
      ))}
    </tr>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────

const fmt = (value: number | string | undefined | null) => {
  const num = parseFloat(String(value ?? 0));
  return "₹" + num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const fmtDate = (dateStr: string | undefined) => {
  if (!dateStr) return "–";
  return new Date(dateStr).toISOString().slice(0, 10);
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WithdrawFunds() {
  const { user } = useAuthStore();
  const userId = (user?.user_id || user?.id) as string;

  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState<"regular" | "instant" | "park">("regular");

  // ── API hooks ──────────────────────────────────────────────────────────────
  const { data: fundsData, isLoading: fundsLoading } = useFunds(userId);
  const equity = fundsData?.data?.equity;

  const {
    data: historyData,
    isLoading: historyLoading,
    refetch: refetchHistory,
  } = useWithdrawalHistory(userId, { limit: 20, page: 1 });

  const history = historyData?.data?.history ?? [];

  const { mutate: withdraw, isPending } = useWithdrawFunds();

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (mode === "instant" && parseFloat(amount) > 200000) {
      toast.error("Instant withdrawal limit is ₹2,00,000");
      return;
    }
    const withdrawable = parseFloat(String(equity?.withdrawable_balance ?? 0));
    if (parseFloat(amount) > withdrawable) {
      toast.error(`Insufficient balance. Available: ₹${withdrawable.toFixed(2)}`);
      return;
    }

    withdraw(
      {
        user_id: userId,
        segment: "equity",
        amount: parseFloat(amount),
        withdrawal_type: mode,
        bank_account: equity?.bank_account ?? "",
      },
      {
        onSuccess: () => {
          toast.success("Withdrawal initiated successfully!");
          setAmount("");
          refetchHistory();
        },
        onError: (error: any) => {
          toast.error(error?.response?.data?.message || "Withdrawal failed. Try again.");
          refetchHistory(); // refresh to show FAILED entry
        },
      }
    );
  };

  // ── Derived balance values ─────────────────────────────────────────────────
  const closingBalance      = equity?.opening_balance      ?? 0;
  const unsettledCredits    = 0; // extend when backend provides
  const payin               = equity?.payin                ?? 0;
  const collateralUtilised  = equity?.total_collateral     ?? 0;
  const withdrawableBalance = equity?.withdrawable_balance ?? 0;

  return (
    <div className="min-h-full bg-white text-[13px] px-10 py-8">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <CreditCard size={18} className="text-gray-700" />
        <h1 className="text-[22px] font-normal text-gray-800">Withdraw funds</h1>
      </div>
      <p className="text-gray-400 text-[12px]">
        Last updated: {new Date().toISOString().replace("T", " ").slice(0, 19)}
      </p>
      <p className="text-gray-400 text-[12px] mb-5">
        Next quarterly settlement on 2026-07-03.{" "}
        <a href="#" className="text-blue-500 hover:underline">Learn more.</a>
      </p>

      <hr className="border-gray-200 mb-8" />

      {/* Two-column layout */}
      <div className="flex gap-16 flex-wrap mb-10">

        {/* Left — input + options */}
        <div className="flex-1 min-w-[320px] max-w-[480px]">
          <div className="flex items-center gap-3 mb-5">
            <input
              type="number"
              placeholder="Amount to withdraw"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isPending}
              className="border border-gray-300 rounded px-3 text-[13px] text-gray-700 outline-none"
              style={{ height: 40, width: 260 }}
            />
            <button
              onClick={handleWithdraw}
              disabled={isPending}
              className="text-white font-semibold text-[13px] rounded px-5 flex items-center gap-2"
              style={{
                height: 40,
                backgroundColor: isPending ? "#6aabea" : "#387ED1",
                cursor: isPending ? "not-allowed" : "pointer",
              }}
              onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.backgroundColor = "#2d6cb8"; }}
              onMouseLeave={(e) => { if (!isPending) e.currentTarget.style.backgroundColor = "#387ED1"; }}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing...
                </>
              ) : "Continue"}
            </button>
          </div>

          {/* Radio options */}
          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" checked={mode === "regular"} onChange={() => setMode("regular")}
                className="accent-blue-500" style={{ width: 15, height: 15 }} />
              <span className="text-gray-700">Regular (24-48 hours)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" checked={mode === "instant"} onChange={() => setMode("instant")}
                className="accent-blue-500" style={{ width: 15, height: 15 }} />
              <span className="text-gray-700">Instant (Max: ₹200000)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="mode" checked={mode === "park"} onChange={() => setMode("park")}
                className="accent-blue-500" style={{ width: 15, height: 15 }} />
              <span className="text-gray-700">Park funds in Zerodha Liquid Case ETF</span>
            </label>
          </div>
        </div>

        {/* Right — balance summary */}
        <div className="flex-1 min-w-[280px] max-w-[420px]">
          {fundsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex justify-between">
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-32" />
                  <div className="h-3 bg-gray-100 rounded animate-pulse w-20" />
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-gray-600">
                <span>Closing balance</span>
                <span className="text-gray-800">{fmt(closingBalance)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Unsettled credits (-)</span>
                <span className="text-gray-800">{fmt(unsettledCredits)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payin (-)</span>
                <span className="text-gray-800">{fmt(payin)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Collateral utilised (+)</span>
                <span className="text-gray-800">{fmt(collateralUtilised)}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-blue-500 font-medium flex items-center gap-1">
                  Withdrawable balance
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-blue-400">
                    <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M8 7v5M8 5.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <span className="text-blue-500 font-semibold text-[16px]">{fmt(withdrawableBalance)}</span>
              </div>
              <div className="text-right">
                <a href="#" className="text-blue-500 text-[12px] hover:underline">View breakdown →</a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent withdrawals */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Clock size={15} className="text-gray-500" />
          <h2 className="text-[15px] font-normal text-gray-700">Recent withdrawals</h2>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left text-gray-400 font-normal py-2 pr-6 text-[12px]">Date</th>
              <th className="text-left text-gray-400 font-normal py-2 pr-6 text-[12px]">Ref. no.</th>
              <th className="text-left text-gray-400 font-normal py-2 pr-6 text-[12px]">Status</th>
              <th className="text-right text-gray-400 font-normal py-2 pr-6 text-[12px]">Amount requested</th>
              <th className="text-right text-gray-400 font-normal py-2 text-[12px]">Amount processed</th>
            </tr>
          </thead>
          <tbody>
            {historyLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
            ) : history.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400 text-[12px]">
                  No withdrawal history found.
                </td>
              </tr>
            ) : (
              history.map((row: any) => (
                <tr key={row.id} className="border-b border-gray-100">
                  {/* Date */}
                  <td className="py-4 pr-6 text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {row.withdrawal_type === "instant" && <InstantBadge />}
                      {fmtDate(row.created_at)}
                    </div>
                  </td>

                  {/* Ref no + tag */}
                  <td className="py-4 pr-6">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-gray-600">{row.ref_no || "–"}</span>
                      <TagBadge label="PRIMARY" />
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-4 pr-6">
                    <StatusBadge status={row.status} />
                  </td>

                  {/* Amount requested */}
                  <td className="py-4 pr-6 text-right text-gray-600">
                    {fmt(row.amount_requested)}
                  </td>

                  {/* Amount processed */}
                  <td className="py-4 text-right text-gray-600">
                    {row.amount_processed ? fmt(row.amount_processed) : "–"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}