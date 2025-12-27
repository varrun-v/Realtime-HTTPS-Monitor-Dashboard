const express = require("express");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const clients = new Set();

/* ---------------- WebSocket ---------------- */

wss.on("connection", (ws) => {
  clients.add(ws);

  ws.on("close", () => {
    clients.delete(ws);
  });
});

/* ---------------- Metrics Middleware ---------------- */

app.use((req, res, next) => {
  const startTime = process.hrtime.bigint();

  res.on("finish", () => {
    const endTime = process.hrtime.bigint();
    const latencyMs = Number(endTime - startTime) / 1e6;

    const metric = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latency: latencyMs.toFixed(2),
      timestamp: Date.now(),
    };

    const payload = JSON.stringify(metric);

    for (const client of clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    }

    // Useful while developing
    console.log(metric);
  });

  next();
});

/* ---------------- Test Routes ---------------- */

app.get("/test", (req, res) => {
  setTimeout(() => {
    res.json({ ok: true });
  }, Math.random() * 500);
});

app.post("/api/data", (req, res) => {
  res.status(201).json({ message: "created" });
});

/* ---------------- Start Server ---------------- */

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`HTTP server running on http://localhost:${PORT}`);
});
