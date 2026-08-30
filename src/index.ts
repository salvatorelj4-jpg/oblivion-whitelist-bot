import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";

import "dotenv/config";

import { startWhitelist } from "./whitelist/startWhitelist";
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
  try {
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "whitelist-painel") {
        await sendWhitelistPanel(interaction);
      }

      return;
    }

    if (interaction.isButton()) {
      if (interaction.customId === "whitelist:start") {
        await startWhitelist(interaction);
      }
    }
  } catch (error) {
    console.error("❌ Erro ao processar interação:", error);

    if (interaction.isRepliable()) {
      if (interaction.replied || interaction.deferred) {
        await interaction
          .followUp({
            content: "❌ Ocorreu um erro ao processar esta ação.",
            ephemeral: true,
          })
          .catch(() => {});
      } else {
        await interaction
          .reply({
            content: "❌ Ocorreu um erro ao processar esta ação.",
            ephemeral: true,
          })
          .catch(() => {});
      }
    }
  }
});

client.login(token);
