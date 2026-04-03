// ============================================================
// StudyHub — services/discordNotifier.js
// Envia mensagens para canais do Discord via Bot API REST
// Não usa discord.js aqui para manter o backend leve
// ============================================================

const https = require("https");

const DISCORD_API_BASE = "https://discord.com/api/v10";

/**
 * Busca os canais do servidor e retorna o ID pelo nome
 * @param {string} channelName - Nome do canal (sem #)
 * @returns {string|null} ID do canal ou null
 */
const findChannelId = async (channelName) => {
  const guildId = process.env.DISCORD_GUILD_ID;
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!guildId || !token) return null;

  return new Promise((resolve) => {
    const options = {
      hostname: "discord.com",
      path: `/api/v10/guilds/${guildId}/channels`,
      method: "GET",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const channels = JSON.parse(data);
          const normalized = channelName.replace("#", "").toLowerCase();
          const found = channels.find(
            (c) => c.name?.toLowerCase() === normalized && c.type === 0
          );
          resolve(found ? found.id : null);
        } catch {
          resolve(null);
        }
      });
    });

    req.on("error", () => resolve(null));
    req.end();
  });
};

/**
 * Envia uma mensagem com embed para um canal do Discord
 * @param {string} channelName - Nome do canal (ex: "conteudos" ou "#conteudos")
 * @param {string} content - Texto da mensagem (pode ser vazio)
 * @param {object} embed - Objeto embed do Discord
 */
const sendDiscordNotification = async (channelName, content = "", embed = null) => {
  const token = process.env.DISCORD_BOT_TOKEN;

  if (!token) {
    console.warn("[DiscordNotifier] DISCORD_BOT_TOKEN não configurado. Notificação ignorada.");
    return;
  }

  // Resolve o ID do canal pelo nome
  const channelId = await findChannelId(channelName);
  if (!channelId) {
    console.warn(`[DiscordNotifier] Canal "${channelName}" não encontrado no servidor.`);
    return;
  }

  const body = JSON.stringify({
    content: content || "",
    embeds: embed ? [embed] : [],
  });

  return new Promise((resolve) => {
    const options = {
      hostname: "discord.com",
      path: `/api/v10/channels/${channelId}/messages`,
      method: "POST",
      headers: {
        Authorization: `Bot ${token}`,
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`[DiscordNotifier] ✅ Mensagem enviada para #${channelName}`);
        } else {
          console.error(`[DiscordNotifier] ❌ Erro ${res.statusCode}: ${data}`);
        }
        resolve();
      });
    });

    req.on("error", (err) => {
      console.error("[DiscordNotifier] Erro de rede:", err.message);
      resolve();
    });

    req.write(body);
    req.end();
  });
};

module.exports = { sendDiscordNotification, findChannelId };
