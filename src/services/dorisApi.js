import axios from "axios";

/**
 * Safely encodes UTF-8 string into Base64 for HTTP Basic Auth
 */
function toBase64(str = "") {
  try {
    return btoa(unescape(encodeURIComponent(str)));
  } catch {
    return btoa(str);
  }
}

/**
 * Normalizes Doris FE base URL (removes trailing slashes)
 */
export function cleanDorisUrl(rawUrl = "") {
  return (rawUrl || "http://localhost:8030").replace(/\/+$/, "");
}

/**
 * Creates an Axios client configured for Apache Doris FE HTTP
 */
export function createDorisClient(config = {}) {
  const baseURL = cleanDorisUrl(config.url);
  const headers = {
    "Content-Type": "application/json",
  };

  const username = config.username != null ? String(config.username).trim() : "root";
  const password = config.password != null ? String(config.password) : "";

  if (username) {
    headers["Authorization"] = `Basic ${toBase64(`${username}:${password}`)}`;
  }

  const client = axios.create({
    baseURL,
    headers,
    timeout: config.timeoutMs || 45000,
  });

  return client;
}

/**
 * Executes a SQL statement directly against Apache Doris FE HTTP Query API.
 * Endpoint: POST /api/query/<cluster_name>/<db_name>
 *
 * @param {Object} params
 * @param {string} params.url - Doris FE URL (e.g. http://localhost:8030)
 * @param {string} [params.cluster="default_cluster"] - Doris cluster name
 * @param {string} [params.database=""] - Target database name
 * @param {string} [params.username="root"] - Username
 * @param {string} [params.password=""] - Password
 * @param {string} params.sql - SQL statement to execute
 * @param {number} [params.timeoutMs=45000] - Request timeout in ms
 * @param {AbortSignal} [params.signal] - Optional AbortSignal for query cancellation
 * @returns {Promise<{ ok: boolean, data: any, elapsed: number, rowCount: number }>}
 */
export async function executeDorisQuery({
  url,
  cluster = "default_cluster",
  database = "",
  username = "root",
  password = "",
  sql,
  timeoutMs = 45000,
  signal,
}) {
  const client = createDorisClient({ url, username, password, timeoutMs });
  const cleanCluster = (cluster || "default_cluster").trim();
  const cleanDb = (database || "").trim();

  // If no DB is specified, query against default or information_schema
  const targetDb = cleanDb || "information_schema";
  const endpoint = `/api/query/${encodeURIComponent(cleanCluster)}/${encodeURIComponent(targetDb)}`;

  const startTime = performance.now();

  try {
    const response = await client.post(
      endpoint,
      { stmt: sql },
      { signal }
    );

    const elapsed = performance.now() - startTime;
    const body = response.data;

    if (!body) {
      throw new Error("Empty response received from Apache Doris");
    }

    // Doris FE returns code !== 0 on query execution failures
    if (body.code !== 0 && body.code !== 200 && body.msg && body.msg !== "success") {
      throw new Error(body.data || body.msg || `Doris query failed with code ${body.code}`);
    }

    const payload = body.data || {};
    const meta = Array.isArray(payload.meta) ? payload.meta : [];
    const rows = Array.isArray(payload.data) ? payload.data : [];

    // Map meta to Livy UI schema format
    const fields = meta.map((m) => ({
      name: typeof m === "string" ? m : m.name || String(m),
      type: typeof m === "object" && m.type ? String(m.type).toLowerCase() : "string",
    }));

    const normalizedData = {
      "application/json": {
        schema: {
          fields,
        },
        data: rows,
      },
    };

    return {
      ok: true,
      data: normalizedData,
      elapsed,
      rowCount: rows.length,
      raw: body,
    };
  } catch (err) {
    if (axios.isCancel(err) || err.name === "CanceledError" || err.name === "AbortError") {
      throw new Error("Query cancelled by user");
    }
    const message =
      err.response?.data?.msg ||
      err.response?.data?.data ||
      err.response?.data?.error ||
      err.message ||
      "Doris query execution error";
    throw new Error(message);
  }
}

/**
 * Tests reachability of an Apache Doris FE instance.
 */
export async function testDorisConnection(config = {}) {
  try {
    const res = await executeDorisQuery({
      ...config,
      sql: "SELECT 1 AS is_alive",
      timeoutMs: 5000,
    });
    return { success: true, elapsed: res.elapsed };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Fetches databases from Doris
 */
export async function getDorisDatabases(config = {}) {
  const res = await executeDorisQuery({
    ...config,
    sql: "SHOW DATABASES",
  });
  const rows = res.data?.["application/json"]?.data || [];
  return rows.map((r) => String(r[0])).filter((n) => n && n !== "information_schema");
}

/**
 * Fetches tables from a database in Doris
 */
export async function getDorisTables(db, config = {}) {
  if (!db) return [];
  const res = await executeDorisQuery({
    ...config,
    sql: `SHOW TABLES FROM \`${db}\``,
  });
  const rows = res.data?.["application/json"]?.data || [];
  return rows.map((r) => String(r[0])).filter(Boolean);
}

/**
 * Fetches columns for a specific table in Doris
 */
export async function getDorisColumns(db, table, config = {}) {
  if (!db || !table) return [];
  const res = await executeDorisQuery({
    ...config,
    sql: `DESCRIBE \`${db}\`.\`${table}\``,
  });
  const rows = res.data?.["application/json"]?.data || [];
  return rows.map((r) => ({
    name: String(r[0] || ""),
    type: String(r[1] || "").toLowerCase(),
    null: String(r[2] || ""),
    key: String(r[3] || ""),
    default: r[4] !== undefined ? String(r[4]) : null,
    extra: String(r[5] || ""),
  })).filter((c) => c.name);
}
