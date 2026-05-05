import axios from "axios";
import { authStore } from "@/services/auth/auth.store";

export const http = axios.create({
  baseURL: process.env.NEXT_PUBLIC_NEST_API,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

http.interceptors.request.use((config) => {
  const token = authStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function isJwtStillValid(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    if (!payload) return false;
    let base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = base64.length % 4;
    if (pad) base64 += "=".repeat(4 - pad);
    const data = JSON.parse(atob(base64)) as { exp?: number };
    return !!data.exp && data.exp * 1000 - Date.now() > 1_000;
  } catch {
    return false;
  }
}

let isRefreshing = false;
type QueueEntry = { resolve: (token: string) => void; reject: (err: unknown) => void };
let refreshQueue: Array<QueueEntry> = [];

http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }
    original._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            original.headers.Authorization = `Bearer ${token}`;
            resolve(http(original));
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const res = await http.post<{ accessToken: string }>("/auth/refresh");
      const newToken = res.data.accessToken;
      authStore.getState().setAuth({ accessToken: newToken });
      refreshQueue.forEach(({ resolve }) => resolve(newToken));
      refreshQueue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return http(original);
    } catch (err) {
      // Fallback: if stored token is still valid use it and retry
      const { accessToken: storedToken } = authStore.getState();
      if (storedToken && isJwtStillValid(storedToken)) {
        authStore.getState().setAuth({ accessToken: storedToken });
        refreshQueue.forEach(({ resolve }) => resolve(storedToken));
        refreshQueue = [];
        original.headers.Authorization = `Bearer ${storedToken}`;
        return http(original);
      }
      // Drain queue so all waiting requests reject instead of hanging forever
      refreshQueue.forEach(({ reject }) => reject(err));
      refreshQueue = [];
      authStore.getState().clear();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
);
