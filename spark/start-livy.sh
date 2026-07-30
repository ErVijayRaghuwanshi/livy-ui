#!/bin/bash
set -e

# Start Nginx CORS reverse proxy in background
nginx -c /opt/nginx.conf &

# Start Livy server in foreground
exec /opt/livy/bin/livy-server
