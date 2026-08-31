const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  PermissionFlagsBits,
} = require("discord.js");

async function sendWhitelistPanel(interaction) {
  if (
    !interaction.memberPermissions?.has(
      PermissionFlagsBits.ManageGuild
    )
  ) {
    await interaction.reply({
      content:
        "❌ Você não possui permissão para publicar o painel de whitelist.",
      flags: 64,
    });

    return;
  }

  const embed = new EmbedBuilder()
    .setTitle(
      "☢️ OBLIVION STALKER — WHITELIST"
    )
    .setDescription(
      [
        "**2012. A Zona continua viva.**",
        "",
        "Antes de iniciar sua jornada, todo novo Stalker deve passar pelo processo de whitelist.",
        "",
        "A aplicação avaliará seu conhecimento das regras, compreensão da lore e capacidade de criar um personagem coerente com o universo do servidor.",
        "",
        "Leia atentamente as regras e a lore antes de começar.",
        "",
        "**Clique no botão abaixo para iniciar sua whitelist.**",
        "",
        "*A Zona não pertence a ninguém. A Zona apenas espera.*",
      ].join("\n")
    );

  const button = new ButtonBuilder()
    .setCustomId("whitelist:start")
    .setLabel("Iniciar Whitelist")
    .setEmoji("☢️")
    .setStyle(ButtonStyle.Primary);

  const row =
    new ActionRowBuilder().addComponents(
      button
    );

  await interaction.reply({
    embeds: [embed],
    components: [row],
  });
}

module.exports = {
  sendWhitelistPanel,
};
