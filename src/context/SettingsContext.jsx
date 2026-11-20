import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getItem, setItem } from "../utils/localStorage";

const SETTINGS_STORAGE_KEY = "livy-ui-user-settings";

export const DEFAULT_SETTINGS = {
  // Appearance & Theme
  "workbench.colorTheme": "dark",

  // Editor Preferences
  "editor.fontSize": 14,
  "editor.fontFamily": "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
  "editor.tabSize": 2,
  "editor.wordWrap": "on",
  "editor.lineNumbers": "on",
  "editor.minimap.enabled": true,
  "editor.autoSave": "off",
  "editor.cursorBlinking": "smooth",
  "editor.formatOnSave": false,
  "editor.renderWhitespace": "selection",
  "editor.acceptSuggestionOnEnter": "smart",
  "editor.sqlValidation.enabled": true,
  "editor.sqlValidation.dialect": "spark",

  // Spark & Compute Cluster Configurations
  "spark.defaultMaster": "local[*]",
  "spark.executor.memory": "2g",
  "spark.executor.cores": 2,
  "spark.driver.memory": "2g",
  "spark.sql.shuffle.partitions": 16,
  "spark.dynamicAllocation.enabled": "false",
  "spark.sql.warehouse.dir": "file:/opt/spark/warehouse",

  // Apache Doris Configurations
  "doris.defaultDatabase": "demo_db",
  "doris.queryTimeout": 45,
  "doris.defaultAiResource": "ollama_gemma2",
  "doris.enableProfile": false,

  // AI & Copilot Configuration (Zero Backend / Client-Side)
  "ai.provider": "ollama", // "ollama" | "gemini" | "openai" | "custom"
  "ai.agentMode": "action", // "action" (Code Mode with Review) | "ask" (Advisory / Q&A)
  "ai.hostUrl": "http://localhost:11434",
  "ai.defaultModel": "nemotron-3-nano:4b",
  "ai.geminiApiKey": "",
  "ai.geminiModel": "gemini-3.8-flash",
  "ai.openaiApiKey": "",
  "ai.openaiModel": "gpt-4o-mini",
  "ai.customUrl": "http://localhost:8000/v1",
  "ai.customApiKey": "",
  "ai.autoExecute": false,

  // Connection & Host Settings
  "livy.activeHostUrl": "http://localhost:8998",
  "livy.hosts": [
    {
      id: "default",
      name: "Local Livy Cluster",
      url: "http://localhost:8998",
    },
  ],

  // Execution & History Limits
  "query.historyLimit": 50,
  "query.autoFormatOnRun": false,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = getItem(SETTINGS_STORAGE_KEY, null);
    const version = getItem("livy-ui-settings-version", 1);
    if (saved && typeof saved === "object") {
      if (version < 2) {
        const migrated = { ...DEFAULT_SETTINGS, ...saved, "editor.minimap.enabled": true };
        setItem("livy-ui-settings-version", 2);
        setItem(SETTINGS_STORAGE_KEY, migrated);
        return migrated;
      }
      return { ...DEFAULT_SETTINGS, ...saved };
    }
    setItem("livy-ui-settings-version", 2);
    return DEFAULT_SETTINGS;
  });

  // Sync settings to localStorage whenever they change
  useEffect(() => {
    setItem(SETTINGS_STORAGE_KEY, settings);
  }, [settings]);

  // Update a single setting key
  const updateSetting = useCallback((key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update multiple settings at once (e.g. from JSON editor or bulk preset)
  const updateAllSettings = useCallback((newSettings) => {
    if (newSettings && typeof newSettings === "object" && !Array.isArray(newSettings)) {
      setSettings((prev) => ({
        ...prev,
        ...newSettings,
      }));
      return true;
    }
    return false;
  }, []);

  // Reset to default settings
  const resetToDefaults = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
  }, []);

  // Reset a single setting to its default value
  const resetSetting = useCallback((key) => {
    if (key in DEFAULT_SETTINGS) {
      setSettings((prev) => ({
        ...prev,
        [key]: DEFAULT_SETTINGS[key],
      }));
    }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateAllSettings,
        resetToDefaults,
        resetSetting,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return ctx;
}
