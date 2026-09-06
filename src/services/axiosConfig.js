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
  const cleanUrl = targetUrl.replace(/\/+$/, "");

  const client = axios.create({
    baseURL: cleanUrl,
    headers: {
      "Content-Type": "application/json",
    },
    timeout: 30000,
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.response?.data?.msg ||
        error.response?.statusText ||
        error.message ||
        "Unknown error";
      const err = new Error(message);
      err.response = error.response;
      err.status = error.response?.status;
      return Promise.reject(err);
    }
  );

  return client;
}
