import { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { getItem, setItem, removeItem } from "../utils/localStorage";
import { STORAGE_KEYS, DEFAULT_HOST, SESSION_STATES } from "../utils/constants";
import * as livyApi from "../services/livyApi";

const LivyContext = createContext(null);

const initialState = {
  hosts: getItem(STORAGE_KEYS.HOSTS, [DEFAULT_HOST]),
  activeHostId: getItem(STORAGE_KEYS.ACTIVE_HOST, DEFAULT_HOST.id),
  sessionId: getItem(STORAGE_KEYS.SESSION_ID, null),
  sessionState: SESSION_STATES.NOT_STARTED,
  sessionConf: getItem(STORAGE_KEYS.SESSION_CONF, {}),
  sessionJars: getItem(STORAGE_KEYS.SESSION_JARS, []),
  sessions: [],
  sessionsLoading: false,
  appId: null,
  error: null,
  loading: false,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_HOSTS":
      return { ...state, hosts: action.payload };
    case "SET_ACTIVE_HOST":
      return { ...state, activeHostId: action.payload, sessionId: null, sessionState: SESSION_STATES.NOT_STARTED, appId: null, error: null };
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
    default:
      return state;
  }
}

export function LivyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist hosts
  useEffect(() => {
    setItem(STORAGE_KEYS.HOSTS, state.hosts);
  }, [state.hosts]);

  // Persist active host
  useEffect(() => {
    setItem(STORAGE_KEYS.ACTIVE_HOST, state.activeHostId);
  }, [state.activeHostId]);

  // Persist session id
  useEffect(() => {
    if (state.sessionId !== null) {
      setItem(STORAGE_KEYS.SESSION_ID, state.sessionId);
    } else {
      removeItem(STORAGE_KEYS.SESSION_ID);
    }
  }, [state.sessionId]);

  const activeHost = state.hosts.find((h) => h.id === state.activeHostId) || DEFAULT_HOST;

  // Add host
  const addHost = useCallback((host) => {
    const updated = [...state.hosts, host];
    setItem(STORAGE_KEYS.HOSTS, updated);
    dispatch({ type: "SET_HOSTS", payload: updated });
  }, [state.hosts]);

  // Remove host
  const removeHost = useCallback((hostId) => {
    if (hostId === DEFAULT_HOST.id) return;
    const updated = state.hosts.filter((h) => h.id !== hostId);
    setItem(STORAGE_KEYS.HOSTS, updated);
    dispatch({ type: "SET_HOSTS", payload: updated });
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

  // Select host
  const selectHost = useCallback((hostId) => {
    setItem(STORAGE_KEYS.ACTIVE_HOST, hostId);
    removeItem(STORAGE_KEYS.SESSION_ID);
    dispatch({ type: "SET_ACTIVE_HOST", payload: hostId });
  }, []);

  // Refresh session
  const refreshSession = useCallback(async () => {
    if (state.sessionId === null) return;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const session = await livyApi.getSession(state.sessionId);
      dispatch({ type: "SET_SESSION", payload: session });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
      dispatch({ type: "CLEAR_SESSION" });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.sessionId]);

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
    dispatch({ type: "SET_SESSIONS_LOADING", payload: true });
    try {
      const data = await livyApi.listSessions();
      const sqlSessions = (data.sessions || []).filter(
        (s) => s.kind === "sql" || s.kind === "spark"
      );
      dispatch({ type: "SET_SESSIONS", payload: sqlSessions });
    } catch (err) {
      console.error("Failed to fetch sessions:", err.message);
      dispatch({ type: "SET_SESSIONS", payload: [] });
    } finally {
      dispatch({ type: "SET_SESSIONS_LOADING", payload: false });
    }
  }, []);

  // Attach to an existing session
  const attachSession = useCallback(async (id) => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const session = await livyApi.getSession(id);
      dispatch({ type: "SET_SESSION", payload: session });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // Start session
  const startSession = useCallback(async (name = "") => {
    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });
    try {
      const session = await livyApi.createSession(state.sessionConf, name, state.sessionJars);
      dispatch({ type: "SET_SESSION", payload: session });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.sessionConf, state.sessionJars]);

  // Stop session
  const stopSession = useCallback(async () => {
    if (state.sessionId === null) return;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      await livyApi.deleteSession(state.sessionId);
      dispatch({ type: "CLEAR_SESSION" });
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: err.message });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [state.sessionId]);

  // Auto-refresh session state on mount if sessionId exists
  useEffect(() => {
    if (state.sessionId !== null) {
      refreshSession();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Poll session state while starting
  useEffect(() => {
    if (state.sessionState !== SESSION_STATES.STARTING) return;
    const interval = setInterval(async () => {
      try {
        const session = await livyApi.getSession(state.sessionId);
        dispatch({ type: "SET_SESSION", payload: session });
        if (session.state !== SESSION_STATES.STARTING) {
          clearInterval(interval);
        }
      } catch {
        clearInterval(interval);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [state.sessionState, state.sessionId]);

  const value = {
    ...state,
    activeHost,
    addHost,
    removeHost,
    updateHost,
    selectHost,
    startSession,
    stopSession,
    refreshSession,
    fetchSessions,
    attachSession,
    setSessionConf,
    setSessionJars,
    dispatch,
  };

  return <LivyContext.Provider value={value}>{children}</LivyContext.Provider>;
}

export function useLivy() {
  const ctx = useContext(LivyContext);
  if (!ctx) throw new Error("useLivy must be used within LivyProvider");
  return ctx;
}
