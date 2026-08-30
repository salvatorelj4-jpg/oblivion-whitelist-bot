import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";

import "dotenv/config";

import { registerCommands } from "./commands/registerCommands";
import { sendWhitelistPanel } from "./commands/whitelistPanel";

const token = process.env.DISCORD_TOKEN;

if (!token) {
  throw new Error("DISCORD_TOKEN não configurado.");
}

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [
    Partials.Channel,
    Partials.Message,
  ],
});

client.once("ready", async () => {
  console.log(`✅ Bot online como ${client.user?.tag}`);

  try {
    await registerCommands();
  } catch (error) {
    console.error("❌ Erro ao registrar comandos:", error);
  }
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) {
    return;
  }

  if (interaction.commandName === "whitelist-painel") {
    await sendWhitelistPanel(interaction);
  }
});

client.login(token);
