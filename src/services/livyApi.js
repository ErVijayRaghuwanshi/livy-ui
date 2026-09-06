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
  const body = { kind: kind || SESSION_KIND || "sql" };
  if (name && String(name).trim()) {
    body.name = String(name).trim();
  }
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
  if (Object.keys(cleanConf).length > 0) {
    body.conf = cleanConf;
  }
  const cleanJars = Array.isArray(jars)
    ? jars.map((jar) => String(jar).trim()).filter(Boolean)
    : [];
  if (cleanJars.length > 0) {
    body.jars = cleanJars;
  }

  try {
    const { data } = await client.post("/sessions", body);
    return data;
  } catch (err) {
    // If Spark Connect / livy-next rejected a static config that cannot be modified after cluster startup,
    // automatically strip static configs and retry once.
    if (
      body.conf &&
      (err.message.includes("CANNOT_MODIFY_CONFIG") ||
       err.message.includes("CANNOT_MODIFY_STATIC_CONFIG"))
    ) {
      console.warn("Retrying session creation without static Spark configs:", err.message);
      const staticKeys = [
        "spark.executor.memory",
        "spark.driver.memory",
        "spark.executor.cores",
        "spark.dynamicAllocation.enabled",
        "spark.sql.warehouse.dir",
      ];
      const dynamicConf = {};
      for (const [k, v] of Object.entries(body.conf)) {
        if (!staticKeys.includes(k) && !err.message.includes(`"${k}"`)) {
          dynamicConf[k] = v;
        }
      }
      const retryBody = { ...body };
      if (Object.keys(dynamicConf).length > 0) {
        retryBody.conf = dynamicConf;
      } else {
        delete retryBody.conf;
      }
      const { data } = await client.post("/sessions", retryBody);
      return data;
    }
    throw err;
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

export async function runSql(sessionId, sql) {
  const stmt = await submitStatement(sessionId, sql);
  const pollInterval = 500;
  while (true) {
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
