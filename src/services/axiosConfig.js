import axios from "axios";
import { getItem } from "../utils/localStorage";
import { STORAGE_KEYS, DEFAULT_HOST } from "../utils/constants";

export function getLivyTargetUrl() {
  const activeHostId = getItem(STORAGE_KEYS.ACTIVE_HOST, DEFAULT_HOST.id);
  const hosts = getItem(STORAGE_KEYS.HOSTS, [DEFAULT_HOST]);
  const host = hosts.find((h) => h.id === activeHostId) || DEFAULT_HOST;
  return host.url;
}

export function createLivyClient() {
  const targetUrl = getLivyTargetUrl();
  const client = axios.create({
    baseURL: "/api",
    // ✅ FIX 1: Point directly to the Livy URL instead of the local Vite "/api" route
    // baseURL: targetUrl,
    headers: {
      "Content-Type": "application/json",
      // ✅ FIX 2: Removed "X-Livy-Target" since the proxy is no longer intercepting it
      "X-Livy-Target": targetUrl,
    },
    timeout: 30000,
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.msg ||
        error.response?.statusText ||
        error.message ||
        "Unknown error";
      return Promise.reject(new Error(message));
    }
  );

  return client;
}
