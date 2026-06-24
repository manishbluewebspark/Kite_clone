// import axios from "axios";

// export const api = axios.create({
//   baseURL: "http://localhost:5000/api",
//   withCredentials: true,
// });


// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");

//   if (token && config.headers) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });


import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/v1",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// axiosInstance bhi same export karo (jo store files use karti hain)
export const axiosInstance = api;
export default api;