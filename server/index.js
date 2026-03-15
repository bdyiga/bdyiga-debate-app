import "dotenv/config";
import http from "http";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import app from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 3000;

async function start() {
  const server = express();
  server.use(app);

  if (isProduction) {
    const distPath = path.join(__dirname, "../dist");
    server.use(express.static(distPath));
    server.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } else {
    // Share the HTTP server with Vite so HMR WebSocket doesn't need a separate port
    const httpServer = http.createServer(server);
    const { createServer } = await import("vite");
    const vite = await createServer({
      server: { middlewareMode: true, hmr: { server: httpServer } },
      appType: "spa",
    });
    server.use(vite.middlewares);
    httpServer.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  }
}

start();
