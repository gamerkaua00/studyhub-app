// ============================================================
// StudyHub v2 — routes/publicRoutes.js
// Rotas sem autenticação — visualização pública da agenda
// ============================================================

const express = require("express");
const router  = express.Router();
const Content = require("../models/Content");

// GET /api/public/agenda?month=4&year=2026
router.get("/agenda", async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};

    if (month && year) {
      const m = String(month).padStart(2, "0");
      filter.date = { $gte: `${year}-${m}-01`, $lte: `${year}-${m}-31` };
    }

    const contents = await Content.find(filter)
      .select("title subject subjectColor type date time description")
      .sort({ date: 1, time: 1 });

    res.json({ success: true, data: contents });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/public/today
router.get("/today", async (req, res) => {
  try {
    const now = new Date();
    const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const today = brt.toISOString().split("T")[0];
    const contents = await Content.find({ date: today })
      .select("title subject subjectColor type date time description")
      .sort({ time: 1 });
    res.json({ success: true, data: contents, date: today });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
