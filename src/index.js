const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
} = require("discord.js");

require("dotenv").config();

const { startWhitelist } = require("./whitelist/startWhitelist");
const {
  handleWhitelistAnswer,
} = require("./whitelist/questionFlow");

const {
  handleReviewDecision,
} = require("./whitelist/reviewDecision");

const {
  registerCommands,
} = require("./commands/registerCommands");

const {
  sendWhitelistPanel,
} = require("./commands/whitelistPanel");

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

client.once(Events.ClientReady, async (readyClient) => {
  console.log(
    `✅ Bot online como ${readyClient.user.tag}`
  );

  try {
    await registerCommands();
  } catch (error) {
    console.error(
      "❌ Erro ao registrar comandos:",
      error
    );
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  try {
    if (interaction.isChatInputCommand()) {
      if (
        interaction.commandName ===
        "whitelist-painel"
      ) {
        await sendWhitelistPanel(interaction);
      }

      return;
    }

    if (interaction.isButton()) {
      if (
        interaction.customId ===
        "whitelist:start"
      ) {
        await startWhitelist(interaction);
        return;
      }

      if (
        interaction.customId.startsWith(
          "whitelist:approve:"
        ) ||
        interaction.customId.startsWith(
          "whitelist:deny:"
        )
      ) {
        await handleReviewDecision(interaction);
        return;
      }
    }
  } catch (error) {
    console.error(
      "❌ Erro ao processar interação:",
      error
    );

    if (interaction.isRepliable()) {
      if (
        interaction.replied ||
        interaction.deferred
      ) {
        await interaction
          .followUp({
            content:
              "❌ Ocorreu um erro ao processar esta ação.",
            flags: 64,
          })
          .catch(() => {});
      } else {
        await interaction
          .reply({
            content:
              "❌ Ocorreu um erro ao processar esta ação.",
            flags: 64,
          })
          .catch(() => {});
      }
    }
  }
});

client.on(Events.MessageCreate, async (message) => {
  try {
    await handleWhitelistAnswer(message);
  } catch (error) {
    console.error(
      "❌ Erro ao processar resposta da whitelist:",
      error
    );
  }
});

client.login(token);
