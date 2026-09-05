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
    const parser = getParser(dialect);
    const rawErrors = parser.validate(sql) || [];

    const errors = rawErrors.map((err) => {
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
