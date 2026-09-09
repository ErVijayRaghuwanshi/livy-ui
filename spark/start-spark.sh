#!/usr/bin/env bash
set -eo pipefail

mkdir -p /opt/spark/event_logs

HISTORY_PID=""
LIVY_PID=""
MASTER_PID=""

cleanup() {
  echo "[Lifecycle Manager] Received shutdown signal (SIGTERM/SIGINT). Initiating graceful teardown..."

  # 1. Stop livy-next first so it drains HTTP and sends ReleaseSession RPCs for all active sessions
  if [ -n "$LIVY_PID" ] && kill -0 "$LIVY_PID" 2>/dev/null; then
    echo "[Lifecycle Manager] Stopping livy-next (PID $LIVY_PID)..."
    kill -TERM "$LIVY_PID" 2>/dev/null || true
    wait "$LIVY_PID" 2>/dev/null || true
    echo "[Lifecycle Manager] livy-next stopped gracefully."
  fi

  # 2. Stop Spark Connect Server using official stop script
  echo "[Lifecycle Manager] Stopping Spark Connect Server..."
  if [ -f /opt/spark/sbin/stop-connect-server.sh ]; then
    /opt/spark/sbin/stop-connect-server.sh || true
  fi

  # Wait for any lingering SparkConnectServer Java process to flush logs and terminate
  local wait_count=0
  while pgrep -f "org.apache.spark.sql.connect.service.SparkConnectServer" >/dev/null 2>&1; do
    sleep 1
    wait_count=$((wait_count + 1))
    if [ $wait_count -ge 12 ]; then
      echo "[Lifecycle Manager] Spark Connect Server stop timed out after 12s; sending SIGTERM..."
      pkill -TERM -f "org.apache.spark.sql.connect.service.SparkConnectServer" 2>/dev/null || true
      break
    fi
  done
  echo "[Lifecycle Manager] Spark Connect Server stopped."

  # 3. Stop Spark History Server
  echo "[Lifecycle Manager] Stopping Spark History Server..."
  if [ -f /opt/spark/sbin/stop-history-server.sh ]; then
    /opt/spark/sbin/stop-history-server.sh || true
  fi
  if [ -n "$HISTORY_PID" ] && kill -0 "$HISTORY_PID" 2>/dev/null; then
    kill -TERM "$HISTORY_PID" 2>/dev/null || true
    wait "$HISTORY_PID" 2>/dev/null || true
  fi
  echo "[Lifecycle Manager] Spark History Server stopped."

  # 4. Stop Spark Master
  if [ -n "$MASTER_PID" ] && kill -0 "$MASTER_PID" 2>/dev/null; then
    echo "[Lifecycle Manager] Stopping Spark Master (PID $MASTER_PID)..."
    kill -TERM "$MASTER_PID" 2>/dev/null || true
    wait "$MASTER_PID" 2>/dev/null || true
    echo "[Lifecycle Manager] Spark Master stopped."
  fi

  echo "[Lifecycle Manager] Graceful teardown complete. Exiting cleanly."
  exit 0
}

# Trap signals for graceful shutdown
trap cleanup SIGTERM SIGINT

echo "[Lifecycle Manager] Starting Spark cluster services..."

# 1. Start History Server
/opt/spark/bin/spark-class \
  -Dspark.history.fs.logDirectory=file:/opt/spark/event_logs \
  -Dspark.history.ui.port=18080 \
  org.apache.spark.deploy.history.HistoryServer &
HISTORY_PID=$!

# 2. Start Spark Connect Server daemon (in background subshell after short wait for Master)
(
  sleep 4
  /opt/spark/sbin/start-connect-server.sh \
    --master "local[*]" \
    --name livy-next \
    --conf spark.driver.host=spark-master
) &

# 3. Start livy-next REST server with built-in CORS
(
  sleep 8
  exec /usr/local/bin/livy-next \
    --addr ":${LIVY_PORT:-8998}" \
    --idle-timeout "${LIVY_IDLE_TIMEOUT:-72h}" \
    --spark-remote "sc://spark-master:15002" \
    --spark-ui-url "http://localhost:${SPARK_UI_PORT:-4141}" \
    --cors-allowed-origins "*"
) &
LIVY_PID=$!

# 4. Start Spark Master in background and wait for it
/opt/spark/bin/spark-class \
  org.apache.spark.deploy.master.Master \
  --host spark-master \
  --port 7077 \
  --webui-port 8080 &
MASTER_PID=$!

echo "[Lifecycle Manager] Services started (Master PID: $MASTER_PID, History PID: $HISTORY_PID, Livy PID: $LIVY_PID)."

# Wait for Master; wait is interrupted when SIGTERM/SIGINT is received and trapped
wait "$MASTER_PID"
