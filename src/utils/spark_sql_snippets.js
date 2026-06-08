export const SPARK_SQL_SNIPPETS = [
  {
    label: "create_table_parquet",
    description: "Create a table using Parquet format",
    insertText: [
      "CREATE TABLE IF NOT EXISTS default.${1:table_name}",
      "USING parquet",
      "LOCATION '${2:hdfs://namenode/path/to/data}';",
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
  },
  {
    label: "targets_example",
    description: "Pre-filled example with 10 sample targets for quick testing",
    insertText: [
      "WITH raw AS (",
      "  SELECT from_json(",
      "    '[{\"9811002233\": {\"target_name\": \"VIP Exec Global\"}}, {\"9123456789\": {\"target_name\": \"Gateway Node East\"}}, {\"8800112244\": {\"target_name\": \"Staff Admin Alpha\"}}, {\"7042556677\": {\"target_name\": \"Sensor Fleet 01\"}}, {\"9988776655\": {\"target_name\": \"Retail POS Terminal\"}}, {\"6300445566\": {\"target_name\": \"Subject HighRisk 102\"}}, {\"8122334455\": {\"target_name\": \"Field Agent North\"}}, {\"9876543210\": {\"target_name\": \"Sentinel Test Probe\"}}, {\"7500119922\": {\"target_name\": \"Data Intensive User\"}}, {\"9011223344\": {\"target_name\": \"International Hub 05\"}}]',",
      "    'array<map<string,struct<target_name:string>>>'",
      "  ) AS arr",
      "),",
      "targets AS (",
      "  SELECT",
      "    target_entry.key AS mobile_number,",
      "    target_entry.value.target_name AS target_name",
      "  FROM raw",
      "  LATERAL VIEW EXPLODE(arr) a AS target_map",
      "  LATERAL VIEW EXPLODE(MAP_ENTRIES(target_map)) t AS target_entry",
      ")",
      "SELECT * FROM targets;",
    ].join("\n"),
  },
  {
    label: "target_json_value",
    description: "Sample JSON value with 10 targets for from_json",
    insertText: '[{"9811002233": {"target_name": "VIP Exec Global"}}, {"9123456789": {"target_name": "Gateway Node East"}}, {"8800112244": {"target_name": "Staff Admin Alpha"}}, {"7042556677": {"target_name": "Sensor Fleet 01"}}, {"9988776655": {"target_name": "Retail POS Terminal"}}, {"6300445566": {"target_name": "Subject HighRisk 102"}}, {"8122334455": {"target_name": "Field Agent North"}}, {"9876543210": {"target_name": "Sentinel Test Probe"}}, {"7500119922": {"target_name": "Data Intensive User"}}, {"9011223344": {"target_name": "International Hub 05"}}]',
  },
  {
    label: "targets_json",
    description: "Inline JSON target lookup table using from_json + LATERAL VIEW",
    insertText: [
      "WITH raw AS (",
      "  SELECT from_json(",
      "    '[{\"${1:mobile}\": {\"target_name\": \"${2:Name}\"}}]',",
      "    'array<map<string,struct<target_name:string>>>'",
      "  ) AS arr",
      "),",
      "targets AS (",
      "  SELECT",
      "    target_entry.key AS mobile_number,",
      "    target_entry.value.target_name AS target_name",
      "  FROM raw",
      "  LATERAL VIEW EXPLODE(arr) a AS target_map",
      "  LATERAL VIEW EXPLODE(MAP_ENTRIES(target_map)) t AS target_entry",
      ")",
      "SELECT * FROM targets;",
    ].join("\n"),
  },
  {
    label: "rule_vpn_tor_usage",
    description: "Anomaly detection rule: VPN/TOR usage by targets",
    insertText: [
      "WITH raw AS (",
      "  SELECT from_json(",
      "    '${1:[{\"mobile\": {\"target_name\": \"Name\"}}]}',",
      "    'array<map<string,struct<target_name:string>>>'",
      "  ) AS arr",
      "),",
      "targets AS (",
      "  SELECT",
      "    target_entry.key AS mobile_number,",
      "    target_entry.value.target_name AS target_name",
      "  FROM raw",
      "  LATERAL VIEW EXPLODE(arr) a AS target_map",
      "  LATERAL VIEW EXPLODE(MAP_ENTRIES(target_map)) t AS target_entry",
      "),",
      "target_data_filter AS (",
      "  SELECT",
      "    MOBILENUMBER,",
      "    CASE WHEN DOMAINCATID = '98' THEN 'TOR' ELSE 'VPN' END AS VPN_TOR,",
      "    TRANSACTIONSTARTTIME,",
      "    DATE",
      "  FROM parquet.\\`${2:hdfs://namenode/path/to/data}\\`",
      "  WHERE MOBILENUMBER IS NOT NULL",
      "    AND DOMAINCATID IN ('98', '99')",
      "    AND DATE IN ('${3:2026-01-01}')",
      "),",
      "rule_data AS (",
      "  SELECT",
      "    v.MOBILENUMBER, v.VPN_TOR, v.TRANSACTIONSTARTTIME, v.DATE, t.target_name",
      "  FROM target_data_filter v",
      "  INNER JOIN targets t ON v.MOBILENUMBER = t.mobile_number",
      ")",
      "SELECT",
      "  concat(MOBILENUMBER, '-AID-7-', VPN_TOR, DATE) AS id,",
      "  MOBILENUMBER AS MobileNumber,",
      "  target_name AS TargetName,",
      "  '7' AS RuleId,",
      "  'VPN TOR Usage.' AS RuleName,",
      "  'TOR VPN usage' AS GroupRuleName,",
      "  '${4:GroupId}' AS GroupId,",
      "  '${5:GroupName}' AS GroupName,",
      "  'RULE' AS GroupType,",
      "  '5' AS TrainingPeriod,",
      "  'EVIDENCE' AS Evidence,",
      "  DATE AS Date,",
      "  'VPN_TOR' AS BehaviourMetricType,",
      "  VPN_TOR AS BehaviourMetricKey,",
      "  count(*) AS BehaviourMetricValue,",
      "  'Target using VPN/TOR applications.' AS AnomalyDescription,",
      "  'Transaction' AS AnomalyIdentifiedLevel,",
      "  '[]' AS ThresholdValueList,",
      "  min(TRANSACTIONSTARTTIME) AS FirstSeenStartTime,",
      "  max(TRANSACTIONSTARTTIME) AS LastSeenStartTime",
      "FROM rule_data",
      "GROUP BY MOBILENUMBER, VPN_TOR, DATE, target_name",
      "HAVING BehaviourMetricValue >= ${6:1}",
    ].join("\n"),
  },
  {
    label: "rule_template",
    description: "Generic anomaly detection rule template with configurable parameters",
    insertText: [
      "WITH raw AS (",
      "  SELECT from_json(",
      "    '${1:TARGETS}',",
      "    'array<map<string,struct<target_name:string>>>'",
      "  ) AS arr",
      "),",
      "targets AS (",
      "  SELECT",
      "    target_entry.key AS mobile_number,",
      "    target_entry.value.target_name AS target_name",
      "  FROM raw",
      "  LATERAL VIEW EXPLODE(arr) a AS target_map",
      "  LATERAL VIEW EXPLODE(MAP_ENTRIES(target_map)) t AS target_entry",
      "),",
      "target_data_filter AS (",
      "  SELECT",
      "    MOBILENUMBER,",
      "    CASE WHEN DOMAINCATID = '98' THEN 'TOR' ELSE 'VPN' END AS VPN_TOR,",
      "    TRANSACTIONSTARTTIME,",
      "    DATE",
      "  FROM ${2:MASS}",
      "  WHERE MOBILENUMBER IS NOT NULL",
      "    AND DOMAINCATID IN ('98', '99')",
      "    AND DATE IN ('${3:DATE}')",
      "),",
      "rule_data AS (",
      "  SELECT",
      "    v.MOBILENUMBER, v.VPN_TOR, v.TRANSACTIONSTARTTIME, v.DATE, t.target_name",
      "  FROM target_data_filter v",
      "  INNER JOIN targets t ON v.MOBILENUMBER = t.mobile_number",
      ")",
      "SELECT",
      "  concat(MOBILENUMBER, '-AID-${4:RULE_ID}-', VPN_TOR, DATE) AS id,",
      "  MOBILENUMBER AS MobileNumber,",
      "  target_name AS TargetName,",
      "  '${4:RULE_ID}' AS RuleId,",
      "  '${5:RULE_NAME}' AS RuleName,",
      "  '${6:UNIQUE_NAME}' AS GroupRuleName,",
      "  '${7:GROUP_ID}' AS GroupId,",
      "  '${8:GROUP_NAME}' AS GroupName,",
      "  '${9:GROUP_TYPE}' AS GroupType,",
      "  '${10:TRAINING_PERIOD}' AS TrainingPeriod,",
      "  'EVIDENCE' AS Evidence,",
      "  DATE AS Date,",
      "  'VPN_TOR' AS BehaviourMetricType,",
      "  VPN_TOR AS BehaviourMetricKey,",
      "  count(*) AS BehaviourMetricValue,",
      "  '${11:RULE_DESC}' AS AnomalyDescription,",
      "  'Transaction' AS AnomalyIdentifiedLevel,",
      "  '[]' AS ThresholdValueList,",
      "  min(TRANSACTIONSTARTTIME) AS FirstSeenStartTime,",
      "  max(TRANSACTIONSTARTTIME) AS LastSeenStartTime",
      "FROM rule_data",
      "GROUP BY MOBILENUMBER, VPN_TOR, DATE, target_name",
      "HAVING BehaviourMetricValue ${12:>= 1}",
    ].join("\n"),
  },
  // ==========================================
  // APACHE SEDONA (GEOSPATIAL) SNIPPETS
  // ==========================================
  {
    label: "sedona_create_geometry",
    description: "Create geometry points from Longitude and Latitude",
    insertText: [
      "SELECT ",
      "  ${1:id_column},",
      "  ST_Point(CAST(${2:longitude_column} AS DECIMAL(24,20)), CAST(${3:latitude_column} AS DECIMAL(24,20))) AS geom",
      "FROM ${4:table_name};"
    ].join("\n"),
  },
  {
    label: "sedona_spatial_join",
    description: "Perform a spatial join (Points inside a Polygon)",
    insertText: [
      "SELECT",
      "  p.${1:point_id},",
      "  poly.${2:polygon_name}",
      "FROM ${3:points_table} p",
      "JOIN ${4:polygons_table} poly ",
      "  ON ST_Contains(poly.${5:polygon_geom_column}, p.${6:point_geom_column});"
    ].join("\n"),
  },
  {
    label: "sedona_calculate_distance",
    description: "Calculate planar distance between two geometries",
    insertText: [
      "SELECT ",
      "  ${1:id_column},",
      "  ST_Distance(ST_GeomFromWKT(${2:geom_string_1}), ST_GeomFromWKT(${3:geom_string_2})) AS distance",
      "FROM ${4:table_name};"
    ].join("\n"),
  },
  {
    label: "sedona_bounding_box",
    description: "Find the bounding box (envelope) containing all geometries",
    insertText: "SELECT ST_AsText(ST_Envelope_Aggr(${1:geom_column})) AS bounding_box FROM ${2:table_name};",
  },

  // ==========================================
  // DELTA LAKE MANAGEMENT SNIPPETS
  // ==========================================
  {
    label: "delta_create_table",
    description: "Create a Delta Lake table",
    insertText: [
      "CREATE TABLE IF NOT EXISTS default.${1:table_name} (",
      "  ${2:id INT, name STRING, created_at TIMESTAMP}",
      ")",
      "USING delta",
      "LOCATION '${3:hdfs://namenode/path/to/delta}';",
    ].join("\n"),
  },
  {
    label: "delta_merge_upsert",
    description: "MERGE INTO (Upsert) data into a Delta table",
    insertText: [
      "MERGE INTO ${1:target_table} t",
      "USING ${2:source_view} s",
      "ON t.${3:id} = s.${3:id}",
      "WHEN MATCHED THEN",
      "  UPDATE SET *",
      "WHEN NOT MATCHED THEN",
      "  INSERT *;"
    ].join("\n"),
  },
  {
    label: "delta_optimize_zorder",
    description: "Optimize Delta table file sizes and co-locate data via Z-ORDER",
    insertText: "OPTIMIZE ${1:table_name} ZORDER BY (${2:column_name});",
  },
  {
    label: "delta_vacuum",
    description: "Vacuum old data files from a Delta table to save storage",
    insertText: "VACUUM ${1:table_name} RETAIN ${2:168} HOURS;",
  },
  {
    label: "delta_time_travel_version",
    description: "Query an older version of a Delta table using Time Travel",
    insertText: "SELECT * FROM ${1:table_name} VERSION AS OF ${2:version_number};",
  },
  {
    label: "delta_time_travel_timestamp",
    description: "Query a Delta table as it existed at a specific timestamp",
    insertText: "SELECT * FROM ${1:table_name} TIMESTAMP AS OF '${2:2026-01-01 00:00:00}';",
  },
  {
    label: "delta_history",
    description: "View the transaction history and operations of a Delta table",
    insertText: "DESCRIBE HISTORY ${1:table_name};",
  },
  {
    label: "sample_data_cdr",
    description: "Pre-filled Telecom Call Detail Records (CDR) sample data",
    insertText: [
      "CREATE OR REPLACE TEMPORARY VIEW ${1:sample_cdr} AS",
      "SELECT * FROM VALUES",
      "  ('TXN-1001', '+91-9820011223', '+91-9920044556', 'VOICE', 120, TIMESTAMP '2026-04-09 10:15:00'),",
      "  ('TXN-1002', '+91-9820011223', 'N/A', 'DATA', 3600, TIMESTAMP '2026-04-09 11:00:00'),",
      "  ('TXN-1003', '+91-9000011223', '+91-9820011223', 'SMS', 0, TIMESTAMP '2026-04-09 11:45:00'),",
      "  ('TXN-1004', '+91-9111033445', '+91-9820011223', 'VOICE', 45, TIMESTAMP '2026-04-09 12:30:22')",
      "AS tab(txn_id, caller_msisdn, callee_msisdn, service_type, duration_sec, start_time);",
      "",
      "SELECT * FROM ${1:sample_cdr};"
    ].join("\n"),
  },
  {
    label: "sample_data_customer",
    description: "Pre-filled CRM Customer Profile sample data",
    insertText: [
      "CREATE OR REPLACE TEMPORARY VIEW ${1:sample_customer} AS",
      "SELECT * FROM VALUES",
      "  ('CUST-001', 'Aarav Sharma', 'aarav@example.com', 'Mumbai', 'Premium', DATE '2023-01-15'),",
      "  ('CUST-002', 'Priya Patel', 'priya@example.com', 'Delhi', 'Standard', DATE '2024-06-22'),",
      "  ('CUST-003', 'Rahul Verma', 'rahul@example.com', 'Bangalore', 'Premium', DATE '2025-03-10'),",
      "  ('CUST-004', 'Sneha Rao', 'sneha@example.com', 'Hyderabad', 'Standard', DATE '2026-01-05')",
      "AS tab(customer_id, full_name, email, city, subscription_tier, join_date);",
      "",
      "SELECT * FROM ${1:sample_customer};"
    ].join("\n"),
  },
  {
    label: "sample_data_ecommerce",
    description: "Pre-filled E-commerce Order Transactions sample data",
    insertText: [
      "CREATE OR REPLACE TEMPORARY VIEW ${1:sample_ecommerce} AS",
      "SELECT * FROM VALUES",
      "  ('ORD-991', 'CUST-001', 'Laptop Pro 15', 1, 1250.50, 'DELIVERED', TIMESTAMP '2026-04-01 09:30:00'),",
      "  ('ORD-992', 'CUST-002', 'Wireless Mouse', 2, 45.00, 'SHIPPED', TIMESTAMP '2026-04-05 14:15:00'),",
      "  ('ORD-993', 'CUST-001', 'USB-C Cable', 3, 15.00, 'PENDING', TIMESTAMP '2026-04-08 18:45:00'),",
      "  ('ORD-994', 'CUST-004', 'Mechanical Keyboard', 1, 120.00, 'PROCESSING', TIMESTAMP '2026-04-09 10:00:00')",
      "AS tab(order_id, customer_id, product_name, quantity, total_amount, status, order_time);",
      "",
      "SELECT * FROM ${1:sample_ecommerce};"
    ].join("\n"),
  },
  {
    label: "sample_data_student",
    description: "Pre-filled University Student Records sample data",
    insertText: [
      "CREATE OR REPLACE TEMPORARY VIEW ${1:sample_student} AS",
      "SELECT * FROM VALUES",
      "  ('STU-101', 'Neha Gupta', 'Computer Science', 3.8, 2024),",
      "  ('STU-102', 'Vikram Singh', 'Mechanical Engineering', 3.2, 2023),",
      "  ('STU-103', 'Ananya Iyer', 'Mathematics', 3.9, 2025),",
      "  ('STU-104', 'Rohan Desai', 'Physics', 3.5, 2024)",
      "AS tab(student_id, name, major, gpa, enrollment_year);",
      "",
      "SELECT * FROM ${1:sample_student};"
    ].join("\n"),
  },
  {
    label: "sample_data_spatial",
    description: "Pre-filled Sedona Geospatial (WKT) sample data",
    insertText: [
      "CREATE OR REPLACE TEMPORARY VIEW ${1:sample_spatial_pois} AS",
      "SELECT * FROM VALUES",
      "  ('POI-1', 'Central Park', 'POLYGON ((-73.981 40.768, -73.958 40.800, -73.949 40.797, -73.973 40.764, -73.981 40.768))'),",
      "  ('POI-2', 'Times Square', 'POINT (-73.985 40.758)'),",
      "  ('POI-3', 'Empire State Building', 'POINT (-73.985 40.748)'),",
      "  ('POI-4', '5th Ave Commute', 'LINESTRING (-73.990 40.730, -73.980 40.750, -73.970 40.770)')",
      "AS tab(poi_id, poi_name, wkt_geom);",
      "",
      "-- Instantly cast to Sedona Geometries",
      "SELECT poi_id, poi_name, ST_GeomFromWKT(wkt_geom) AS geometry FROM ${1:sample_spatial_pois};"
    ].join("\n"),
  },
  // ==========================================
  // DEBUGGING & METADATA SNIPPETS
  // ==========================================
  {
    label: "debug_explain_plan",
    description: "Generate the execution plan (logical and physical) for a query",
    insertText: [
      "EXPLAIN EXTENDED",
      "SELECT * FROM ${1:table_name}",
      "WHERE ${2:column_name} = '${3:value}';"
    ].join("\n"),
  },
  {
    label: "debug_describe_table",
    description: "View detailed metadata, schema, and partitioning info for a table",
    insertText: "DESCRIBE EXTENDED ${1:table_name};",
  },
  {
    label: "debug_show_functions",
    description: "Search for available built-in or custom User Defined Functions (UDFs)",
    insertText: "SHOW FUNCTIONS LIKE '%${1:ST_}%';",
  },
  {
    label: "debug_current_state",
    description: "Check the current database, user, and Spark version",
    insertText: "SELECT current_database(), current_user(), version();",
  },

  // ==========================================
  // CLUSTER CONFIG & RESOURCE MANAGEMENT
  // ==========================================
  {
    label: "config_set_property",
    description: "Set or view a Spark session configuration property",
    insertText: "SET ${1:spark.sql.shuffle.partitions} = ${2:200};",
  },
  {
    label: "config_show_all",
    description: "Show all current Spark SQL configuration properties",
    insertText: "SET -v;",
  },
  {
    label: "resource_add_jar",
    description: "Add a custom JAR file to the Spark session at runtime",
    insertText: "ADD JAR '${1:hdfs://namenode/path/to/custom-udfs.jar}';",
  },
  {
    label: "resource_list_jars",
    description: "List all JARs currently added to the Spark session",
    insertText: "LIST JARS;",
  },
  {
    label: "resource_add_file",
    description: "Add a local/HDFS file to be distributed across the Spark cluster",
    insertText: "ADD FILE '${1:/path/to/config.properties}';",
  },

  // ==========================================
  // TABLE OPTIMIZATION SNIPPETS
  // ==========================================
  {
    label: "optimize_analyze_table",
    description: "Compute table and column statistics for the Cost-Based Optimizer (CBO)",
    insertText: "ANALYZE TABLE ${1:table_name} COMPUTE STATISTICS FOR COLUMNS ${2:column1, column2};",
  },
  {
    label: "optimize_cache_table",
    description: "Force Spark to cache a table or view in memory for faster repeated access",
    insertText: "CACHE TABLE ${1:table_name};",
  },
  {
    label: "optimize_uncache_table",
    description: "Remove a table from Spark's memory cache",
    insertText: "UNCACHE TABLE ${1:table_name};",
  },
  {
    label: "delta_alter_liquid_clustering",
    description: "Enable or change Liquid Clustering (Delta Lake 3.0+) for a table",
    insertText: "ALTER TABLE ${1:table_name} CLUSTER BY (${2:column1, column2});",
  },
  {
    label: "delta_optimize_full",
    description: "Run a full Delta Lake optimization (compact files & Z-Order)",
    insertText: [
      "OPTIMIZE ${1:table_name}",
      "ZORDER BY (${2:frequently_filtered_column});"
    ].join("\n"),
  },
  {
    label: "delta_repair_table",
    description: "Recover partitions in a directory-based table metadata",
    insertText: "MSCK REPAIR TABLE ${1:table_name};",
  },
  
  // ==========================================
  // SPARK SQL DDL 101 SNIPPETS
  // ==========================================
  {
    label: "ddl_create_db",
    description: "Create a database",
    insertText: "CREATE DATABASE ${1:sales_db};",
  },
  {
    label: "ddl_create_db_if_not_exists",
    description: "Create a database only if it doesn't already exist",
    insertText: "CREATE DATABASE IF NOT EXISTS ${1:sales_db};",
  },
  {
    label: "ddl_use_db",
    description: "Switch active database context",
    insertText: "USE ${1:sales_db};",
  },
  {
    label: "ddl_show_databases",
    description: "Show list of databases",
    insertText: "SHOW DATABASES;",
  },
  {
    label: "ddl_describe_db",
    description: "Describe a database metadata",
    insertText: "DESCRIBE DATABASE ${1:sales_db};",
  },
  {
    label: "ddl_create_table_managed",
    description: "Create a managed Spark SQL table",
    insertText: [
      "CREATE TABLE ${1:customers} (",
      "    ${2:customer_id} INT,",
      "    ${3:name} STRING,",
      "    ${4:email} STRING,",
      "    ${5:signup_date} DATE",
      ");"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_external",
    description: "Create an external table with physical location",
    insertText: [
      "CREATE EXTERNAL TABLE ${1:customers_ext} (",
      "    ${2:customer_id} INT,",
      "    ${3:name} STRING,",
      "    ${4:email} STRING",
      ")",
      "LOCATION '${5:/data/customers}';"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_parquet",
    description: "Create a table using PARQUET format",
    insertText: [
      "CREATE TABLE ${1:customers} (",
      "    ${2:customer_id} INT,",
      "    ${3:name} STRING",
      ")",
      "USING PARQUET;"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_delta",
    description: "Create a table using DELTA format",
    insertText: [
      "CREATE TABLE ${1:customers} (",
      "    ${2:customer_id} INT,",
      "    ${3:name} STRING",
      ")",
      "USING DELTA;"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_csv",
    description: "Create a CSV data-source table with custom options",
    insertText: [
      "CREATE TABLE ${1:customers_csv} (",
      "    ${2:customer_id} INT,",
      "    ${3:name} STRING",
      ")",
      "USING CSV",
      "OPTIONS (",
      "    path '${4:/data/customers.csv}',",
      "    header '${5:true}'",
      ");"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_like",
    description: "Create a table matching the schema of another table using a specific format",
    insertText: "CREATE TABLE ${1:default.merged_telecom_tbl} LIKE ${2:default.mass_delta_partitioned} USING ${3:DELTA};",
  },
  {
    label: "ddl_create_table_partitioned",
    description: "Create a partitioned table (improved query scan performance)",
    insertText: [
      "CREATE TABLE ${1:orders} (",
      "    ${2:order_id} BIGINT,",
      "    ${3:customer_id} INT,",
      "    ${4:amount} DECIMAL(10,2),",
      "    ${5:order_date} DATE",
      ")",
      "USING ${6:PARQUET}",
      "PARTITIONED BY (${7:order_date});"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_bucketed",
    description: "Create a bucketed table distributed into fixed clusters",
    insertText: [
      "CREATE TABLE ${1:users} (",
      "    ${2:user_id} BIGINT,",
      "    ${3:name} STRING",
      ")",
      "USING ${4:PARQUET}",
      "CLUSTERED BY (${5:user_id})",
      "INTO ${6:8} BUCKETS;"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_ctas",
    description: "Create Table As Select (CTAS) to populate in one step",
    insertText: [
      "CREATE TABLE ${1:active_customers}",
      "USING ${2:PARQUET}",
      "AS",
      "SELECT ${3:*}",
      "FROM ${4:customers}",
      "WHERE ${5:status = 'ACTIVE'};"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_ctas_empty",
    description: "Create an empty table copying the schema of another table",
    insertText: [
      "CREATE TABLE ${1:default.merged_telecom_tbl}",
      "USING ${2:DELTA}",
      "AS SELECT ${3:*}",
      "FROM ${4:default.mass_delta_partitioned}",
      "WHERE 1=0;"
    ].join("\n"),
  },
  {
    label: "ddl_create_temp_view",
    description: "Create a session-scoped temporary view",
    insertText: [
      "CREATE TEMP VIEW ${1:customer_view} AS",
      "SELECT ${2:*}",
      "FROM ${3:customers};"
    ].join("\n"),
  },
  {
    label: "ddl_create_global_temp_view",
    description: "Create a global temporary view (query via global_temp.name)",
    insertText: [
      "CREATE GLOBAL TEMP VIEW ${1:customer_view} AS",
      "SELECT ${2:*}",
      "FROM ${3:customers};"
    ].join("\n"),
  },
  {
    label: "ddl_select_global_temp_view",
    description: "Query a global temporary view",
    insertText: "SELECT * FROM global_temp.${1:customer_view};",
  },
  {
    label: "ddl_alter_rename_table",
    description: "Rename an existing table",
    insertText: "ALTER TABLE ${1:customers} RENAME TO ${2:customer_master};",
  },
  {
    label: "ddl_alter_add_columns",
    description: "Add new columns to an existing table schema",
    insertText: [
      "ALTER TABLE ${1:customers}",
      "ADD COLUMNS (",
      "    ${2:phone} STRING,",
      "    ${3:city} STRING",
      ");"
    ].join("\n"),
  },
  {
    label: "ddl_alter_column_type",
    description: "Modify an existing column type",
    insertText: "ALTER TABLE ${1:customers} ALTER COLUMN ${2:phone} TYPE ${3:STRING};",
  },
  {
    label: "ddl_alter_rename_column",
    description: "Rename a column within a table",
    insertText: "ALTER TABLE ${1:customers} RENAME COLUMN ${2:phone} TO ${3:mobile};",
  },
  {
    label: "ddl_alter_drop_columns",
    description: "Drop columns from a table (requires Delta column mapping mode)",
    insertText: "ALTER TABLE ${1:default.merged_telecom_tbl} DROP COLUMN (${2:CASEID, ID});",
  },
  {
    label: "ddl_partition_add",
    description: "Add a physical partition path manually",
    insertText: "ALTER TABLE ${1:orders} ADD PARTITION (${2:order_date}='${3:2025-01-01}');",
  },
  {
    label: "ddl_partition_drop",
    description: "Drop a physical partition",
    insertText: "ALTER TABLE ${1:orders} DROP PARTITION (${2:order_date}='${3:2025-01-01}');",
  },
  {
    label: "ddl_partition_show",
    description: "List all partitions defined for a table",
    insertText: "SHOW PARTITIONS ${1:orders};",
  },
  {
    label: "ddl_properties_set",
    description: "Define TBLPROPERTIES metadata key-values",
    insertText: [
      "ALTER TABLE ${1:customers} SET TBLPROPERTIES (",
      "    '${2:owner}'='${3:data_team}',",
      "    '${4:quality}'='${5:gold}'",
      ");"
    ].join("\n"),
  },
  {
    label: "ddl_properties_show",
    description: "View all table properties",
    insertText: "SHOW TBLPROPERTIES ${1:customers};",
  },
  {
    label: "ddl_describe",
    description: "Describe schema configuration",
    insertText: "DESCRIBE ${1:customers};",
  },
  {
    label: "ddl_describe_extended",
    description: "Describe extended table metadata",
    insertText: "DESCRIBE EXTENDED ${1:customers};",
  },
  {
    label: "ddl_describe_formatted",
    description: "Describe formatted table metadata with storage specs",
    insertText: "DESCRIBE FORMATTED ${1:customers};",
  },
  {
    label: "ddl_drop_table",
    description: "Delete table",
    insertText: "DROP TABLE ${1:customers};",
  },
  {
    label: "ddl_drop_table_if_exists",
    description: "Delete table if it exists",
    insertText: "DROP TABLE IF EXISTS ${1:customers};",
  },
  {
    label: "ddl_drop_db",
    description: "Delete database",
    insertText: "DROP DATABASE ${1:sales_db};",
  },
  {
    label: "ddl_drop_db_cascade",
    description: "Delete database and all contained objects",
    insertText: "DROP DATABASE IF EXISTS ${1:sales_db} CASCADE;",
  },
  {
    label: "ddl_show_tables",
    description: "Show list of tables in current database",
    insertText: "SHOW TABLES;",
  },
  {
    label: "ddl_insert_by_name",
    description: "Insert data matching target columns by name",
    insertText: [
      "INSERT INTO ${1:default.merged_telecom_tbl} BY NAME",
      "SELECT ${2:*}",
      "FROM ${3:voice_tbl};"
    ].join("\n"),
  },
  {
    label: "ddl_create_table_complex_types",
    description: "Create a table with Array, Map, and Struct complex types",
    insertText: [
      "CREATE TABLE IF NOT EXISTS ${1:events} (",
      "    ${2:id} BIGINT,",
      "    ${3:tags} ARRAY<STRING>,",
      "    ${4:attributes} MAP<STRING, STRING>,",
      "    ${5:metadata} STRUCT<",
      "        source: STRING,",
      "        version: INT",
      "    >",
      ")",
      "USING ${6:PARQUET};"
    ].join("\n"),
  },
  {
    label: "ddl_production_example",
    description: "Comprehensive delta table creation with partitioning and table properties",
    insertText: [
      "CREATE TABLE IF NOT EXISTS ${1:sales_fact} (",
      "    sale_id BIGINT,",
      "    customer_id BIGINT,",
      "    product_id BIGINT,",
      "    quantity INT,",
      "    amount DECIMAL(12,2),",
      "    sale_timestamp TIMESTAMP",
      ")",
      "USING DELTA",
      "PARTITIONED BY (${2:product_id});",
      "",
      "ALTER TABLE ${1:sales_fact}",
      "SET TBLPROPERTIES (",
      "    'data_tier'='gold',",
      "    'owner'='analytics'",
      ");",
      "",
      "DESCRIBE FORMATTED ${1:sales_fact};"
    ].join("\n"),
  }
];