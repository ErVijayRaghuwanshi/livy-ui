const RAW_KEYWORDS = [
  /* =====================
     QUERY STRUCTURE
     ===================== */
  'SELECT',
  'DISTINCT',
  'FROM',
  'WHERE',
  'GROUP',
  'BY',
  'HAVING',
  'ORDER',
  'LIMIT',
  'OFFSET',
  'FETCH',
  'TOP',

  /* =====================
     JOIN TYPES
     ===================== */
  'JOIN',
  'INNER',
  'LEFT',
  'RIGHT',
  'FULL',
  'OUTER',
  'CROSS',
  'SEMI',
  'ANTI',
  'NATURAL',
  'ON',
  'USING',

  /* =====================
     SET OPERATIONS
     ===================== */
  'UNION',
  'UNION ALL',
  'INTERSECT',
  'EXCEPT',
  'MINUS',

  /* =====================
     CONDITIONAL LOGIC
     ===================== */
  'CASE',
  'WHEN',
  'THEN',
  'ELSE',
  'END',
  'IF',

  /* =====================
     PREDICATES
     ===================== */
  'AND',
  'OR',
  'NOT',
  'IN',
  'EXISTS',
  'BETWEEN',
  'LIKE',
  'RLIKE',
  'REGEXP',
  'IS',
  'NULL',
  'TRUE',
  'FALSE',

  /* =====================
     WINDOW / ANALYTICS
     ===================== */
  'OVER',
  'PARTITION',
  'ROWS',
  'RANGE',
  'UNBOUNDED',
  'PRECEDING',
  'FOLLOWING',
  'CURRENT',
  'ROW',

  /* =====================
     CTE / SUBQUERIES
     ===================== */
  'WITH',
  'RECURSIVE',

  /* =====================
     DDL
     ===================== */
  'CREATE',
  'ALTER',
  'DROP',
  'TRUNCATE',
  'COMMENT',
  'RENAME',
  'DESCRIBE',
  'USE',
  'ADD',
  'TYPE',
  'LIKE',

  /* =====================
     DDL OBJECTS
     ===================== */
  'DATABASE',
  'SCHEMA',
  'TABLE',
  'VIEW',
  'FUNCTION',
  'INDEX',
  'PARTITION',
  'PARTITIONED',
  'EXTERNAL',
  'TEMP',
  'TEMPORARY',
  'GLOBAL',
  'CLUSTERED',
  'BUCKETS',
  'CASCADE',
  'COLUMNS',
  'COLUMN',

  /* =====================
     TABLE PROPERTIES
     ===================== */
  'USING',
  'STORED',
  'LOCATION',
  'TBLPROPERTIES',
  'OPTIONS',
  'SERDE',
  'SERDEPROPERTIES',

  /* =====================
     DML
     ===================== */
  'INSERT',
  'INTO',
  'OVERWRITE',
  'VALUES',
  'UPDATE',
  'DELETE',
  'MERGE',
  'NAME',

  /* =====================
     MERGE
     ===================== */
  'MATCHED',
  'NOT',
  'WHEN',
  'SET',

  /* =====================
     MISC
     ===================== */
  'AS',
  'CAST',
  'TRY_CAST',
  'EXPLAIN',
  'EXPLAIN EXTENDED',
  'EXPLAIN CODEGEN',
  'EXPLAIN COST',
  'EXPLAIN FORMATTED',
  'ANALYZE',
  'CACHE',
  'UNCACHE',
  'REFRESH',
  'CLEAR',

  /* =====================
     FILE FORMATS
     ===================== */
  'PARQUET',
  'ORC',
  'AVRO',
  'JSON',
  'CSV',
  'TEXTFILE',

  /* =====================
     SECURITY / MISC
     ===================== */
  'GRANT',
  'REVOKE',
  'SHOW',
  'LOAD',
  'UNLOAD',

  /* =====================
     SPARK SQL DATA TYPES
     ===================== */
  'STRING',
  'INT',
  'INTEGER',
  'BIGINT',
  'DOUBLE',
  'FLOAT',
  'DECIMAL',
  'BOOLEAN',
  'DATE',
  'TIMESTAMP',
  'ARRAY',
  'MAP',
  'STRUCT',
];

export const SPARK_SQL_KEYWORDS = Array.from(new Set(RAW_KEYWORDS));
