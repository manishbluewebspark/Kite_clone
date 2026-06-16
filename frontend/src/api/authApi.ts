import { api } from "./api";

// Types
// export interface LoginPayload {
//   email: string;
//   password: string;
// }

// // Login
// export const loginApi = (data: LoginPayload) => {
//   return api.post("/auth/login", data);
// };


export interface LoginPayload {
  loginId: string;
  password: string;
}

export const loginApi = (data: LoginPayload) => {
  return api.post("/auth/login", data);
};

// Get Current User
export const meApi = () => {
  return api.get("/auth/me");
};

// Logout
export const logoutApi = () => {
  return api.post("/auth/logout");
};


export const sendOtpApi = (data: { email: string }) =>
  api.post("/auth/send-otp", data);

export const verifyOtpApi = (data: { email: string; otp: string }) =>
  api.post("/auth/verify-otp", data);

export const resetPasswordApi = (data: {
  email: string;
  newPassword: string;
}) => api.post("/auth/reset-password", data);