// ============================================================
// StudyHub — services/setupServer.js
// Cria automaticamente categorias e canais no servidor Discord
// Idempotente: não duplica se já existirem
// ============================================================

const { ChannelType, PermissionsBitField } = require("discord.js");

/**
 * Estrutura desejada:
 *   📚 Estudos
 *     └── #conteudos
 *   📅 Agenda
 *     └── #agenda
 *   📢 Avisos
 *     └── #avisos-provas
 */
const SERVER_STRUCTURE = [
  {
    category: "📚 Estudos",
    channels: ["conteudos"],
  },
  {
    category: "📅 Agenda",
    channels: ["agenda"],
  },
  {
    category: "📢 Avisos",
    channels: ["avisos-provas"],
  },
];

/**
 * Configura o servidor com as categorias e canais do StudyHub
 * @param {import('discord.js').Guild} guild
 */
const setupServer = async (guild) => {
  try {
    // Busca todos os canais atuais do servidor
    const existingChannels = await guild.channels.fetch();

    for (const { category: categoryName, channels } of SERVER_STRUCTURE) {
      // ── Verifica se a categoria já existe ─────────────────
      let category = existingChannels.find(
        (c) => c.type === ChannelType.GuildCategory && c.name === categoryName
      );

      if (!category) {
        category = await guild.channels.create({
          name: categoryName,
          type: ChannelType.GuildCategory,
        });
        console.log(`[Setup] ✅ Categoria criada: ${categoryName}`);
      } else {
        console.log(`[Setup] ⏭️  Categoria já existe: ${categoryName}`);
      }

      // ── Verifica/cria cada canal dentro da categoria ───────
      for (const channelName of channels) {
        const exists = existingChannels.find(
          (c) =>
            c.type === ChannelType.GuildText &&
            c.name === channelName &&
            c.parentId === category.id
        );

        if (!exists) {
          await guild.channels.create({
            name: channelName,
            type: ChannelType.GuildText,
            parent: category.id,
            topic: `Canal automático do StudyHub — ${categoryName}`,
          });
          console.log(`[Setup]   ✅ Canal criado: #${channelName}`);
        } else {
          console.log(`[Setup]   ⏭️  Canal já existe: #${channelName}`);
        }
      }
    }

    console.log(`[Setup] 🎉 Configuração do servidor "${guild.name}" concluída!\n`);
  } catch (err) {
    console.error(`[Setup] ❌ Erro ao configurar servidor:`, err.message);
  }
};

module.exports = { setupServer };
