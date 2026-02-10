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

export async function createSession() {
  const client = getClient();
  const { data } = await client.post("/sessions", { kind: SESSION_KIND });
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
