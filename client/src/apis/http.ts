import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import { API_BASE_URL, ENDPOINTS } from "@/constants/endpoints";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

// ── Token helpers (localStorage) ──────────────────────────────────────────────
export const tokenStore = {
  getAccess: () => localStorage.getItem(ACCESS_TOKEN_KEY) ?? "",
  getRefresh: () => localStorage.getItem(REFRESH_TOKEN_KEY) ?? "",
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, access);
    localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },
};

// ── Axios instance ─────────────────────────────────────────────────────────────
const http: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15_000,
  headers: { "Content-Type": "application/json" },
});

// Request: gắn access_token vào mọi request
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccess();
  console.log("token", token);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Track xem có đang refresh hay không để tránh vòng lặp
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const flushQueue = (token: string | null, error: unknown = null) => {
  pendingQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  pendingQueue = [];
};

// Response: bắt 401 → tự refresh token → retry
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    // Nếu chính endpoint refresh-token bị 401 → đăng xuất
    if (original.url?.includes(ENDPOINTS.REFRESH_TOKEN)) {
      tokenStore.clear();
      window.location.href = "/login";
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Có request khác đang refresh → đợi trong queue
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then((newToken) => {
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const refresh_token = tokenStore.getRefresh();
      const { data } = await http.post(ENDPOINTS.REFRESH_TOKEN, {
        refresh_token,
      });
      const newAccess: string = data.result.accessToken;
      const newRefresh: string = data.result.refreshToken;

      tokenStore.setTokens(newAccess, newRefresh);
      flushQueue(newAccess);

      original.headers.Authorization = `Bearer ${newAccess}`;
      return http(original);
    } catch (refreshError) {
      flushQueue(null, refreshError);
      tokenStore.clear();
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

export default http;
