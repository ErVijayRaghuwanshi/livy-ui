export const SPARK_SQL_KEYWORDS = [
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
];
