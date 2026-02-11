export const SPARK_SQL_SNIPPETS = [
  {
    label: "create_table_parquet",
    description: "Create a table using Parquet format",
    insertText: [
      "CREATE TABLE IF NOT EXISTS ${1:database}.${2:table_name}",
      "USING parquet",
      "LOCATION '${3:hdfs://namenode/path/to/data}';",
    ].join("\n"),
  },
  {
    label: "create_view_csv",
    description: "Create a temporary view from a CSV file",
    insertText: [
      "CREATE TABLE IF NOT EXISTS default.${1:customers} ",
      "USING csv ",
      "OPTIONS (",
      "  path '${2:/opt/spark/data/customers.csv}', ",
      "  header '${3:true}', ",
      "  inferSchema '${4:true}'",
      ");",
    ].join("\n"),
  },
  {
    label: "create_view_json",
    description: "Create a temporary view from a JSON file",
    insertText: [
      "CREATE TEMPORARY VIEW ${1:view_name} ",
      "USING json ",
      "OPTIONS (",
      "  path '${2:/opt/spark/data/file.json}'",
      ");",
    ].join("\n"),
  },
  {
    label: "select_limit",
    description: "Basic SELECT query with LIMIT",
    insertText: "SELECT * FROM ${1:table_name} LIMIT ${2:10};",
  }
];