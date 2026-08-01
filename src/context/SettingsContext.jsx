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
  "editor.minimap.enabled": false,
  "editor.autoSave": "off",
  "editor.cursorBlinking": "smooth",
  "editor.formatOnSave": false,
  "editor.renderWhitespace": "selection",

  // Spark & Compute Cluster Configurations
  "spark.defaultMaster": "local[*]",
  "spark.executor.memory": "2g",
  "spark.executor.cores": 2,
  "spark.driver.memory": "2g",
  "spark.sql.shuffle.partitions": 16,
  "spark.dynamicAllocation.enabled": "false",
  "spark.sql.warehouse.dir": "file:/opt/spark/warehouse",

  // Connection & Host Settings
  "livy.activeHostUrl": "http://localhost:8998",

  // Execution & History Limits
  "query.historyLimit": 50,
  "query.autoFormatOnRun": false,
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    const saved = getItem(SETTINGS_STORAGE_KEY, null);
    if (saved && typeof saved === "object") {
      return { ...DEFAULT_SETTINGS, ...saved };
    }
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

  return (
    <SettingsContext.Provider
      value={{
        settings,
        updateSetting,
        updateAllSettings,
        resetToDefaults,
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
