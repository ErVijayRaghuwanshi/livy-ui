/**
 * Apache Doris SQL Snippets & Code Templates (Doris 3.x / 4.x Parity)
 * Total Snippets: 22
 * Production-ready templates for tables, inverted indexes, MTMV, TVF, jobs, and AI resources.
 */

export const DORIS_SQL_SNIPPETS = [
  {
    "label": "create_table_duplicate",
    "description": "Create a Doris Duplicate Key table (recommended for append-heavy analytical logs)",
    "insertText": "CREATE TABLE IF NOT EXISTS ${1:demo_db}.${2:event_logs} (\n  event_time DATETIMEV2(3) NOT NULL COMMENT 'Timestamp',\n  user_id BIGINT NOT NULL COMMENT 'User ID',\n  event_type VARCHAR(64) NOT NULL COMMENT 'Type of event',\n  payload STRING COMMENT 'JSON or raw payload'\n)\nDUPLICATE KEY(event_time, user_id)\nDISTRIBUTED BY HASH(user_id) BUCKETS ${3:10}\nPROPERTIES (\n  'replication_num' = '1'\n);"
  },
  {
    "label": "create_table_unique",
    "description": "Create a Doris Unique Key table with Merge-On-Write (recommended for transactional updates & upserts)",
    "insertText": "CREATE TABLE IF NOT EXISTS ${1:demo_db}.${2:users} (\n  id INT NOT NULL COMMENT 'Primary key',\n  name VARCHAR(50) NOT NULL COMMENT 'User name',\n  role VARCHAR(50) COMMENT 'Role',\n  department VARCHAR(50) COMMENT 'Department',\n  salary DOUBLE COMMENT 'Salary',\n  updated_at DATETIMEV2(3) DEFAULT CURRENT_TIMESTAMP COMMENT 'Last update time'\n)\nUNIQUE KEY(id)\nDISTRIBUTED BY HASH(id) BUCKETS ${3:10}\nPROPERTIES (\n  'replication_num' = '1',\n  'enable_unique_key_merge_on_write' = 'true'\n);"
  },
  {
    "label": "create_table_aggregate",
    "description": "Create a Doris Aggregate Key table for pre-computed rollups and metrics",
    "insertText": "CREATE TABLE IF NOT EXISTS ${1:demo_db}.${2:daily_metrics} (\n  report_date DATE NOT NULL COMMENT 'Date',\n  channel VARCHAR(32) NOT NULL COMMENT 'Acquisition channel',\n  pv BIGINT SUM DEFAULT '0' COMMENT 'Page views',\n  uv BITMAP BITMAP_UNION COMMENT 'User roaring bitmap for exact distinct count',\n  last_updated DATETIMEV2 REPLACE DEFAULT CURRENT_TIMESTAMP\n)\nAGGREGATE KEY(report_date, channel)\nDISTRIBUTED BY HASH(channel) BUCKETS ${3:8}\nPROPERTIES (\n  'replication_num' = '1'\n);"
  },
  {
    "label": "create_table_dynamic_partition",
    "description": "Create a Doris table with automatic dynamic date partitioning",
    "insertText": "CREATE TABLE IF NOT EXISTS ${1:demo_db}.${2:events_p} (\n  event_date DATE NOT NULL,\n  user_id BIGINT NOT NULL,\n  action VARCHAR(32)\n)\nDUPLICATE KEY(event_date, user_id)\nPARTITION BY RANGE(event_date) ()\nDISTRIBUTED BY HASH(user_id) BUCKETS ${3:10}\nPROPERTIES (\n  'replication_num' = '1',\n  'dynamic_partition.enable' = 'true',\n  'dynamic_partition.time_unit' = 'DAY',\n  'dynamic_partition.start' = '-7',\n  'dynamic_partition.end' = '3',\n  'dynamic_partition.prefix' = 'p',\n  'dynamic_partition.buckets' = '10'\n);"
  },
  {
    "label": "create_inverted_index",
    "description": "Add an inverted index on a text column for full-text keyword tokenization",
    "insertText": "ALTER TABLE ${1:demo_db}.${2:articles} \nADD INDEX ${3:idx_content}(${4:content}) USING INVERTED PROPERTIES(\"parser\" = \"unicode\");"
  },
  {
    "label": "create_mtmv",
    "description": "Create an Asynchronous Multi-Table Materialized View (MTMV) with auto-refresh",
    "insertText": "CREATE MATERIALIZED VIEW IF NOT EXISTS ${1:demo_db}.${2:mv_user_summary}\nBUILD IMMEDIATE REFRESH COMPLETE\nON SCHEDULE EVERY 1 HOUR\nDISTRIBUTED BY HASH(${3:user_id}) BUCKETS 10\nPROPERTIES ('replication_num' = '1')\nAS\nSELECT\n  u.id AS user_id,\n  u.name,\n  COUNT(e.record_id) AS total_events\nFROM ${1:demo_db}.users u\nLEFT JOIN ${1:demo_db}.event_logs e ON u.id = e.user_id\nGROUP BY u.id, u.name;"
  },
  {
    "label": "tvf_s3_parquet",
    "description": "Query files directly on AWS S3 or compatible object storage using S3 Table-Valued Function",
    "insertText": "SELECT * FROM s3(\n  'uri' = 's3://${1:my-bucket}/data/${2:*.parquet}',\n  's3.access_key' = '${3:YOUR_AK}',\n  's3.secret_key' = '${4:YOUR_SK}',\n  's3.endpoint' = '${5:s3.us-east-1.amazonaws.com}',\n  'format' = 'parquet'\n)\nLIMIT 10;"
  },
  {
    "label": "tvf_hdfs_parquet",
    "description": "Query Hadoop HDFS files directly using HDFS Table-Valued Function",
    "insertText": "SELECT * FROM hdfs(\n  'uri' = 'hdfs://${1:namenode:8020}/user/hive/warehouse/${2:*.parquet}',\n  'fs.defaultFS' = 'hdfs://${1:namenode:8020}',\n  'format' = 'parquet'\n)\nLIMIT 10;"
  },
  {
    "label": "tvf_local_file",
    "description": "Query server local file directly using local() Table-Valued Function",
    "insertText": "SELECT * FROM local(\n  'file_path' = '${1:/path/to/data.csv}',\n  'format' = 'csv',\n  'column_separator' = ','\n)\nLIMIT 10;"
  },
  {
    "label": "create_job_scheduled",
    "description": "Create an automated periodic SQL Job in Apache Doris",
    "insertText": "CREATE JOB ${1:nightly_cleanup_job}\nON SCHEDULE EVERY 1 DAY\nSTARTS CURRENT_TIMESTAMP\nDO\nDELETE FROM ${2:demo_db.event_logs} WHERE event_time < NOW() - INTERVAL 90 DAY;"
  },
  {
    "label": "create_workload_group",
    "description": "Create a Workload Group for resource isolation, CPU limits, and memory quota",
    "insertText": "CREATE WORKLOAD GROUP IF NOT EXISTS ${1:analyst_group}\nPROPERTIES (\n  'cpu_share' = '10',\n  'memory_limit' = '30%',\n  'enable_memory_overcommit' = 'true'\n);\n\nSET workload_group = '${1:analyst_group}';"
  },
  {
    "label": "create_resource_ai_ollama",
    "description": "Create a local Ollama AI resource in Doris (OpenAI-compatible endpoint)",
    "insertText": "DROP RESOURCE IF EXISTS \"${1:ollama_gemma2}\";\nCREATE RESOURCE \"${1:ollama_gemma2}\"\nPROPERTIES (\n  'type' = 'ai',\n  'ai.provider_type' = 'local',\n  'ai.endpoint' = 'http://host.docker.internal:11434/api/chat',\n  'ai.model_name' = '${2:gemma2:2b}',\n  'ai.temperature' = '0.2',\n  'ai.max_token' = '2048',\n  'ai.max_retries' = '3'\n);\n\nSET default_ai_resource = '${1:ollama_gemma2}';"
  },
  {
    "label": "create_resource_ai_openai",
    "description": "Create an OpenAI LLM resource in Apache Doris",
    "insertText": "CREATE RESOURCE \"${1:openai_gpt4}\"\nPROPERTIES (\n  'type' = 'ai',\n  'ai.provider_type' = 'openai',\n  'ai.endpoint' = 'https://api.openai.com/v1',\n  'ai.model_name' = '${2:gpt-4o}',\n  'ai.api_key' = '${3:sk-your-api-key-here}',\n  'ai.temperature' = '0.7',\n  'ai.max_token' = '1024'\n);"
  },
  {
    "label": "ai_translate_query",
    "description": "Translate text using AI_TRANSLATE and a registered AI resource",
    "insertText": "SELECT AI_TRANSLATE(\n  '${1:ollama_gemma2}',\n  '${2:Hello, how are you?}',\n  '${3:Hindi}'\n) AS translated_text;"
  },
  {
    "label": "ai_summarize_query",
    "description": "Summarize a text column using AI_SUMMARIZE",
    "insertText": "SELECT \n  id,\n  AI_SUMMARIZE('${1:ollama_gemma2}', ${2:description}) AS summary\nFROM ${3:demo_db.tickets}\nLIMIT ${4:5};"
  },
  {
    "label": "ai_generate_query",
    "description": "Generate text response from a prompt using AI_GENERATE",
    "insertText": "SELECT AI_GENERATE(\n  '${1:ollama_gemma2}',\n  '${2:Write a 2-sentence introduction to Apache Doris}'\n) AS generated_response;"
  },
  {
    "label": "lateral_view_explode",
    "description": "Unnest an array column into multiple rows using LATERAL VIEW EXPLODE",
    "insertText": "SELECT\n  id,\n  tag_item\nFROM ${1:demo_db.articles}\nLATERAL VIEW EXPLODE(${2:tags_array}) tbl AS tag_item;"
  },
  {
    "label": "create_routine_load_kafka",
    "description": "Create a Doris Routine Load to continuously ingest streaming data from Apache Kafka",
    "insertText": "CREATE ROUTINE LOAD ${1:demo_db}.${2:kafka_cdr_load} ON ${3:cdr}\nCOLUMNS(record_id, timestamp, calling_num, called_num, status)\nPROPERTIES (\n  'desired_concurrent_number' = '3',\n  'max_batch_interval' = '20',\n  'format' = 'json'\n)\nFROM KAFKA (\n  'kafka_broker_list' = '${4:localhost:9092}',\n  'kafka_topic' = '${5:cdr-records}',\n  'property.group.id' = 'doris_cdr_consumer'\n);"
  },
  {
    "label": "show_backends",
    "description": "Inspect Apache Doris backend nodes status and disks",
    "insertText": "SHOW PROC '/backends';"
  },
  {
    "label": "show_frontends",
    "description": "Inspect Apache Doris frontend nodes status",
    "insertText": "SHOW PROC '/frontends';"
  },
  {
    "label": "show_routine_load",
    "description": "Inspect running Kafka routine loads in Doris database",
    "insertText": "SHOW ROUTINE LOAD FROM ${1:demo_db};"
  },
  {
    "label": "select_limit",
    "description": "Standard SELECT query with LIMIT",
    "insertText": "SELECT * FROM ${1:demo_db.users} LIMIT ${2:10};"
  }
];
