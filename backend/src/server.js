// ============================================================
// StudyHub v2 — server.js
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");
const https = require("https");
const http = require("http");

const contentRoutes  = require("./routes/contentRoutes");
const subjectRoutes  = require("./routes/subjectRoutes");
const authRoutes     = require("./routes/authRoutes");
const publicRoutes   = require("./routes/publicRoutes");
const { runScheduler } = require("./services/scheduler");
const { requireAuth } = require("./middleware/auth");

const app  = express();
const PORT = process.env.PORT || 3001;

// ── CORS ─────────────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:4173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rotas públicas (sem auth) ─────────────────────────────────
app.use("/api/auth",   authRoutes);
app.use("/api/public", publicRoutes);

// ── Rotas protegidas ─────────────────────────────────────────
app.use("/api/contents", requireAuth, contentRoutes);
app.use("/api/subjects", requireAuth, subjectRoutes);

// ── Health check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() });
});

// ── Keep-alive: faz ping em si mesmo a cada 10 minutos ───────
// Isso evita que o Render durma e perca notificações agendadas
const keepAlive = () => {
  const url = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;
  const lib = url.startsWith("https") ? https : http;
  lib.get(`${url}/health`, (res) => {
    console.log(`[Keep-alive] Ping OK — status ${res.statusCode}`);
  }).on("error", (err) => {
    console.warn("[Keep-alive] Ping falhou:", err.message);
  });
};

// ── MongoDB ───────────────────────────────────────────────────
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB conectado");

    app.listen(PORT, () => {
      console.log(`🚀 StudyHub API v2 rodando na porta ${PORT}`);
    });

    // Notificações: todo minuto
    cron.schedule("*/1 * * * *", async () => {
      await runScheduler();
    });

    // Keep-alive: a cada 10 minutos
    cron.schedule("*/10 * * * *", keepAlive);

    console.log("⏰ Scheduler iniciado");
    console.log("💓 Keep-alive iniciado (ping a cada 10 min)");
  })
  .catch((err) => {
    console.error("❌ Erro MongoDB:", err.message);
    process.exit(1);
  });

process.on("unhandledRejection", (reason) => {
  console.error("UnhandledRejection:", reason);
});

module.exports = app;
