import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addUserApi,
  getUsersApi,
  getUserApi,
  updateUserApi,
  deleteUserApi,
} from "../services/userApi";

// ================= GET ALL USERS =================
export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: getUsersApi,
  });
};

// ================= GET SINGLE USER =================
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUserApi(id),
    enabled: !!id,
  });
};

// ================= ADD USER =================
export const useAddUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addUserApi,

    onSuccess: (data) => {
      console.log("✅ User Added:", data);

      // refresh list
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error: any) => {
      console.error("❌ Add Error:", error.response?.data || error.message);
    },
  });
};

// ================= UPDATE USER =================
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserApi,

    onSuccess: () => {
      console.log("✅ User Updated");

      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error: any) => {
      console.error("❌ Update Error:", error.response?.data || error.message);
    },
  });
};

// ================= DELETE USER =================
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUserApi,

    onSuccess: () => {
      console.log("🗑️ User Deleted");

      queryClient.invalidateQueries({ queryKey: ["users"] });
    },

    onError: (error: any) => {
      console.error("❌ Delete Error:", error.response?.data || error.message);
    },
  });
};