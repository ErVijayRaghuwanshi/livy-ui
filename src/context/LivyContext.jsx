import { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { getItem, setItem, removeItem } from "../utils/localStorage";
import { STORAGE_KEYS, DEFAULT_HOST, DEFAULT_DORIS_HOST, SESSION_STATES, DATA_SOURCE_TYPES } from "../utils/constants";
import { useSettings } from "./SettingsContext";
import * as livyApi from "../services/livyApi";
import { testDorisConnection } from "../services/dorisApi";

const LivyContext = createContext(null);

const rawSavedHosts = getItem(STORAGE_KEYS.HOSTS, [DEFAULT_HOST, DEFAULT_DORIS_HOST]);
let normalizedInitialHosts = (Array.isArray(rawSavedHosts) ? rawSavedHosts : [DEFAULT_HOST, DEFAULT_DORIS_HOST]).map((h) => ({
  ...h,
  type: h.type || DATA_SOURCE_TYPES.SPARK,
}));

if (!normalizedInitialHosts.some((h) => h.type === DATA_SOURCE_TYPES.DORIS)) {
  normalizedInitialHosts.push(DEFAULT_DORIS_HOST);
}

const savedActiveHostId = getItem(STORAGE_KEYS.ACTIVE_HOST, DEFAULT_HOST.id);
const initialActiveHost = normalizedInitialHosts.find((h) => h.id === savedActiveHostId) || DEFAULT_HOST;
const isInitialDoris = initialActiveHost.type === DATA_SOURCE_TYPES.DORIS || initialActiveHost.engine === "doris";

const savedHostSessions = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
const initialSessionId = isInitialDoris
  ? null
  : (savedHostSessions[savedActiveHostId] ?? getItem(STORAGE_KEYS.SESSION_ID, null));

const initialState = {
  hosts: normalizedInitialHosts,
  activeHostId: savedActiveHostId,
  sessionId: initialSessionId,
  sessionState: isInitialDoris
    ? SESSION_STATES.IDLE
    : (initialSessionId !== null ? SESSION_STATES.IDLE : SESSION_STATES.NOT_STARTED),
  sessionConf: getItem(STORAGE_KEYS.SESSION_CONF, {}),
  sessionJars: getItem(STORAGE_KEYS.SESSION_JARS, []),
  sessions: [],
  sessionsLoading: false,
  appId: null,
  error: null,
  loading: false,
  isOnline: typeof window !== "undefined" ? window.navigator.onLine : true,
  isServerReachable: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_HOSTS":
      return { ...state, hosts: action.payload };
    case "SET_ACTIVE_HOST": {
      const hostId = typeof action.payload === "object" ? action.payload.hostId : action.payload;
      const host = state.hosts.find((h) => h.id === hostId);
      const isDorisHost = host && (host.type === DATA_SOURCE_TYPES.DORIS || host.engine === "doris");

      let recalledSessionId = null;
      if (!isDorisHost) {
        if (action.payload && typeof action.payload === "object" && action.payload.sessionId !== undefined) {
          recalledSessionId = action.payload.sessionId;
        } else {
          const map = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
          recalledSessionId = map[hostId] ?? getItem(STORAGE_KEYS.SESSION_ID, null) ?? getItem("livy-last-spark-session", null);
        }
      }

      return {
        ...state,
        activeHostId: hostId,
        sessionId: recalledSessionId,
        sessionState: isDorisHost
          ? SESSION_STATES.IDLE
          : (recalledSessionId !== null ? SESSION_STATES.IDLE : SESSION_STATES.NOT_STARTED),
        isServerReachable: null,
        appId: null,
        error: null,
      };
    }
    case "SET_SESSION_CONF":
      return { ...state, sessionConf: action.payload };
    case "SET_SESSION_JARS":
      return { ...state, sessionJars: action.payload };
    case "SET_SESSION":
      return { ...state, sessionId: action.payload.id, sessionState: action.payload.state, appId: action.payload.appId || null, sessionName: action.payload.name || null, error: null };
    case "SET_SESSION_STATE":
      return { ...state, sessionState: action.payload };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "CLEAR_SESSION":
      return { ...state, sessionId: null, sessionState: SESSION_STATES.NOT_STARTED, appId: null, sessionName: null, error: null };
    case "SET_SESSIONS":
      return { ...state, sessions: action.payload };
    case "SET_SESSIONS_LOADING":
      return { ...state, sessionsLoading: action.payload };
    case "SET_ONLINE":
      return { ...state, isOnline: action.payload };
    case "SET_SERVER_REACHABLE":
      return { ...state, isServerReachable: action.payload };
    default:
      return state;
  }
}

export function LivyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { settings, updateSetting } = useSettings();

  const activeHost = state.hosts.find((h) => h.id === state.activeHostId) || DEFAULT_HOST;
  const isDoris = activeHost.type === DATA_SOURCE_TYPES.DORIS || activeHost.engine === "doris";
  const isSpark = !isDoris;

  // Persist hosts
  useEffect(() => {
    setItem(STORAGE_KEYS.HOSTS, state.hosts);
  }, [state.hosts]);

  // Persist active host
  useEffect(() => {
    setItem(STORAGE_KEYS.ACTIVE_HOST, state.activeHostId);
  }, [state.activeHostId]);

  // Persist session id per host and globally for Spark
  useEffect(() => {
    if (isDoris) return; // Doris compute does not alter or erase Spark session memory

    if (state.sessionId !== null && state.sessionId !== undefined) {
      const savedMap = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
      savedMap[state.activeHostId] = state.sessionId;
      setItem(STORAGE_KEYS.HOST_SESSIONS, savedMap);
      setItem(STORAGE_KEYS.SESSION_ID, state.sessionId);
      setItem("livy-last-spark-session", state.sessionId);
    }
  }, [state.sessionId, state.activeHostId, isDoris]);

  // Add host
  const addHost = useCallback((host) => {
    const normalized = {
      ...host,
      type: host.type || (host.engine === "doris" ? DATA_SOURCE_TYPES.DORIS : DATA_SOURCE_TYPES.SPARK),
    };
    const updated = [...state.hosts, normalized];
    setItem(STORAGE_KEYS.HOSTS, updated);
    dispatch({ type: "SET_HOSTS", payload: updated });
  }, [state.hosts]);

  // Remove host
  const removeHost = useCallback((hostId) => {
    if (hostId === DEFAULT_HOST.id) return;
    const updated = state.hosts.filter((h) => h.id !== hostId);
    setItem(STORAGE_KEYS.HOSTS, updated);
    dispatch({ type: "SET_HOSTS", payload: updated });

    const savedMap = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
    if (savedMap[hostId] !== undefined) {
      delete savedMap[hostId];
      setItem(STORAGE_KEYS.HOST_SESSIONS, savedMap);
    }

    if (state.activeHostId === hostId) {
      setItem(STORAGE_KEYS.ACTIVE_HOST, DEFAULT_HOST.id);
      dispatch({ type: "SET_ACTIVE_HOST", payload: DEFAULT_HOST.id });
    }
  }, [state.hosts, state.activeHostId]);

  // Update host
  const updateHost = useCallback((hostId, updates) => {
    const updated = state.hosts.map((h) => (h.id === hostId ? { ...h, ...updates } : h));
    setItem(STORAGE_KEYS.HOSTS, updated);
    dispatch({ type: "SET_HOSTS", payload: updated });
  }, [state.hosts]);

  // Select host and automatically attach compute for Doris or recall session for Spark
  const selectHost = useCallback((hostId) => {
    const targetHost = state.hosts.find((h) => h.id === hostId);
    const isDorisHost = targetHost && (targetHost.type === DATA_SOURCE_TYPES.DORIS || targetHost.engine === "doris");

    setItem(STORAGE_KEYS.ACTIVE_HOST, hostId);
    if (isDorisHost) {
      setItem("livy-last-doris-host", hostId);
    } else {
      setItem("livy-last-spark-host", hostId);
    }

    const savedHostSessions = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
    const recalledSessionId = isDorisHost
      ? null
      : (savedHostSessions[hostId] ?? getItem(STORAGE_KEYS.SESSION_ID, null) ?? getItem("livy-last-spark-session", null));

    dispatch({
      type: "SET_ACTIVE_HOST",
      payload: { hostId, sessionId: recalledSessionId },
    });

    if (isDorisHost) {
      dispatch({ type: "SET_SESSION_STATE", payload: SESSION_STATES.IDLE });
    }
  }, [state.hosts]);

  // Switch engine restoring the last active host for that engine
  const switchEngine = useCallback((targetEngine) => {
    if (targetEngine === "doris") {
      const savedDorisId = getItem("livy-last-doris-host", null);
      const targetHost = (savedDorisId && state.hosts.find(h => h.id === savedDorisId))
        || state.hosts.find(h => h.type === DATA_SOURCE_TYPES.DORIS || h.engine === "doris");
      if (targetHost) {
        selectHost(targetHost.id);
        return targetHost;
      }
    } else {
      const savedSparkId = getItem("livy-last-spark-host", null);
      const targetHost = (savedSparkId && state.hosts.find(h => h.id === savedSparkId))
        || state.hosts.find(h => h.type === DATA_SOURCE_TYPES.SPARK || h.engine === "spark");
      if (targetHost) {
        selectHost(targetHost.id);
        return targetHost;
      }
    }
    return null;
  }, [state.hosts, selectHost]);

  // Server Reachability Checker
  const checkServerReachability = useCallback(async () => {
    const currentHost = state.hosts.find((h) => h.id === state.activeHostId) || DEFAULT_HOST;
    const isDorisHost = currentHost.type === DATA_SOURCE_TYPES.DORIS || currentHost.engine === "doris";
    const isLocalhost = currentHost.url.includes("localhost") || currentHost.url.includes("127.0.0.1");
    if (typeof window !== "undefined" && !window.navigator.onLine && !isLocalhost) {
      dispatch({ type: "SET_SERVER_REACHABLE", payload: false });
      return false;
    }
    try {
      if (isDorisHost) {
        const res = await testDorisConnection(currentHost);
        dispatch({ type: "SET_SERVER_REACHABLE", payload: res.success });
        if (res.success) {
          dispatch({ type: "SET_SESSION_STATE", payload: SESSION_STATES.IDLE });
        } else {
          dispatch({ type: "SET_SESSION_STATE", payload: SESSION_STATES.ERROR });
        }
        return res.success;
      } else {
        const data = await livyApi.listSessions();
        const sessionList = Array.isArray(data.sessions) ? data.sessions : [];
        dispatch({ type: "SET_SESSIONS", payload: sessionList });
        dispatch({ type: "SET_SERVER_REACHABLE", payload: true });
        return true;
      }
    } catch (err) {
      console.warn("Data source reachability check failed:", err.message);
      dispatch({ type: "SET_SERVER_REACHABLE", payload: false });
      return false;
    }
  }, [state.hosts, state.activeHostId]);

  // Refresh session
  const refreshSession = useCallback(async (targetSessionId = null) => {
    const currentHost = state.hosts.find((h) => h.id === state.activeHostId) || DEFAULT_HOST;
    if (currentHost.type === DATA_SOURCE_TYPES.DORIS || currentHost.engine === "doris") {
      dispatch({ type: "SET_SESSION_STATE", payload: SESSION_STATES.IDLE });
      dispatch({ type: "SET_SERVER_REACHABLE", payload: true });
      return;
    }
    const sid = targetSessionId !== null ? targetSessionId : state.sessionId;
    if (sid === null) return;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const session = await livyApi.getSession(sid);
      dispatch({ type: "SET_SESSION", payload: session });
      dispatch({ type: "SET_SERVER_REACHABLE", payload: true });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      if (err.response && err.response.status === 404) {
        dispatch({ type: "CLEAR_SESSION" });
      }
      if (!err.response && (err.message.includes("Network Error") || err.message.includes("ECONNREFUSED") || err.code === "ERR_NETWORK")) {
        dispatch({ type: "SET_SERVER_REACHABLE", payload: false });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.hosts, state.activeHostId, state.sessionId]);

  // Persist session conf
  useEffect(() => {
    setItem(STORAGE_KEYS.SESSION_CONF, state.sessionConf);
  }, [state.sessionConf]);

  // Persist session jars
  useEffect(() => {
    setItem(STORAGE_KEYS.SESSION_JARS, state.sessionJars);
  }, [state.sessionJars]);

  const setSessionConf = useCallback((conf) => {
    dispatch({ type: "SET_SESSION_CONF", payload: conf });
  }, []);

  const setSessionJars = useCallback((jars) => {
    dispatch({ type: "SET_SESSION_JARS", payload: jars });
  }, []);

  // Fetch all sessions for current host
  const fetchSessions = useCallback(async () => {
    const currentHost = state.hosts.find((h) => h.id === state.activeHostId) || DEFAULT_HOST;
    const isDorisHost = currentHost.type === DATA_SOURCE_TYPES.DORIS || currentHost.engine === "doris";
    if (isDorisHost) {
      dispatch({ type: "SET_SESSIONS", payload: [] });
      dispatch({ type: "SET_SESSIONS_LOADING", payload: false });
      return;
    }
    dispatch({ type: "SET_SESSIONS_LOADING", payload: true });
    try {
      const data = await livyApi.listSessions();
      const sessionList = Array.isArray(data.sessions) ? data.sessions : [];
      dispatch({ type: "SET_SESSIONS", payload: sessionList });
      dispatch({ type: "SET_SERVER_REACHABLE", payload: true });

      // Automatically recall and attach the remembered session if it exists on Livy
      const savedMap = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
      const targetSid =
        savedMap[currentHost.id] ??
        getItem(STORAGE_KEYS.SESSION_ID, null) ??
        getItem("livy-last-spark-session", null) ??
        state.sessionId;

      if (targetSid !== null && targetSid !== undefined) {
        const matched = sessionList.find(
          (s) => Number(s.id) === Number(targetSid) || String(s.id) === String(targetSid)
        );
        if (matched) {
          dispatch({ type: "SET_SESSION", payload: matched });
        } else if (sessionList.length > 0) {
          // If remembered session is gone, attach to latest live session on Livy
          const activeSessions = sessionList.filter(
            (s) => s.state === "idle" || s.state === "busy" || s.state === "starting"
          );
          const fallback = activeSessions[activeSessions.length - 1] || sessionList[sessionList.length - 1];
          if (fallback) {
            dispatch({ type: "SET_SESSION", payload: fallback });
          }
        }
      } else if (sessionList.length > 0) {
        // No session remembered, but Livy has live sessions: attach to latest
        const activeSessions = sessionList.filter(
          (s) => s.state === "idle" || s.state === "busy" || s.state === "starting"
        );
        const fallback = activeSessions[activeSessions.length - 1] || sessionList[sessionList.length - 1];
        if (fallback) {
          dispatch({ type: "SET_SESSION", payload: fallback });
        }
      }
    } catch (err) {
      console.error("Failed to fetch sessions:", err.message);
      dispatch({ type: "SET_SESSIONS", payload: [] });
      if (!err.response && (err.message.includes("Network Error") || err.message.includes("ECONNREFUSED") || err.code === "ERR_NETWORK")) {
        dispatch({ type: "SET_SERVER_REACHABLE", payload: false });
      }
    } finally {
      dispatch({ type: "SET_SESSIONS_LOADING", payload: false });
    }
  }, [state.hosts, state.activeHostId, state.sessionId]);

  // Attach to an existing session
  const attachSession = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const session = await livyApi.getSession(id);
      dispatch({ type: "SET_SESSION", payload: session });

      // Synchronously persist attached session
      const savedMap = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
      savedMap[state.activeHostId] = session.id;
      setItem(STORAGE_KEYS.HOST_SESSIONS, savedMap);
      setItem(STORAGE_KEYS.SESSION_ID, session.id);
      setItem("livy-last-spark-session", session.id);

      dispatch({ type: "SET_SERVER_REACHABLE", payload: true });
      fetchSessions();
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      if (err.response?.status === 404) {
        fetchSessions(); // Prune dead sessions from list
      }
      if (!err.response && (err.message.includes("Network Error") || err.message.includes("ECONNREFUSED") || err.code === "ERR_NETWORK")) {
        dispatch({ type: "SET_SERVER_REACHABLE", payload: false });
      }
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.activeHostId, fetchSessions]);

  // Start session
  const startSession = useCallback(async (name = "", kind = "sql", customConf = null, customJars = null) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const confToUse = customConf !== null ? customConf : state.sessionConf;
      const jarsToUse = customJars !== null ? customJars : state.sessionJars;
      const session = await livyApi.createSession(confToUse, name, jarsToUse, kind);
      dispatch({ type: "SET_SESSION", payload: session });

      // Synchronously persist newly started session
      const savedMap = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
      savedMap[state.activeHostId] = session.id;
      setItem(STORAGE_KEYS.HOST_SESSIONS, savedMap);
      setItem(STORAGE_KEYS.SESSION_ID, session.id);
      setItem("livy-last-spark-session", session.id);

      dispatch({ type: "SET_SERVER_REACHABLE", payload: true });
      await fetchSessions();
      return session;
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      if (!err.response && (err.message.includes("Network Error") || err.message.includes("ECONNREFUSED") || err.code === "ERR_NETWORK")) {
        dispatch({ type: "SET_SERVER_REACHABLE", payload: false });
      }
      throw err;
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.sessionConf, state.sessionJars, state.activeHostId, fetchSessions]);

  // Stop session
  const stopSession = useCallback(async () => {
    if (state.sessionId === null) return;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await livyApi.deleteSession(state.sessionId);
      dispatch({ type: "CLEAR_SESSION" });

      const savedMap = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
      delete savedMap[state.activeHostId];
      setItem(STORAGE_KEYS.HOST_SESSIONS, savedMap);
      removeItem(STORAGE_KEYS.SESSION_ID);
      removeItem("livy-last-spark-session");

      dispatch({ type: "SET_SERVER_REACHABLE", payload: true });
      fetchSessions();
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      dispatch({ type: "SET_SERVER_REACHABLE", payload: false });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.sessionId, state.activeHostId, fetchSessions]);

  // Network offline/online listeners & periodic checker
  useEffect(() => {
    const handleOnline = () => {
      dispatch({ type: "SET_ONLINE", payload: true });
      checkServerReachability();
    };
    const handleOffline = () => {
      dispatch({ type: "SET_ONLINE", payload: false });
      dispatch({ type: "SET_SERVER_REACHABLE", payload: false });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("online", handleOnline);
      window.addEventListener("offline", handleOffline);
    }

    // Initial ping
    checkServerReachability();

    // Setup periodic polling for reachability (every 15 seconds)
    const interval = setInterval(() => {
      checkServerReachability();
    }, 15000);

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("online", handleOnline);
        window.removeEventListener("offline", handleOffline);
      }
      clearInterval(interval);
    };
  }, [checkServerReachability]);

  // Re-check reachability, fetch sessions, and verify recalled session when active host changes
  useEffect(() => {
    checkServerReachability();
    fetchSessions();
    if (!isDoris && state.sessionId !== null) {
      refreshSession(state.sessionId);
    }
  }, [state.activeHostId, isDoris]); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-refresh session state on mount if sessionId exists
  useEffect(() => {
    if (state.sessionId !== null) {
      refreshSession(state.sessionId);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll session state while starting or busy to quickly recover to idle as soon as statements finish
  useEffect(() => {
    if (isDoris || state.sessionId === null) return;
    if (state.sessionState !== SESSION_STATES.STARTING && state.sessionState !== SESSION_STATES.BUSY) return;

    const interval = setInterval(async () => {
      try {
        const session = await livyApi.getSession(state.sessionId);
        dispatch({ type: "SET_SESSION", payload: session });
        if (session.state !== SESSION_STATES.STARTING && session.state !== SESSION_STATES.BUSY) {
          clearInterval(interval);
          fetchSessions();
        }
      } catch {
        clearInterval(interval);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [state.sessionState, state.sessionId, isDoris, fetchSessions]);

  // Kill any session by ID
  const killSession = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await livyApi.deleteSession(id);
      if (Number(state.sessionId) === Number(id) || String(state.sessionId) === String(id)) {
        dispatch({ type: "CLEAR_SESSION" });
        const savedMap = getItem(STORAGE_KEYS.HOST_SESSIONS, {});
        delete savedMap[state.activeHostId];
        setItem(STORAGE_KEYS.HOST_SESSIONS, savedMap);
        removeItem(STORAGE_KEYS.SESSION_ID);
        removeItem("livy-last-spark-session");
      }
      dispatch({ type: "SET_SERVER_REACHABLE", payload: true });
      fetchSessions();
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.sessionId, state.activeHostId, fetchSessions]);

  const value = {
    ...state,
    activeHost,
    isDoris,
    isSpark,
    dataSourceType: activeHost.type || DATA_SOURCE_TYPES.SPARK,
    addHost,
    removeHost,
    updateHost,
    selectHost,
    switchEngine,
    startSession,
    stopSession,
    killSession,
    refreshSession,
    fetchSessions,
    attachSession,
    setSessionConf,
    setSessionJars,
    checkServerReachability,
    dispatch,
  };

  return <LivyContext.Provider value={value}>{children}</LivyContext.Provider>;
}

export function useLivy() {
  const ctx = useContext(LivyContext);
  if (!ctx) throw new Error("useLivy must be used within LivyProvider");
  return ctx;
}
