/**
 * Apache Doris SQL Keywords Specification
 * Includes SQL standard, MySQL compatibility keywords, and Doris-specific DDL/DML clauses.
 */

const RAW_DORIS_KEYWORDS = [
  /* =====================
     QUERY STRUCTURE
     ===================== */
  "SELECT",
  "DISTINCT",
  "FROM",
  "WHERE",
  "GROUP",
  "BY",
  "HAVING",
  "ORDER",
  "LIMIT",
  "OFFSET",
  "AS",
  "WITH",
  "RECURSIVE",

  /* =====================
     JOIN TYPES
     ===================== */
  "JOIN",
  "INNER",
  "LEFT",
  "RIGHT",
  "FULL",
  "OUTER",
  "CROSS",
  "SEMI",
  "ANTI",
  "ON",
  "USING",
  "STRAIGHT_JOIN",

  /* =====================
     SET OPERATIONS
     ===================== */
  "UNION",
  "UNION ALL",
  "INTERSECT",
  "EXCEPT",
  "MINUS",

  /* =====================
     CONDITIONAL LOGIC
     ===================== */
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "IF",
  "IFNULL",
  "NULLIF",
  "COALESCE",

  /* =====================
     OPERATORS & PREDICATES
     ===================== */
  "AND",
  "OR",
  "NOT",
  "IN",
  "BETWEEN",
  "LIKE",
  "REGEXP",
  "RLIKE",
  "IS",
  "NULL",
  "TRUE",
  "FALSE",
  "EXISTS",
  "ALL",
  "ANY",
  "SOME",
  "MATCH",
  "MATCH_ANY",
  "MATCH_ALL",
  "MATCH_PHRASE",

  /* =====================
     DORIS TABLE DATA MODELS
     ===================== */
  "DUPLICATE",
  "DUPLICATE KEY",
  "UNIQUE",
  "UNIQUE KEY",
  "AGGREGATE",
  "AGGREGATE KEY",
  "KEY",
  "PRIMARY KEY",

  /* =====================
     DISTRIBUTION & PARTITIONING
     ===================== */
  "DISTRIBUTED",
  "DISTRIBUTED BY",
  "HASH",
  "RANDOM",
  "BUCKETS",
  "AUTO",
  "PARTITION",
  "PARTITION BY",
  "RANGE",
  "LIST",
  "PARTITIONS",
  "VALUES",
  "LESS",
  "THAN",
  "MAXVALUE",
  "DYNAMIC",
  "DYNAMIC_PARTITION",

  /* =====================
     TABLE PROPERTIES & STORAGE
     ===================== */
  "PROPERTIES",
  "STORAGE",
  "POLICY",
  "REPLICATION_NUM",
  "STORAGE_POLICY",
  "COMPRESSION",
  "ENABLE_UNIQUE_KEY_MERGE_ON_WRITE",
  "IN_MEMORY",
  "AUTO_INCREMENT",
  "COMMENT",
  "DEFAULT",

  /* =====================
     INDEXING & ROLLUP
     ===================== */
  "INDEX",
  "INVERTED",
  "INVERTED INDEX",
  "BITMAP",
  "NGRAM_BF",
  "BLOOM_FILTER",
  "ROLLUP",
  "MATERIALIZED",
  "MATERIALIZED VIEW",
  "BUILD",
  "REFRESH",
  "COMPLETE",
  "DEFERRED",

  /* =====================
     RESOURCE & COMPUTE
     ===================== */
  "RESOURCE",
  "CREATE RESOURCE",
  "DROP RESOURCE",
  "ALTER RESOURCE",
  "SHOW RESOURCES",
  "WORKLOAD",
  "GROUP",
  "WORKLOAD GROUP",
  "COMPUTE",
  "CATALOG",
  "CREATE CATALOG",
  "DROP CATALOG",
  "SWITCH",

  /* =====================
     DDL / DML STATEMENTS
     ===================== */
  "CREATE",
  "ALTER",
  "DROP",
  "TRUNCATE",
  "TABLE",
  "DATABASE",
  "SCHEMA",
  "VIEW",
  "INSERT",
  "INTO",
  "OVERWRITE",
  "UPDATE",
  "DELETE",
  "LOAD",
  "ROUTINE",
  "ROUTINE LOAD",
  "STREAM",
  "PAUSE",
  "RESUME",
  "STOP",
  "SHOW",
  "DESC",
  "DESCRIBE",
  "EXPLAIN",
  "ADMIN",
  "CLEAN",
  "COMPACT",
  "CANCEL",

  /* =====================
     ADMIN & INTROSPECTION
     ===================== */
  "PROC",
  "SHOW PROC",
  "SHOW BACKENDS",
  "SHOW FRONTENDS",
  "SHOW TRASH",
  "SHOW REPLICA",
  "SHOW STATUS",
  "SHOW VARIABLES",
  "SHOW PROCESSLIST",
  "KILL",
  "SYNC",

  /* =====================
     WINDOW CLAUSES
     ===================== */
  "OVER",
  "PARTITION BY",
  "ORDER BY",
  "ROWS",
  "RANGE",
  "UNBOUNDED",
  "PRECEDING",
  "FOLLOWING",
  "CURRENT",
  "ROW",

  /* =====================
     COMMON SESSION SETTINGS
     ===================== */
  "SET",
  "default_ai_resource",
  "enable_profile",
  "parallel_pipeline_task_num",
  "exec_mem_limit",
  "query_timeout",
  "enable_vectorized_engine",
  "enable_nereids_planner",
  "enable_fallback_to_original_planner",
  "workload_group",
  "time_zone",
];

export const DORIS_SQL_KEYWORDS = Array.from(new Set(RAW_DORIS_KEYWORDS));
