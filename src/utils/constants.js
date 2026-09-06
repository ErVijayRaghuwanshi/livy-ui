export const DEFAULT_HOST = {
  id: "default",
  name: "docker-livy",
  url: "http://localhost:8998",
};

export const SESSION_KIND = "sql";

export const STORAGE_KEYS = {
  HOSTS: "livy-hosts",
  ACTIVE_HOST: "livy-active-host",
  SQL_FILES: "livy-sql-files",
  OPEN_FILES: "livy-open-files",
  ACTIVE_TAB: "livy-active-tab",
  SESSION_ID: "livy-session-id",
  SESSION_CONF: "livy-session-conf",
  SESSION_JARS: "livy-session-jars",
  PREVIEW_TAB: "livy-preview-tab",
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

export const COMMON_CONF_KEYS = [
  "spark.sql.warehouse.dir",
  "spark.sql.extensions",
  "spark.hadoop.hive.metastore.uris",
  "spark.executor.memory",
  "spark.executor.cores",
  "spark.driver.memory",
  "spark.dynamicAllocation.enabled",
  "spark.sql.shuffle.partitions",
  "livy.rsc.sql.num-rows",
  "spark.eventLog.enabled",
  "spark.eventLog.dir",
  "spark.master",
  "spark.sql.catalog.spark_catalog",
  "spark.databricks.delta.schema.autoMerge.enabled",
  "spark.sql.catalogImplementation",
  "spark.serializer",
  "spark.driver.extraJavaOptions",
  "spark.executor.extraJavaOptions"
];

export const SPARK_PRESETS = [
  {
    name: "Standard Local Mode",
    description: "Standard local development setup suitable for single node machines",
    conf: {
      "spark.master": "local[*]",
      "spark.sql.shuffle.partitions": "4",
      "spark.driver.memory": "1g",
      "spark.executor.memory": "1g"
    }
  },
  {
    name: "Medium Performance",
    description: "Optimized for processing medium-sized local files and datasets",
    conf: {
      "spark.driver.memory": "2g",
      "spark.executor.memory": "2g",
      "spark.executor.cores": "2",
      "spark.sql.shuffle.partitions": "16",
      "spark.dynamicAllocation.enabled": "false"
    }
  },
  {
    name: "Hive Warehouse Enabled",
    description: "Connect to external Hive Metastores for centralized catalog management",
    conf: {
      "spark.sql.warehouse.dir": "hdfs:///user/hive/warehouse",
      "spark.hadoop.hive.metastore.uris": "thrift://localhost:9083",
      "spark.sql.catalogImplementation": "hive"
    }
  },
  {
    name: "Delta Lake Optimized",
    description: "Enable full Delta Lake table operations and schema enforcement features",
    conf: {
      "spark.sql.extensions": "io.delta.sql.DeltaSparkSessionExtension",
      "spark.sql.catalog.spark_catalog": "org.apache.spark.sql.delta.catalog.DeltaCatalog",
      "spark.databricks.delta.schema.autoMerge.enabled": "true"
    }
  }
];
