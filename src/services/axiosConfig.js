import axios from "axios";
import { getItem } from "../utils/localStorage";
import { STORAGE_KEYS, DEFAULT_HOST, DATA_SOURCE_TYPES } from "../utils/constants";

export function getLivyTargetUrl() {
  const activeHostId = getItem(STORAGE_KEYS.ACTIVE_HOST, DEFAULT_HOST.id);
  const hosts = getItem(STORAGE_KEYS.HOSTS, [DEFAULT_HOST]);

  // 1. If activeHost is explicitly a Spark host, use it
  const activeHost = hosts.find((h) => h.id === activeHostId);
  if (
    activeHost &&
    (activeHost.type === DATA_SOURCE_TYPES.SPARK ||
      activeHost.engine === "spark" ||
      (!activeHost.type && !activeHost.engine))
  ) {
    return activeHost.url;
  }

  // 2. Otherwise try the last active Spark host
  const lastSparkId = getItem("livy-last-spark-host", null);
  const lastSparkHost = lastSparkId ? hosts.find((h) => h.id === lastSparkId) : null;
  if (
    lastSparkHost &&
    (lastSparkHost.type === DATA_SOURCE_TYPES.SPARK ||
      lastSparkHost.engine === "spark" ||
      (!lastSparkHost.type && !lastSparkHost.engine))
  ) {
    return lastSparkHost.url;
  }

  // 3. Fallback to any Spark host in list
  const anySpark = hosts.find(
    (h) =>
      h.type === DATA_SOURCE_TYPES.SPARK ||
      h.engine === "spark" ||
      (!h.type && !h.engine)
  );

  return anySpark?.url || DEFAULT_HOST.url;
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
