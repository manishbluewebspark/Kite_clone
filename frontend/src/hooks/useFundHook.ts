// src/hooks/useFundHook.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getFundsApi,
  addFundsApi,
  withdrawFundsApi,
  updateWithdrawalStatusApi,
  getWithdrawalHistoryApi,
  type AddFundsPayload,
  type WithdrawFundsPayload,
  type UpdateWithdrawalStatusPayload,
  type WithdrawalHistoryParams,
} from "../services/fundApi";

// ================= GET FUNDS (equity + commodity) =================
export const useFunds = (userId: string) => {
  return useQuery({
    queryKey: ["funds", userId],
    queryFn: () => getFundsApi(userId),
    enabled: !!userId,
  });
};

// ================= ADD FUNDS =================
export const useAddFunds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddFundsPayload) => addFundsApi(data),

    onSuccess: (data) => {
      console.log("✅ Funds Added:", data);
      // Refresh fund balance
      queryClient.invalidateQueries({ queryKey: ["funds"] });
    },

    onError: (error: any) => {
      console.error("❌ Add Funds Error:", error.response?.data || error.message);
    },
  });
};

// ================= WITHDRAW FUNDS =================
export const useWithdrawFunds = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: WithdrawFundsPayload) => withdrawFundsApi(data),

    onSuccess: (data) => {
      console.log("✅ Withdrawal Initiated:", data);
      // Refresh balance + history
      queryClient.invalidateQueries({ queryKey: ["funds"] });
      queryClient.invalidateQueries({ queryKey: ["withdrawalHistory"] });
    },

    onError: (error: any) => {
      console.error("❌ Withdraw Error:", error.response?.data || error.message);
    },
  });
};

// ================= UPDATE WITHDRAWAL STATUS (admin/webhook) =================
export const useUpdateWithdrawalStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWithdrawalStatusPayload) =>
      updateWithdrawalStatusApi(data),

    onSuccess: (data) => {
      console.log("✅ Withdrawal Status Updated:", data);
      queryClient.invalidateQueries({ queryKey: ["withdrawalHistory"] });
      queryClient.invalidateQueries({ queryKey: ["funds"] });
    },

    onError: (error: any) => {
      console.error("❌ Status Update Error:", error.response?.data || error.message);
    },
  });
};

// ================= GET WITHDRAWAL HISTORY =================
export const useWithdrawalHistory = (
  userId: string,
  params?: WithdrawalHistoryParams
) => {
  return useQuery({
    queryKey: ["withdrawalHistory", userId, params],
    queryFn: () => getWithdrawalHistoryApi(userId, params),
    enabled: !!userId,
  });
};