const {
  REST,
  Routes,
  SlashCommandBuilder,
} = require("discord.js");

async function registerCommands() {
  const token = process.env.DISCORD_TOKEN;
  const clientId =
    process.env.DISCORD_CLIENT_ID;
  const guildId =
    process.env.DISCORD_GUILD_ID;

  if (!token || !clientId || !guildId) {
    throw new Error(
      "DISCORD_TOKEN, DISCORD_CLIENT_ID ou DISCORD_GUILD_ID não configurado."
    );
  }

  const commands = [
    new SlashCommandBuilder()
      .setName("whitelist-painel")
      .setDescription(
        "Publica o painel oficial de whitelist."
      ),
  ].map((command) => command.toJSON());

  const rest = new REST({
    version: "10",
  }).setToken(token);

  await rest.put(
    Routes.applicationGuildCommands(
      clientId,
      guildId
    ),
    {
      body: commands,
    }
  );

  console.log("✅ Comandos registrados.");
}

module.exports = {
  registerCommands,
};
