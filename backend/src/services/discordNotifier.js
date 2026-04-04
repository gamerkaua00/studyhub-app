// ============================================================
// StudyHub v2 — services/discordNotifier.js
// ============================================================

const https = require("https");

const DISCORD_API_BASE = "https://discord.com/api/v10";

const findChannelId = async (channelName) => {
  const guildId = process.env.DISCORD_GUILD_ID;
  const token   = process.env.DISCORD_BOT_TOKEN;
  if (!guildId || !token) return null;

  return new Promise((resolve) => {
    const options = {
      hostname: "discord.com",
      path: `/api/v10/guilds/${guildId}/channels`,
      method: "GET",
      headers: { Authorization: `Bot ${token}`, "Content-Type": "application/json" },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try {
          const channels = JSON.parse(data);
          const normalized = channelName.replace("#", "").toLowerCase();
          const found = channels.find((c) => c.name?.toLowerCase() === normalized && c.type === 0);
          resolve(found ? found.id : null);
        } catch { resolve(null); }
      });
    });
    req.on("error", () => resolve(null));
    req.end();
  });
};

const sendToChannel = (channelId, body) => {
  const token   = process.env.DISCORD_BOT_TOKEN;
  const payload = JSON.stringify(body);

  return new Promise((resolve) => {
    const options = {
      hostname: "discord.com",
      path: `/api/v10/channels/${channelId}/messages`,
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[Notifier] ✅ Enviado para canal ID ${channelId}`);
        } else {
          console.error(`[Notifier] ❌ Erro ${res.statusCode}: ${data}`);
        }
        resolve();
      });
    });
    req.on("error", (e) => { console.error("[Notifier] Erro:", e.message); resolve(); });
    req.write(payload);
    req.end();
  });
};

const sendDiscordNotification = async (channelName, content = "", embed = null) => {
  if (!process.env.DISCORD_BOT_TOKEN) return;
  const channelId = await findChannelId(channelName);
  if (!channelId) {
    console.warn(`[Notifier] Canal "${channelName}" não encontrado.`);
    return;
  }
  await sendToChannel(channelId, {
    content: content || "",
    embeds: embed ? [embed] : [],
  });
};

// Avisa o Mazur sobre novo pedido de cadastro no canal admin-teste
const notifyAdminNewRequest = async (username, role) => {
  const embed = {
    title: "🔔 Novo pedido de cadastro",
    description: `**${username}** quer se cadastrar como **${role}**.\nAcesse o painel para aprovar ou rejeitar.`,
    color: 0xFEE75C,
    timestamp: new Date().toISOString(),
    footer: { text: "StudyHub • Sistema de cadastro" },
  };
  await sendDiscordNotification("admin-teste", "", embed);
};

const hexToDecimal = (hex) => parseInt((hex || "#5865F2").replace("#", ""), 16);

module.exports = { sendDiscordNotification, notifyAdminNewRequest, findChannelId, hexToDecimal };
