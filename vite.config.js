import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import http from "node:http";
import https from "node:https";

function livyProxyMiddleware(req, res, next) {
  if (!req.url.startsWith("/api")) return next();

  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      "access-control-allow-headers": "Content-Type, X-Livy-Target",
    });
    res.end();
    return;
  }

  const targetUrl = req.headers["x-livy-target"] || "http://localhost:8998";
  const path = req.url.replace(/^\/api/, "") || "/";
  const parsed = new URL(targetUrl);
  const isHttps = parsed.protocol === "https:";
  const transport = isHttps ? https : http;

  const options = {
    hostname: parsed.hostname,
    port: parsed.port || (isHttps ? 443 : 80),
    path,
    method: req.method,
    headers: { ...req.headers, host: parsed.host },
  };
  delete options.headers["x-livy-target"];

  const proxyReq = transport.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, {
      ...proxyRes.headers,
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, POST, PUT, DELETE, OPTIONS",
      "access-control-allow-headers": "Content-Type, X-Livy-Target",
    });
    proxyRes.pipe(res, { end: true });
  });

  proxyReq.on("error", (err) => {
    console.error("Livy proxy error:", err.message);
    if (!res.headersSent) {
      res.writeHead(502, { "Content-Type": "application/json" });
    }
    res.end(JSON.stringify({ msg: "Proxy error: " + err.message }));
  });

  req.pipe(proxyReq, { end: true });
}

function livyProxyPlugin() {
  return {
    name: "livy-proxy",
    configureServer(server) {
      server.middlewares.use(livyProxyMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(livyProxyMiddleware);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), livyProxyPlugin()],
});
