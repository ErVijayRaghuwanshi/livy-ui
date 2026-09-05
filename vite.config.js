import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  base: '/livy-ui/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "robots.txt", "sitemap.xml", "pwa-192.png", "pwa-512.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15 MB
      },
      manifest: {
        name: "Livy SQL UI",
        short_name: "LivyUI",
        description: "Modern, feature-rich SQL editor for Apache Spark via Apache Livy.",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        scope: "/livy-ui/",
        start_url: "/livy-ui/",
        icons: [
          {
            src: "pwa-192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "favicon.svg",
            sizes: "any",
            type: "image/svg+xml",
            purpose: "any maskable",
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
