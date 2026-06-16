// src/services/fundApi.ts
import { api } from "../api/api";

// ================= TYPES =================

export interface FundData {
  id: number;
  user_id: string;
  segment: "equity" | "commodity";
  available_margin: number;
  used_margin: number;
  available_cash: number;
  opening_balance: number;
  payin: number;
  payout: number;
  span: number;
  delivery_margin: number;
  exposure: number;
  options_premium: number;
  collateral_liquid_funds: number;
  collateral_equity: number;
  total_collateral: number;
  withdrawable_balance: number;
  withdrawal_type?: "regular" | "instant" | "park";
  last_withdraw_amount: number;
  payment_mode?: "upi" | "netbanking";
  bank_account?: string;
  upi_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WithdrawalHistory {
  id: number;
  user_id: string;
  fund_id: number;
  ref_no?: string;
  segment: "equity" | "commodity";
  amount_requested: number;
  amount_processed?: number;
  withdrawal_type: "regular" | "instant" | "park";
  status: "PENDING" | "PROCESSED" | "FAILED";
  bank_account?: string;
  failure_reason?: string;
  processed_at?: string;
  created_at?: string;
}

export interface AddFundsPayload {
  user_id: string;
  segment?: "equity" | "commodity";
  amount: number;
  payment_mode?: "upi" | "netbanking";
  bank_account?: string;
  upi_id?: string;
}

export interface WithdrawFundsPayload {
  user_id: string;
  segment?: "equity" | "commodity";
  amount: number;
  withdrawal_type?: "regular" | "instant" | "park";
  bank_account?: string;
}

export interface UpdateWithdrawalStatusPayload {
  historyId: number;
  status: "PROCESSED" | "FAILED";
  ref_no?: string;
  amount_processed?: number;
  failure_reason?: string;
}

export interface WithdrawalHistoryParams {
  segment?: "equity" | "commodity";
  status?: "PENDING" | "PROCESSED" | "FAILED";
  limit?: number;
  page?: number;
}

export interface WithdrawalHistoryResponse {
  total: number;
  page: number;
  totalPages: number;
  history: WithdrawalHistory[];
}

// ================= API CALLS =================

// ✅ GET FUNDS (equity + commodity)
export const getFundsApi = async (userId: string) => {
  const res = await api.get(`/funds/${userId}`);
  return res.data;
};

// ✅ ADD FUNDS
export const addFundsApi = async (data: AddFundsPayload) => {
  const res = await api.post("/funds/add", data);
  return res.data;
};

// ✅ WITHDRAW FUNDS
export const withdrawFundsApi = async (data: WithdrawFundsPayload) => {
  const res = await api.post("/funds/withdraw", data);
  return res.data;
};

// ✅ UPDATE WITHDRAWAL STATUS (admin / webhook)
export const updateWithdrawalStatusApi = async ({
  historyId,
  ...data
}: UpdateWithdrawalStatusPayload) => {
  const res = await api.patch(`/funds/withdraw/${historyId}/status`, data);
  return res.data;
};

// ✅ GET WITHDRAWAL HISTORY
export const getWithdrawalHistoryApi = async (
  userId: string,
  params?: WithdrawalHistoryParams
) => {
  const res = await api.get(`/funds/withdraw/history/${userId}`, { params });
  return res.data;
};