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
    headers: {
      "Content-Type": "application/json",
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
