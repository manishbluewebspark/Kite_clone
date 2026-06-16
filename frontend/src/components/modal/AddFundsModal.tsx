// src/components/modal/AddFundsModal.tsx
import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuthStore } from "../../store/useAuthStore";
import { useAddFunds } from "../../hooks/useFundHook";

interface AddFundsModalProps {
    onClose: () => void;
}

export default function AddFundsModal({ onClose }: AddFundsModalProps) {
    const { user } = useAuthStore();
    const { mutate: addFunds, isPending } = useAddFunds();

    const [amount, setAmount] = useState("");
    const [segment, setSegment] = useState<"equity" | "commodity">("equity");
    const [account, setAccount] = useState("");
    const [upiId, setUpiId] = useState("");
    const [paymentMode, setPaymentMode] = useState<"upi" | "netbanking">("upi");

    const handleContinue = () => {
        if (!amount || parseFloat(amount) <= 0) {
            toast.error("Please enter a valid amount");
            return;
        }
        if (!user?.id && !user?.user_id) {
            toast.error("User not found. Please login again.");
            return;
        }
        if (paymentMode === "upi" && !upiId.trim()) {
            toast.error("Please enter your UPI ID");
            return;
        }
        if (!account.trim()) {
            toast.error("Please select a bank account");
            return;
        }

        addFunds(
            {
                user_id: (user?.user_id || user?.id) as string,
                segment,
                amount: parseFloat(amount),
                payment_mode: paymentMode,
                bank_account: account,
                upi_id: paymentMode === "upi" ? upiId : undefined,
            },
            {
                onSuccess: () => {
                    toast.success("Funds added successfully!");
                    onClose();
                },
                onError: (error: any) => {
                    toast.error(
                        error?.response?.data?.message || "Failed to add funds. Try again."
                    );
                },
            }
        );
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
            style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div
                className="relative bg-white rounded-lg shadow-xl w-full"
                style={{ maxWidth: 420, padding: "36px 36px 28px" }}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    disabled={isPending}
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                >
                    <X size={18} />
                </button>

                {/* Logo */}
                <div className="flex justify-center mb-5">
                    <img src="/images/zerodha.svg" alt="Zerodha" className="h-8 w-auto object-contain" />
                </div>

                {/* Title */}
                <h2 className="text-center text-gray-800 font-normal mb-5" style={{ fontSize: 22 }}>
                    Deposit funds
                </h2>

                {/* User row */}
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-gray-200">
                    <span className="text-gray-800 text-[14px]">{user?.name}</span>
                    <span className="text-gray-500 text-[13px]">{user?.user_id}</span>
                </div>

                {/* Amount */}
                <div className="mb-4">
                    <label className="block text-gray-600 text-[13px] mb-1">Amount</label>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden" style={{ height: 40 }}>
                        <div
                            className="flex items-center justify-center bg-gray-50 border-r border-gray-300 text-gray-500"
                            style={{ width: 38, height: "100%", fontSize: 15 }}
                        >
                            ₹
                        </div>
                        <input
                            type="number"
                            placeholder="Enter amount"
                            value={amount}
                            min={1}
                            onChange={(e) => setAmount(e.target.value)}
                            disabled={isPending}
                            className="flex-1 px-3 text-[13px] text-gray-700 outline-none bg-white"
                            style={{ height: "100%" }}
                        />
                    </div>
                </div>

                {/* Segment */}
                <div className="mb-4">
                    <label className="block text-gray-600 text-[13px] mb-1">Segment</label>
                    <div className="relative">
                        <select
                            value={segment}
                            onChange={(e) => setSegment(e.target.value as "equity" | "commodity")}
                            disabled={isPending}
                            className="w-full border border-gray-300 rounded px-3 text-[13px] text-gray-700 bg-white appearance-none outline-none"
                            style={{ height: 40 }}
                        >
                            <option value="equity">Equity/Derivatives/Currency</option>
                            <option value="commodity">Commodity</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* Account */}
                <div className="mb-1">
                    <label className="block text-gray-600 text-[13px] mb-1">Account</label>
                    <div className="relative">
                        <select
                            value={account}
                            onChange={(e) => setAccount(e.target.value)}
                            disabled={isPending}
                            className="w-full border border-gray-300 rounded px-3 text-[13px] text-gray-700 bg-white appearance-none outline-none"
                            style={{ height: 40 }}
                        >
                            <option value="">Select account</option>
                            <option value="UNION BANK OF INDIA - XXX 0069">UNION BANK OF INDIA - XXX 0069</option>
                            <option value="HDFC BANK - XXX 1234">HDFC BANK - XXX 1234</option>
                            <option value="SBI - XXX 5678">SBI - XXX 5678</option>
                        </select>
                        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                </div>

                <p className="text-[11px] text-gray-400 mb-4">
                    Add another bank account from{" "}
                    <a href="#" className="text-blue-500 underline">Console.</a>
                </p>

                {/* UPI ID — only when upi selected */}
                {paymentMode === "upi" && (
                    <div className="mb-4">
                        <label className="block text-gray-600 text-[13px] mb-1">
                            Virtual payment address (UPI ID)
                        </label>
                        <input
                            type="text"
                            placeholder="yourname@upi"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            disabled={isPending}
                            className="w-full border border-gray-300 rounded px-3 text-[13px] text-gray-700 bg-white outline-none"
                            style={{ height: 40 }}
                        />
                    </div>
                )}

                {/* Payment mode */}
                <div className="mb-6">
                    <label className="block text-gray-600 text-[13px] mb-2">Payment mode</label>
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="paymentMode"
                                checked={paymentMode === "upi"}
                                onChange={() => setPaymentMode("upi")}
                                disabled={isPending}
                                className="accent-blue-500"
                                style={{ width: 16, height: 16 }}
                            />
                            <span className="text-[13px] text-gray-700">UPI</span>
                            <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#22c55e" }}>
                                FREE
                            </span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="paymentMode"
                                checked={paymentMode === "netbanking"}
                                onChange={() => setPaymentMode("netbanking")}
                                disabled={isPending}
                                className="accent-blue-500"
                                style={{ width: 16, height: 16 }}
                            />
                            <span className="text-[13px] text-gray-700">Net banking</span>
                            <span className="text-gray-500 text-[11px] border border-gray-300 px-1.5 py-0.5 rounded">
                                ₹9 + GST
                            </span>
                        </label>
                    </div>
                </div>

                {/* Continue button */}
                <button
                    onClick={handleContinue}
                    disabled={isPending}
                    className="w-full text-white font-semibold text-[14px] rounded flex items-center justify-center gap-2"
                    style={{
                        backgroundColor: isPending ? "#6aabea" : "#387ED1",
                        height: 44,
                        cursor: isPending ? "not-allowed" : "pointer",
                    }}
                    onMouseEnter={(e) => { if (!isPending) e.currentTarget.style.backgroundColor = "#2d6cb8"; }}
                    onMouseLeave={(e) => { if (!isPending) e.currentTarget.style.backgroundColor = "#387ED1"; }}
                >
                    {isPending ? (
                        <>
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Processing...
                        </>
                    ) : (
                        "CONTINUE"
                    )}
                </button>

                {/* Footer */}
                <p className="text-center text-[11px] text-gray-400 mt-4">
                    <a href="#" className="text-blue-500 underline">Click here</a>{" "}
                    to know more about other payment methods (IMPS/NEFT/RTGS).
                </p>
            </div>
        </div>
    );
}