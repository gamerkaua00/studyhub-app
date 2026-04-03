// ============================================================
// StudyHub — bot/src/index.js
// Ponto de entrada do bot Discord
// ============================================================

require("dotenv").config();
const { Client, GatewayIntentBits, Collection } = require("discord.js");
const path = require("path");
const fs = require("fs");

const { setupServer } = require("./services/setupServer");

// ── Criação do cliente Discord ───────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent, // Necessário para ler conteúdo de mensagens
  ],
});

// ── Carrega comandos dinamicamente ──────────────────────────
client.commands = new Collection();
const commandsPath = path.join(__dirname, "commands");
const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith(".js"));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  client.commands.set(command.name, command);
  console.log(`[Bot] Comando carregado: ${command.name}`);
}

// ── Carrega eventos dinamicamente ───────────────────────────
const eventsPath = path.join(__dirname, "events");
const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".js"));

for (const file of eventFiles) {
  const event = require(path.join(eventsPath, file));
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args, client));
  } else {
    client.on(event.name, (...args) => event.execute(...args, client));
  }
}

// ── Login ────────────────────────────────────────────────────
client.login(process.env.DISCORD_BOT_TOKEN).catch((err) => {
  console.error("❌ Falha no login do bot:", err.message);
  process.exit(1);
});
