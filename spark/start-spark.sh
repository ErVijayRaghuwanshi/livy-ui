#!/bin/bash
set -e

# Start Spark History Server in background
/opt/spark/sbin/start-history-server.sh &

# Start Spark Master in foreground
exec /opt/spark/bin/spark-class org.apache.spark.deploy.master.Master --ip 0.0.0.0 --port 7077 --webui-port 8080
