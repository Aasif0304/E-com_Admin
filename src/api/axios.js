import axios from "axios";

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:8000"
).replace(/\/$/, "");

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Convert relative image URLs (e.g. /img/...) to absolute URLs
export function getAssetUrl(path) {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${API_BASE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

// Attach Admin token to every outgoing request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-handle 401 Unauthorized -> clear admin session and redirect to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isAuthCall = err.config?.url?.includes("/auth/");
    if (err.response?.status === 401 && !isAuthCall) {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export default api;

