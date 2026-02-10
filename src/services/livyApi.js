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

export async function createSession(conf = {}) {
  const client = getClient();
  const body = { kind: SESSION_KIND };
  const cleanConf = Object.fromEntries(
    Object.entries(conf).filter(([k, v]) => k.trim() && v.trim())
  );
  if (Object.keys(cleanConf).length > 0) {
    body.conf = cleanConf;
  }
  const { data } = await client.post("/sessions", body);
  return data;
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
