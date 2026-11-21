import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

const basePath = process.env.VITE_BASE_PATH || '/livy-ui/';

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "livy-ui.png",
        "robots.txt",
        "sitemap.xml",
        "pwa-192.png",
        "pwa-512.png"
      ],
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB
      },
      manifest: {
        name: "Livy UI - SQL & AI Workbench",
        short_name: "Livy UI",
        description: "Web-based SQL editor and AI workbench for Apache Spark and Apache Doris.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "any",
        scope: basePath,
        start_url: basePath,
        categories: ["developer", "productivity", "utilities", "business"],
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
          },
        ],
        shortcuts: [
          {
            name: "New Spark Query",
            short_name: "Spark Query",
            description: "Open a new Spark SQL editor tab",
            url: `${basePath}?engine=spark`,
            icons: [{ src: "pwa-192.png", sizes: "192x192" }],
          },
          {
            name: "New Doris Query",
            short_name: "Doris Query",
            description: "Open a new Apache Doris SQL editor tab",
            url: `${basePath}?engine=doris`,
            icons: [{ src: "pwa-192.png", sizes: "192x192" }],
          },
          {
            name: "AI Copilot",
            short_name: "Copilot",
            description: "Launch AI Copilot assistant",
            url: `${basePath}?chat=open`,
            icons: [{ src: "pwa-192.png", sizes: "192x192" }],
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      output: {
        manualChunks: {
          "dt-sql-parser": ["dt-sql-parser"],
          "monaco": ["monaco-editor"],
        },
      },
    },
  },
});
