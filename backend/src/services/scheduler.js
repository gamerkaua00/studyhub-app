// ============================================================
// StudyHub — services/scheduler.js
// NÚCLEO DO SISTEMA: verifica conteúdos a cada minuto e
// dispara notificações Discord no momento certo
// ============================================================

const Content = require("../models/Content");
const { sendDiscordNotification } = require("./discordNotifier");

/**
 * Retorna a data/hora atual no fuso de Brasília (UTC-3)
 * sem depender de nenhuma biblioteca externa de timezone
 */
const getBrasiliaDateTime = () => {
  const now = new Date();
  // UTC-3: subtrai 3 horas em milissegundos
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  const date = brt.toISOString().split("T")[0]; // "YYYY-MM-DD"
  const time = brt.toISOString().split("T")[1].substring(0, 5); // "HH:MM"
  return { date, time, brt };
};

/**
 * Retorna a data de amanhã no fuso de Brasília
 */
const getTomorrowBrasilia = () => {
  const now = new Date();
  const brt = new Date(now.getTime() - 3 * 60 * 60 * 1000);
  brt.setDate(brt.getDate() + 1);
  return brt.toISOString().split("T")[0];
};

/**
 * Função principal chamada pelo node-cron a cada minuto.
 * Verifica dois cenários:
 *   1. Conteúdos cujo horário chegou agora → notificação principal
 *   2. Provas de amanhã → aviso antecipado (executado uma vez ao dia às 08:00)
 */
const runScheduler = async () => {
  try {
    const { date, time } = getBrasiliaDateTime();
    const tomorrow = getTomorrowBrasilia();

    console.log(`[Scheduler] Verificando ${date} ${time}...`);

    // ── 1. Notificações principais (no horário exato) ────────
    const dueContents = await Content.find({
      date,
      time,
      "notifications.sentMain": false,
    });

    for (const content of dueContents) {
      await sendMainNotification(content);
      await Content.findByIdAndUpdate(content._id, {
        $set: { "notifications.sentMain": true },
      });
    }

    // ── 2. Aviso de prova amanhã (dispara às 08:00 BRT) ──────
    if (time === "08:00") {
      const tomorrowExams = await Content.find({
        date: tomorrow,
        type: "Prova",
        "notifications.sentDayBefore": false,
      });

      for (const exam of tomorrowExams) {
        await sendDayBeforeNotification(exam);
        await Content.findByIdAndUpdate(exam._id, {
          $set: { "notifications.sentDayBefore": true },
        });
      }

      if (tomorrowExams.length > 0) {
        console.log(`[Scheduler] ${tomorrowExams.length} aviso(s) de prova amanhã enviados`);
      }
    }

    if (dueContents.length > 0) {
      console.log(`[Scheduler] ${dueContents.length} notificação(ões) principal(is) enviadas`);
    }
  } catch (err) {
    console.error("[Scheduler] Erro ao executar:", err.message);
  }
};

// ── Monta e envia a notificação principal ────────────────────
const sendMainNotification = async (content) => {
  const typeEmoji = {
    Aula: "📖",
    Revisão: "🔄",
    Prova: "📝",
  };

  const embed = {
    title: `${typeEmoji[content.type] || "📚"} ${content.title}`,
    color: hexToDecimal(content.subjectColor || "#5865F2"),
    fields: [
      { name: "📌 Matéria", value: content.subject, inline: true },
      { name: "🏷️ Tipo",   value: content.type,    inline: true },
      { name: "🕐 Horário", value: content.time,    inline: true },
    ],
    timestamp: new Date().toISOString(),
    footer: { text: "StudyHub • Sistema de Estudos" },
  };

  if (content.description) {
    embed.description = content.description;
  }

  if (content.resourceLink) {
    embed.fields.push({
      name: "🔗 Material",
      value: `[Acessar recurso](${content.resourceLink})`,
      inline: false,
    });
  }

  // Mensagem de ping adicional para provas
  const pingMsg = content.type === "Prova"
    ? "@here 📢 **PROVA HOJE!** Boa sorte a todos!\n"
    : "";

  await sendDiscordNotification(content.discordChannel, pingMsg, embed);
};

// ── Monta e envia o aviso de "prova amanhã" ──────────────────
const sendDayBeforeNotification = async (content) => {
  const embed = {
    title: "⚠️ Prova Amanhã!",
    description: `**${content.title}**\nMatéria: **${content.subject}**\nHorário: **${content.time}**`,
    color: 0xFEE75C, // amarelo de alerta
    timestamp: new Date().toISOString(),
    footer: { text: "StudyHub • Lembrete automático" },
  };

  await sendDiscordNotification(
    content.discordChannel,
    "@here 🔔 **Lembrete:** Prova amanhã!",
    embed
  );
};

// ── Utilitário: converte cor hex para decimal (exigido pela API do Discord) ──
const hexToDecimal = (hex) => {
  return parseInt(hex.replace("#", ""), 16);
};

module.exports = { runScheduler };
