import {
  Client,
  GatewayIntentBits,
  Partials,
} from "discord.js";

import "dotenv/config";

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

client.once("ready", () => {
  console.log(`✅ Bot online como ${client.user?.tag}`);
});

client.login(token);
