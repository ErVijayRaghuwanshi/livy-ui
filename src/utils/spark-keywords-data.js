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

  /* =====================
     DELTA LAKE / CLONES / TIME TRAVEL
     ===================== */
  'OPTIMIZE',
  'ZORDER',
  'VACUUM',
  'RETAIN',
  'DRY',
  'RUN',
  'HISTORY',
  'CLONE',
  'SHALLOW',
  'DEEP',
  'RESTORE',
  'GENERATE',
  'SYMLINK_FORMAT_MANIFEST',
  
  /* =====================
     SPARK SPECIFIC CLAUSES
     ===================== */
  'LATERAL',
  'PIVOT',
  'UNPIVOT',
  'WINDOW',
  'SORT',
  'DISTRIBUTE',
  'CLUSTER',
  'REDUCE',
  'TRANSFORM',
  'SORTED',
  'DISTRIBUTED',
  'REDUCED',

  /* =====================
     DDL / FILE STRUCTURE EXTENSIONS
     ===================== */
  'REPLACE',
  'PURGE',
  'RESTRICT',
  'FORMAT',
  'DELIMITED',
  'FIELDS',
  'TERMINATED',
  'COLLECTION',
  'ITEMS',
  'KEYS',
  'LINES',
  'INPUTFORMAT',
  'OUTPUTFORMAT',

  /* =====================
     METADATA / STATS / MANAGEMENT
     ===================== */
  'MSCK',
  'REPAIR',
  'RECOVER',
  'PARTITIONS',
  'COMPUTE',
  'STATISTICS',
  'METADATA',
  'SYNC',
  'EXPORT',
  'IMPORT',
  'DATA',
  'LOCAL',
  'INPATH',

  /* =====================
     TIME TRAVEL & ASOF
     ===================== */
  'ASOF',
  'SYSTEM_TIME',
  'SYSTEM_VERSION',
  'VERSION',

  /* =====================
     FILE FORMATS
     ===================== */
  'DELTA',
  'ICEBERG',
  'HUDI',
  'XML',
  'TEXT',
  'BINARYFILE',

  /* =====================
     SPARK SQL DATA TYPES & DATE PARTS
     ===================== */
  'TINYINT',
  'SMALLINT',
  'CHAR',
  'VARCHAR',
  'BINARY',
  'VOID',
  'INTERVAL',
  'YEAR',
  'MONTH',
  'DAY',
  'HOUR',
  'MINUTE',
  'SECOND',

  /* =====================
     SET OPERATIONS EXTENSIONS
     ===================== */
  'EXCEPT ALL',
  'INTERSECT ALL',
];

export const SPARK_SQL_KEYWORDS = Array.from(new Set(RAW_KEYWORDS));
