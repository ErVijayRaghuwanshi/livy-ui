#!/bin/bash
set -e

mkdir -p /opt/spark/event_logs

# Start Spark History Server in background
/opt/spark/bin/spark-class -Dspark.history.fs.logDirectory=file:/opt/spark/event_logs -Dspark.history.ui.port=18080 org.apache.spark.deploy.history.HistoryServer &

# Start Spark Connect Server in background
(sleep 5 && /opt/spark/sbin/start-connect-server.sh --master local[*] --name livy-next --conf spark.driver.host=spark-master) &

# Start livy-next REST server with built-in CORS enabled in background
(sleep 10 && /usr/local/bin/livy-next --addr :${LIVY_PORT:-8998} --idle-timeout ${LIVY_IDLE_TIMEOUT:-10m} --spark-remote sc://spark-master:15002 --cors-allowed-origins "*") &

# Start Spark Master in foreground
exec /opt/spark/bin/spark-class org.apache.spark.deploy.master.Master --host spark-master --port 7077 --webui-port 8080
