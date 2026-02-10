export const DEFAULT_HOST = {
  id: "default",
  name: "Localhost",
  url: "http://localhost:8998",
};

export const SESSION_KIND = "sql";

export const STORAGE_KEYS = {
  HOSTS: "livy-hosts",
  ACTIVE_HOST: "livy-active-host",
  SQL_FILES: "livy-sql-files",
  ACTIVE_TAB: "livy-active-tab",
  SESSION_ID: "livy-session-id",
};

export const SESSION_STATES = {
  NOT_STARTED: "not_started",
  STARTING: "starting",
  IDLE: "idle",
  BUSY: "busy",
  SHUTTING_DOWN: "shutting_down",
  ERROR: "error",
  DEAD: "dead",
  KILLED: "killed",
  SUCCESS: "success",
};

export const STATEMENT_STATES = {
  WAITING: "waiting",
  RUNNING: "running",
  AVAILABLE: "available",
  ERROR: "error",
  CANCELLING: "cancelling",
  CANCELLED: "cancelled",
};

export const POLL_INTERVAL_MS = 1000;
