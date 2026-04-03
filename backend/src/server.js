// ============================================================
// StudyHub — server.js
// Ponto de entrada: Express API + conexão MongoDB + cron jobs
// ============================================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const cron = require("node-cron");

const contentRoutes = require("./routes/contentRoutes");
const subjectRoutes = require("./routes/subjectRoutes");
const { runScheduler } = require("./services/scheduler");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middlewares ──────────────────────────────────────────────
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173",
    "http://localhost:5173",
    "http://localhost:4173",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Rotas ────────────────────────────────────────────────────
app.use("/api/contents", contentRoutes);
app.use("/api/subjects", subjectRoutes);

// Health check — Railway verifica este endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// ── Conexão MongoDB ──────────────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB conectado");

    // Inicia o servidor HTTP somente após a conexão com o banco
    app.listen(PORT, () => {
      console.log(`🚀 StudyHub API rodando na porta ${PORT}`);
    });

    // ── Cron: verifica notificações a cada minuto ────────────
    // Formato: "*/1 * * * *" = todo minuto
    cron.schedule("*/1 * * * *", async () => {
      await runScheduler();
    });

    console.log("⏰ Scheduler de notificações iniciado (verifica a cada minuto)");
  })
  .catch((err) => {
    console.error("❌ Erro ao conectar MongoDB:", err.message);
    process.exit(1);
  });

// ── Tratamento de erros não capturados ───────────────────────
process.on("unhandledRejection", (reason) => {
  console.error("UnhandledRejection:", reason);
});

module.exports = app;
