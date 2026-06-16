import { api } from "../api/api";

// ================= TYPES =================

export interface User {
  id: string;
  user_id?: string;
  name: string;
  email: string;
  mobile?: string;
  address?: string;
  api_key?: string;
  secret_key?: string;
  account_type?: string;
  status: boolean;
  role: string;
  created_at?: string;
}

export interface AddUserPayload {
  name: string;
  email: string;
  mobile?: string;
  address?: string;
  apiKey?: string;
  secretKey?: string;
  accountType?: string;
}

export interface UpdateUserPayload {
  id: string;
  data: Partial<AddUserPayload>;
}

// ================= API CALLS =================

// ✅ ADD USER
export const addUserApi = async (data: AddUserPayload) => {
  const res = await api.post("/users/add", data);
  return res.data;
};

// ✅ GET ALL USERS
export const getUsersApi = async () => {
  const res = await api.get("/users/all");
  return res.data;
};

// ✅ GET SINGLE USER
export const getUserApi = async (id: string) => {
  const res = await api.get(`/users/${id}`);
  return res.data;
};

// ✅ UPDATE USER
export const updateUserApi = async ({ id, data }: UpdateUserPayload) => {
  const res = await api.put(`/users/update/${id}`, data);
  return res.data;
};

// ✅ DELETE USER
export const deleteUserApi = async (id: string) => {
  const res = await api.delete(`/users/delete/${id}`);
  return res.data;
};