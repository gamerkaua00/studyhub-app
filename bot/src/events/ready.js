// ============================================================
// StudyHub — events/ready.js
// Executado quando o bot está online
// ============================================================

const { setupServer } = require("../services/setupServer");

module.exports = {
  name: "ready",
  once: true, // Dispara uma única vez
  async execute(client) {
    console.log(`\n✅ Bot online como: ${client.user.tag}`);
    console.log(`📡 Conectado em ${client.guilds.cache.size} servidor(es)\n`);

    // Define o status de atividade do bot
    client.user.setPresence({
      activities: [{ name: "📚 StudyHub | !ajuda" }],
      status: "online",
    });

    // Configura automaticamente as categorias e canais do servidor
    for (const [, guild] of client.guilds.cache) {
      console.log(`[Setup] Configurando servidor: ${guild.name}`);
      await setupServer(guild);
    }
  },
};
