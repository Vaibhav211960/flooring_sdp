import axios from "axios";

const adminApi = axios.create({
  baseURL: "https://flooring-sdp.onrender.com/api" || "http://localhost:5000/api",
});

adminApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default adminApi;
