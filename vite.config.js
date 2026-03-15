import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { copyFileSync } from "fs";

export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-404",
      closeBundle() {
        try {
          copyFileSync("dist/index.html", "dist/404.html");
        } catch {
          // noop during dev
        }
      },
    },
  ],
  base: process.env.VITE_BASE_PATH || "/",
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
