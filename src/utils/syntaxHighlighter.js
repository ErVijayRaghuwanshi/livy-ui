/**
 * High-performance, zero-dependency syntax highlighter for AI Copilot chat code blocks.
 * Matches VS Code Copilot dark theme colors (#ff7b72 for keywords, #dcdcaa for functions,
 * #4ec9b0 for data types, #a5d6ff for strings, #9cdcfe for backticks, #79c0ff for numbers,
 * #8b949e for comments & delimiters).
 */

const SQL_KEYWORDS = new Set([
  "SELECT", "FROM", "WHERE", "AND", "OR", "NOT", "IN", "AS", "JOIN", "LEFT", "RIGHT",
  "INNER", "OUTER", "CROSS", "FULL", "ON", "GROUP", "BY", "ORDER", "HAVING", "LIMIT",
  "OFFSET", "UNION", "ALL", "DISTINCT", "INSERT", "INTO", "VALUES", "UPDATE", "SET",
  "DELETE", "CREATE", "DROP", "ALTER", "TABLE", "VIEW", "DATABASE", "SCHEMA", "INDEX",
  "PARTITION", "PARTITIONED", "DISTRIBUTED", "PROPERTIES", "SHOW", "DESCRIBE", "DESC",
  "EXPLAIN", "WITH", "CASE", "WHEN", "THEN", "ELSE", "END", "IS", "NULL", "TRUE",
  "FALSE", "LIKE", "ILIKE", "BETWEEN", "EXISTS", "OVER", "CAST", "DUAL", "PRIMARY",
  "KEY", "AUTO_INCREMENT", "DEFAULT", "ENGINE", "USE", "ASC", "WINDOW", "ROWS",
  "RANGE", "UNBOUNDED", "PRECEDING", "FOLLOWING", "CURRENT", "ROW", "LATERAL",
  "REPLACE", "TRUNCATE", "RENAME", "TO", "ADD", "COLUMN", "MODIFY", "CHANGE", "FIRST",
  "AFTER", "UNIQUE", "CHECK", "FOREIGN", "REFERENCES", "CASCADE", "RESTRICT", "SYNC",
  "REFRESH", "ANALYZE", "OPTIMIZE", "MSCK", "RECOVER", "LOAD", "DATA", "INPATH",
  "OVERWRITE", "DIRECTORY", "UNSET", "NULLS", "LAST", "BUCKETS", "HASH", "RANDOM",
  "QUALIFY", "FETCH", "NEXT", "ONLY", "PERCENT", "STRAIGHT_JOIN", "INTERSECT", "EXCEPT"
]);

const SQL_FUNCTIONS = new Set([
  "COUNT", "SUM", "AVG", "MIN", "MAX", "ROUND", "FLOOR", "CEIL", "ABS", "MOD", "POW",
  "POWER", "SQRT", "CONCAT", "CONCAT_WS", "SUBSTR", "SUBSTRING", "TRIM", "LTRIM", "RTRIM",
  "LOWER", "UPPER", "REGEXP_EXTRACT", "REGEXP_REPLACE", "SPLIT", "LENGTH", "REPLACE",
  "LPAD", "RPAD", "INSTR", "COALESCE", "IFNULL", "NVL", "NULLIF", "IF", "DATE_FORMAT",
  "DATE_ADD", "DATE_SUB", "DATEDIFF", "NOW", "CURRENT_TIMESTAMP", "CURRENT_DATE",
  "TO_DATE", "UNIX_TIMESTAMP", "FROM_UNIXTIME", "YEAR", "MONTH", "DAY", "HOUR",
  "MINUTE", "SECOND", "TIMESTAMPADD", "TIMESTAMPDIFF", "ROW_NUMBER", "RANK", "DENSE_RANK",
  "NTILE", "PERCENT_RANK", "LEAD", "LAG", "FIRST_VALUE", "LAST_VALUE", "EXPLODE",
  "POSEXPLODE", "COLLECT_LIST", "COLLECT_SET", "SIZE", "GET_JSON_OBJECT", "JSON_EXTRACT",
  "JSON_VALUE", "FROM_JSON", "TO_JSON", "STR_TO_DATE", "APPROX_COUNT_DISTINCT", "MD5",
  "SHA1", "PARSE_URL"
]);

const SQL_TYPES = new Set([
  "INT", "INTEGER", "BIGINT", "SMALLINT", "TINYINT", "LARGEINT", "FLOAT", "DOUBLE",
  "DECIMAL", "NUMERIC", "CHAR", "VARCHAR", "STRING", "TEXT", "BOOLEAN", "BOOL", "DATE",
  "DATETIME", "DATETIMEV2", "TIMESTAMP", "ARRAY", "MAP", "STRUCT", "JSON", "BITMAP", "HLL"
]);

export function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Tokenizes and syntax-highlights SQL string to HTML with inline styles.
 */
export function highlightSql(code = "") {
  if (!code) return "";

  // Regex tokens:
  // 1: Comments (-- or /* ... */)
  // 2: Single-quoted string
  // 3: Double-quoted string
  // 4: Backtick identifier
  // 5: Numbers (including decimals)
  // 6: Identifiers / words
  // 7: Comparison & arithmetic operators
  // 8: Delimiters and parentheses
  const tokenRegex = /(\/\*[\s\S]*?\*\/|--[^\n]*)|('(?:[^'\\]|\\.)*?(?:'|$))|("(?:[^"\\]|\\.)*?(?:"|$))|(`(?:[^`\\]|\\.)*?(?:`|$))|(\b\d+(?:\.\d+)?\b)|([a-zA-Z_][a-zA-Z0-9_]*)|(<=|>=|!=|<>|[<>=+\-*\/%])|([(),;.])/g;

  let lastIndex = 0;
  let out = "";

  for (const match of code.matchAll(tokenRegex)) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      out += escapeHtml(code.slice(lastIndex, matchIndex));
    }
    lastIndex = matchIndex + match[0].length;

    const [raw, comment, singleStr, doubleStr, backtick, number, word, op, delim] = match;

    if (comment) {
      out += `<span style="color:#8b949e;font-style:italic;">${escapeHtml(comment)}</span>`;
    } else if (singleStr || doubleStr) {
      out += `<span style="color:#a5d6ff;">${escapeHtml(singleStr || doubleStr)}</span>`;
    } else if (backtick) {
      out += `<span style="color:#9cdcfe;">${escapeHtml(backtick)}</span>`;
    } else if (number) {
      out += `<span style="color:#79c0ff;">${escapeHtml(number)}</span>`;
    } else if (word) {
      const upper = word.toUpperCase();
      if (SQL_KEYWORDS.has(upper)) {
        out += `<span style="color:#ff7b72;font-weight:500;">${escapeHtml(word)}</span>`;
      } else if (SQL_FUNCTIONS.has(upper)) {
        out += `<span style="color:#dcdcaa;">${escapeHtml(word)}</span>`;
      } else if (SQL_TYPES.has(upper)) {
        out += `<span style="color:#4ec9b0;">${escapeHtml(word)}</span>`;
      } else {
        out += `<span style="color:#e6edf3;">${escapeHtml(word)}</span>`;
      }
    } else if (op) {
      out += `<span style="color:#ff7b72;">${escapeHtml(op)}</span>`;
    } else if (delim) {
      out += `<span style="color:#8b949e;">${escapeHtml(delim)}</span>`;
    } else {
      out += escapeHtml(raw);
    }
  }

  if (lastIndex < code.length) {
    out += escapeHtml(code.slice(lastIndex));
  }
  return out;
}

/**
 * Tokenizes and syntax-highlights JSON string to HTML.
 */
export function highlightJson(code = "") {
  if (!code) return "";

  const tokenRegex = /("(?:[^"\\]|\\.)*?")(\s*:)?|(-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false|null)\b|([{}[\],])/g;
  let lastIndex = 0;
  let out = "";

  for (const match of code.matchAll(tokenRegex)) {
    const matchIndex = match.index;
    if (matchIndex > lastIndex) {
      out += escapeHtml(code.slice(lastIndex, matchIndex));
    }
    lastIndex = matchIndex + match[0].length;

    const [raw, str, colon, number, boolNull, delim] = match;
    if (str) {
      if (colon) {
        out += `<span style="color:#7ee787;">${escapeHtml(str)}</span>${colon}`;
      } else {
        out += `<span style="color:#a5d6ff;">${escapeHtml(str)}</span>`;
      }
    } else if (number) {
      out += `<span style="color:#79c0ff;">${escapeHtml(number)}</span>`;
    } else if (boolNull) {
      out += `<span style="color:#ff7b72;font-weight:500;">${escapeHtml(boolNull)}</span>`;
    } else if (delim) {
      out += `<span style="color:#8b949e;">${escapeHtml(delim)}</span>`;
    } else {
      out += escapeHtml(raw);
    }
  }

  if (lastIndex < code.length) {
    out += escapeHtml(code.slice(lastIndex));
  }
  return out;
}

/**
 * High-level syntax highlighter dispatcher for code blocks.
 */
export function highlightCode(code = "", lang = "") {
  const cleanLang = (lang || "").toLowerCase().trim();
  const isSql =
    ["sql", "sparksql", "dorisql", "mysql", "hql", "hive", "pgsql", "postgres", "tsql"].includes(cleanLang) ||
    (!cleanLang && /^\s*(SELECT|WITH|SHOW|DESCRIBE|EXPLAIN|CREATE|DROP|ALTER|INSERT)\b/i.test(code.trim()));

  if (isSql) {
    return highlightSql(code);
  }
  if (cleanLang === "json") {
    return highlightJson(code);
  }

  return escapeHtml(code);
}
