import { createLivyClient } from "./axiosConfig";
import { SESSION_KIND } from "../utils/constants";

function getClient() {
  return createLivyClient();
}

export async function listSessions() {
  const client = getClient();
  const { data } = await client.get("/sessions");
  return data;
}

export async function createSession(conf = {}, name = "", jars = [], kind = "sql") {
  const client = getClient();
  const baseKind = kind || SESSION_KIND || "sql";
  const cleanJars = Array.isArray(jars)
    ? jars.map((jar) => String(jar).trim()).filter(Boolean)
    : [];

  const cleanConf = {};
  if (conf && typeof conf === "object") {
    for (const [k, v] of Object.entries(conf)) {
      const trimmedK = String(k).trim();
      const trimmedV = v !== undefined && v !== null ? String(v).trim() : "";
      if (trimmedK && trimmedV) {
        cleanConf[trimmedK] = trimmedV;
      }
    }
  }

  // Known static or driver-level configs that cannot be set dynamically on a running Spark Connect cluster
  const knownStaticPrefixesOrKeys = [
    "spark.executor.",
    "spark.driver.",
    "spark.master",
    "spark.dynamicAllocation.",
    "spark.sql.warehouse.dir",
    "spark.sql.extensions",
    "spark.sql.catalogImplementation",
    "spark.eventLog.",
  ];

  let currentConf = Object.keys(cleanConf).length > 0 ? { ...cleanConf } : undefined;
  let attempts = 0;
  const maxAttempts = 6;

  while (attempts < maxAttempts) {
    attempts++;
    const body = { kind: baseKind };
    if (name && String(name).trim()) {
      body.name = String(name).trim();
    }
    if (currentConf && Object.keys(currentConf).length > 0) {
      body.conf = currentConf;
    }
    if (cleanJars.length > 0) {
      body.jars = cleanJars;
    }

    try {
      const { data } = await client.post("/sessions", body);
      return data;
    } catch (err) {
      const isConfigError =
        currentConf &&
        (err.message.includes("CANNOT_MODIFY_CONFIG") ||
         err.message.includes("CANNOT_MODIFY_STATIC_CONFIG") ||
         err.message.includes("failed to set config"));

      if (isConfigError && attempts < maxAttempts) {
        // 1. Try to extract the specific key from the error message
        const match =
          err.message.match(/failed to set config\s+([a-zA-Z0-9_.-]+)/i) ||
          err.message.match(/["'`](spark\.[^"'`]+)["'`]/i);
        const offendingKey = match ? match[1] : null;

        console.warn(`[Livy createSession] Config rejected by server: ${offendingKey || err.message}`);

        if (offendingKey && currentConf[offendingKey]) {
          delete currentConf[offendingKey];
        }

        // Also proactively strip all known static configs to minimize failed round-trips
        for (const k of Object.keys(currentConf)) {
          if (knownStaticPrefixesOrKeys.some((prefix) => k.startsWith(prefix) || k === prefix)) {
            delete currentConf[k];
          }
        }

        if (Object.keys(currentConf).length === 0) {
          currentConf = undefined;
        }

        continue;
      }

      // If not a config modification error or attempts exhausted, rethrow
      throw err;
    }
  }
}

export async function getSession(sessionId) {
  const client = getClient();
  const { data } = await client.get(`/sessions/${sessionId}`);
  return data;
}

export async function deleteSession(sessionId) {
  const client = getClient();
  const { data } = await client.delete(`/sessions/${sessionId}`);
  return data;
}

export async function submitStatement(sessionId, code) {
  const client = getClient();
  const { data } = await client.post(`/sessions/${sessionId}/statements`, {
    code,
  });
  return data;
}

export async function getStatement(sessionId, statementId) {
  const client = getClient();
  const { data } = await client.get(
    `/sessions/${sessionId}/statements/${statementId}`
  );
  return data;
}

export async function cancelStatement(sessionId, statementId) {
  const client = getClient();
  const { data } = await client.post(
    `/sessions/${sessionId}/statements/${statementId}/cancel`
  );
  return data;
}

export async function runSql(sessionId, sql, timeoutMs = 45000) {
  const stmt = await submitStatement(sessionId, sql);
  const pollInterval = 500;
  const startTime = Date.now();
  while (true) {
    if (Date.now() - startTime > timeoutMs) {
      try {
        await cancelStatement(sessionId, stmt.id);
      } catch {}
      throw new Error(`SQL query timed out after ${Math.round(timeoutMs / 1000)}s`);
    }
    const result = await getStatement(sessionId, stmt.id);
    if (result.state === "available") {
      const output = result.output;
      if (output.status === "ok") {
        const json = output.data["application/json"];
        if (json && json.schema && json.data) {
          return json.data.map((row) => {
            const obj = {};
            json.schema.fields.forEach((f, i) => {
              obj[f.name] = Array.isArray(row) ? row[i] : row[f.name];
            });
            return obj;
          });
        }
        const text = output.data["text/plain"];
        return text ? [{ result: text }] : [];
      }
      throw new Error(output.evalue || "SQL error");
    }
    if (result.state === "error" || result.state === "cancelled") {
      throw new Error(result.output?.evalue || `Statement ${result.state}`);
    }
    await new Promise((r) => setTimeout(r, pollInterval));
  }
}
