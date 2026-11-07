import { SparkSQL, GenericSQL, HiveSQL, MySQL } from "dt-sql-parser";

let sparkParser = null;
let genericParser = null;
let hiveParser = null;
let mysqlParser = null;

function getParser(dialect = "spark") {
  switch (dialect.toLowerCase()) {
    case "spark":
      if (!sparkParser) sparkParser = new SparkSQL();
      return sparkParser;
    case "hive":
      if (!hiveParser) hiveParser = new HiveSQL();
      return hiveParser;
    case "mysql":
      if (!mysqlParser) mysqlParser = new MySQL();
      return mysqlParser;
    case "generic":
    default:
      if (!genericParser) genericParser = new GenericSQL();
      return genericParser;
  }
}

/**
 * Masks query template placeholders ($var, ${var}, {{var}}, :var, @var) outside strings/comments
 * with equal-length dummy identifiers so the parser does not produce false-positive syntax errors,
 * while preserving identical line and column offsets for any real errors.
 *
 * @param {string} sql
 * @returns {string}
 */
export function maskPlaceholdersForValidation(sql) {
  if (!sql) return "";
  const pattern = /('(?:''|[^'])*'|"(?:""|[^"])*"|`(?:``|[^`])*`|--[^\r\n]*|\/\*[\s\S]*?\*\/)|(\$\{[\w.-]+\}|\{\{[\s\S]*?\}\}|\$[a-zA-Z0-9_]+|:[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g;

  return sql.replace(pattern, (match, literal, placeholder) => {
    if (literal || !placeholder) return match;
    return "_" + "x".repeat(Math.max(0, placeholder.length - 1));
  });
}

/**
 * Masks Doris-specific syntax extensions (SHOW PROC, SHOW RESOURCES, CREATE RESOURCE,
 * DATETIMEV2, LARGEINT, DUPLICATE KEY, etc.) into equal-length, valid MySQL tokens/statements
 * so that standard MySQL grammar does not produce false-positive syntax errors, while preserving
 * exact character counts, line numbers, and column offsets.
 *
 * @param {string} sql
 * @returns {string}
 */
export function maskDorisSqlForValidation(sql) {
  if (!sql) return "";

  // 1. Mask Doris-specific SHOW statements (SHOW RESOURCES, SHOW BACKENDS, SHOW PROC, etc.)
  const dorisShowRegex = /\bSHOW\s+(?:RESOURCES?|BACKENDS?|FRONTENDS?|PROC|WORKLOAD(?:\s+GROUPS?)?|BROKERS?|REPOSITOR(?:Y|IES)|CATALOGS?|LOAD|ROUTINE|STREAM|SYNC|EXPORT|RESTORE|SNAPSHOT|TRASH|TABLE\s+CREATION|PARTITIONS|DATA|ROLLUP|ALTER|CLUSTERS?|WHITE\s*LIST|ENGINES)\b[^;]*(?:;|$)/gi;
  let result = sql.replace(dorisShowRegex, (match) => {
    const dummy = match.trimEnd().endsWith(";") ? "SHOW TABLES;" : "SHOW TABLES";
    if (match.length <= dummy.length) return dummy.slice(0, match.length);
    return dummy + " ".repeat(match.length - dummy.length);
  });

  // 2. Mask Doris RESOURCE DDL: (CREATE|DROP|ALTER) RESOURCE ...;
  const dorisResourceRegex = /\b(?:CREATE|DROP|ALTER)\s+RESOURCE\s+[^;]*(?:;|$)/gi;
  result = result.replace(dorisResourceRegex, (match) => {
    const lines = match.split("\n");
    return lines.map((line, idx) => {
      if (idx === 0) {
        const dummy = "SELECT 1;";
        return dummy + " ".repeat(Math.max(0, line.length - dummy.length));
      }
      return " ".repeat(line.length);
    }).join("\n");
  });

  // 3. Mask Doris WORKLOAD GROUP DDL: (CREATE|DROP|ALTER) WORKLOAD GROUP ...;
  const dorisWorkloadRegex = /\b(?:CREATE|DROP|ALTER)\s+WORKLOAD\s+GROUP\s+[^;]*(?:;|$)/gi;
  result = result.replace(dorisWorkloadRegex, (match) => {
    const lines = match.split("\n");
    return lines.map((line, idx) => {
      if (idx === 0) {
        const dummy = "SELECT 1;";
        return dummy + " ".repeat(Math.max(0, line.length - dummy.length));
      }
      return " ".repeat(line.length);
    }).join("\n");
  });

  // 4. Mask Doris specific table DDL options after column list: DUPLICATE KEY, DISTRIBUTED BY, PROPERTIES
  result = result.replace(/\)\s*(?:DUPLICATE\s+KEY|AGGREGATE\s+KEY|UNIQUE\s+KEY|DISTRIBUTED\s+BY|PARTITION\s+BY|PROPERTIES)[\s\S]*?;/gi, (match) => {
    const lines = match.split("\n");
    return lines.map((line, idx) => {
      if (idx === 0) return ");" + " ".repeat(Math.max(0, line.length - 2));
      return " ".repeat(line.length);
    }).join("\n");
  });

  // 5. Mask Doris data types to same-length MySQL data types
  result = result
    .replace(/\bLARGEINT\b/gi, "BIGINT  ")
    .replace(/\bDATETIMEV2\b/gi, "DATETIME  ")
    .replace(/\bDATEV2\b/gi, "DATE  ")
    .replace(/\bQUANTILE_STATE\b/gi, "VARCHAR(64)   ")
    .replace(/\bAGG_STATE\b/gi, "VARCHAR(9)")
    .replace(/\bBITMAP\b/gi, "BLOB  ")
    .replace(/\bHLL\b/gi, "INT")
    .replace(/\bJSONB\b/gi, "JSON ")
    .replace(/\bVARIANT\b/gi, "JSON   ");

  return result;
}

/**
 * Validates a SQL query string using dt-sql-parser.
 *
 * @param {string} sql - SQL string to validate
 * @param {string} [dialect="spark"] - SQL dialect ('spark', 'hive', 'mysql', 'generic')
 * @returns {{ isValid: boolean, errors: Array<{ message: string, startLine: number, startCol: number, endLine: number, endCol: number }> }}
 */
export function validateSql(sql, dialect = "spark") {
  if (!sql || !sql.trim()) {
    return { isValid: true, errors: [] };
  }

  try {
    const isDorisDialect = dialect.toLowerCase() === "mysql";
    const parser = getParser(dialect);

    // Apply placeholder masking + Doris extension masking
    let preparedSql = maskPlaceholdersForValidation(sql);
    if (isDorisDialect) {
      preparedSql = maskDorisSqlForValidation(preparedSql);
    }

    const rawErrors = parser.validate(preparedSql) || [];

    const lines = sql.split("\n");

    // Comprehensive Doris extensions regex for secondary filter protection
    const dorisKeywordsRegex = /\b(RESOURCES?|BACKENDS?|FRONTENDS?|PROC|WORKLOAD(?:\s+GROUPS?)?|ROUTINE|BROKERS?|REPOSITOR(?:Y|IES)|CATALOGS?|DUPLICATE|AGGREGATE|DISTRIBUTED|BUCKETS|PROPERTIES|INVERTED|LARGEINT|DATETIMEV2|DATEV2|QUANTILE_STATE|AGG_STATE|BITMAP|HLL|VARIANT|COMPACT|AI_\w+)\b/i;

    const errors = rawErrors
      .map((err) => {
        const startLine = Number(err.startLine) || 1;
        const startCol = Number(err.startColumn ?? err.startCol) || 1;
        const endLine = Number(err.endLine) || startLine;
        const endCol = Number(err.endColumn ?? err.endCol) || (startCol + 1);

        return {
          message: err.message || "SQL syntax error",
          startLine,
          startCol,
          endLine,
          endCol,
        };
      })
      .filter((err) => {
        if (!isDorisDialect) return true;
        // Suppress false positives on lines or messages mentioning Doris extensions
        const lineContent = lines[err.startLine - 1] || "";
        const isDorisLine = dorisKeywordsRegex.test(lineContent);
        const isDorisMsg = dorisKeywordsRegex.test(err.message);
        return !isDorisLine && !isDorisMsg;
      });

    return {
      isValid: errors.length === 0,
      errors,
    };
  } catch (err) {
    console.warn("SQL static validation internal error:", err);
    return { isValid: true, errors: [] };
  }
}
