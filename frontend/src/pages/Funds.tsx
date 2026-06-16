import { useState } from "react";
import { PieChart, Atom, RotateCcw, HelpCircle } from "lucide-react";
import AddFundsModal from "../components/modal/AddFundsModal";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useFunds } from "../hooks/useFundHook";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatAmount = (value: number | string | undefined | null) => {
    const num = parseFloat(String(value ?? 0));
    return num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

function Row({
    label,
    value,
    valueClassName = "",
}: {
    label: string;
    value: number | string | undefined | null;
    valueClassName?: string;
}) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-gray-500">{label}</span>
            <span className={`text-gray-800 ${valueClassName}`}>{formatAmount(value)}</span>
        </div>
    );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-gray-700">
                {icon}
                <span className="text-[16px]">{title}</span>
            </div>
            <div className="flex items-center gap-4 text-[13px]">
                <button className="flex items-center gap-1 text-blue-500 hover:text-blue-600">
                    <RotateCcw size={12} />
                    <span>View statement</span>
                </button>
                <button className="flex items-center gap-1 text-gray-400 hover:text-gray-600">
                    <HelpCircle size={12} />
                    <span>Help</span>
                </button>
            </div>
        </div>
    );
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <div className="flex items-center justify-between py-3">
            <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
            <div className="h-3 bg-gray-100 rounded w-20 animate-pulse" />
        </div>
    );
}

function FundSkeleton() {
    return (
        <div className="border border-gray-200 rounded">
            <div className="px-5">
                <div className="flex items-center justify-between py-4">
                    <div className="h-3 bg-gray-100 rounded w-28 animate-pulse" />
                    <div className="h-7 bg-gray-100 rounded w-32 animate-pulse" />
                </div>
                <SkeletonRow />
                <SkeletonRow />
            </div>
            <div className="border-t border-gray-100 px-5">
                {Array.from({ length: 7 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function Funds() {
    const { user } = useAuthStore();
    const userId = (user?.user_id || user?.id) as string;

    const { data, isLoading, isError, refetch } = useFunds(userId);

    const equity    = data?.data?.equity;
    const commodity = data?.data?.commodity;

    const [showAddFunds, setShowAddFunds] = useState(false);
    const navigate = useNavigate();

    return (
        <>
            {showAddFunds && (
                <AddFundsModal onClose={() => { setShowAddFunds(false); refetch(); }} />
            )}

            <div className="h-full overflow-auto bg-white text-[13px] px-5 py-5">
                {/* Top bar */}
                <div className="flex items-center justify-end gap-4 mb-6">
                    <span className="text-gray-400 text-[13px]">
                        Instant, zero-cost fund transfers with{" "}
                        <span className="font-semibold text-gray-500">UPI</span>
                    </span>
                    <button
                        onClick={() => setShowAddFunds(true)}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold text-[13px] px-4 py-2 rounded"
                    >
                        Add funds
                    </button>
                    <button
                        onClick={() => navigate("/withdraw")}
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold text-[13px] px-4 py-2 rounded"
                    >
                        Withdraw
                    </button>
                </div>

                {/* Error state */}
                {isError && (
                    <div className="flex items-center gap-3 text-red-500 text-[13px] mb-4 p-3 bg-red-50 rounded border border-red-200">
                        <span>Failed to load fund data.</span>
                        <button onClick={() => refetch()} className="text-blue-500 hover:underline">
                            Retry
                        </button>
                    </div>
                )}

                {/* Two columns */}
                <div className="flex gap-10 flex-wrap">

                    {/* ── Equity ── */}
                    <div className="w-full max-w-[480px]">
                        <SectionHeader icon={<PieChart size={16} />} title="Equity" />

                        {isLoading ? <FundSkeleton /> : (
                            <div className="border border-gray-200 rounded">
                                <div className="px-5">
                                    <div className="flex items-center justify-between py-4">
                                        <span className="text-gray-500">Available margin</span>
                                        <span className="text-[26px] font-medium text-blue-500">
                                            {formatAmount(equity?.available_margin)}
                                        </span>
                                    </div>
                                    <Row label="Used margin"    value={equity?.used_margin}    valueClassName="text-[16px]" />
                                    <Row label="Available cash" value={equity?.available_cash} valueClassName="text-[16px]" />
                                </div>

                                <div className="border-t border-gray-100 px-5">
                                    <Row label="Opening balance" value={equity?.opening_balance} />
                                    <Row label="Payin"           value={equity?.payin} />
                                    <Row label="Payout"          value={equity?.payout} />
                                    <Row label="SPAN"            value={equity?.span} />
                                    <Row label="Delivery margin" value={equity?.delivery_margin} />
                                    <Row label="Exposure"        value={equity?.exposure} />
                                    <Row label="Options premium" value={equity?.options_premium} />
                                </div>

                                <div className="border-t border-gray-100 px-5 pb-2">
                                    <Row label="Collateral (Liquid funds)" value={equity?.collateral_liquid_funds} />
                                    <Row label="Collateral (Equity)"       value={equity?.collateral_equity} />
                                    <Row label="Total collateral"          value={equity?.total_collateral} />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ── Commodity ── */}
                    <div className="w-full max-w-[480px]">
                        <SectionHeader icon={<Atom size={16} />} title="Commodity" />

                        {isLoading ? <FundSkeleton /> : (
                            <div className="border border-gray-200 rounded">
                                <div className="px-5">
                                    <div className="flex items-center justify-between py-4">
                                        <span className="text-gray-500">Available margin</span>
                                        <span className="text-[26px] font-medium text-gray-800">
                                            {formatAmount(commodity?.available_margin)}
                                        </span>
                                    </div>
                                    <Row label="Used margin"    value={commodity?.used_margin}    valueClassName="text-[16px]" />
                                    <Row label="Available cash" value={commodity?.available_cash} valueClassName="text-[16px]" />
                                </div>

                                <div className="border-t border-gray-100 px-5 pb-2">
                                    <Row label="Opening balance" value={commodity?.opening_balance} />
                                    <Row label="Payin"           value={commodity?.payin} />
                                    <Row label="Payout"          value={commodity?.payout} />
                                    <Row label="SPAN"            value={commodity?.span} />
                                    <Row label="Delivery margin" value={commodity?.delivery_margin} />
                                    <Row label="Exposure"        value={commodity?.exposure} />
                                    <Row label="Options premium" value={commodity?.options_premium} />
                                </div>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}