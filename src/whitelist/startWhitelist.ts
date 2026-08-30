import {
  ButtonInteraction,
  ChannelType,
  PermissionFlagsBits,
} from "discord.js";

import { createSession } from "./sessionStore";
import { sendCurrentQuestion } from "./questionFlow";

export async function startWhitelist(interaction: ButtonInteraction) {
  if (!interaction.guild) {
    await interaction.reply({
      content: "❌ Este comando só pode ser usado dentro do servidor.",
      ephemeral: true,
    });
    return;
  }

  const moderatorRoleId = process.env.MODERATOR_ROLE_ID;

  if (!moderatorRoleId) {
    await interaction.reply({
      content: "❌ MODERATOR_ROLE_ID não está configurado.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({
    ephemeral: true,
  });

  // Impede mais de uma whitelist aberta pelo mesmo usuário.
  const existingChannel = interaction.guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildText &&
      channel.topic === `whitelist:${interaction.user.id}`
  );

  if (existingChannel) {
    await interaction.editReply(
      `⚠️ Você já possui uma whitelist em andamento: <#${existingChannel.id}>`
    );
    return;
  }

  const username =
    interaction.user.username
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .slice(0, 20) || interaction.user.id;

  const channel = await interaction.guild.channels.create({
    name: `wl-${username}`,
    type: ChannelType.GuildText,

    topic: `whitelist:${interaction.user.id}`,

    permissionOverwrites: [
      {
        id: interaction.guild.roles.everyone.id,
        deny: [
          PermissionFlagsBits.ViewChannel,
        ],
      },

      {
        id: interaction.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },

      {
        id: moderatorRoleId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
        ],
      },

      {
        id: interaction.client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.ManageChannels,
        ],
      },
    ],
  });

  await channel.send({
    content: [
      "☢️ **WHITELIST — OBLIVION STALKER**",
      "",
      `Bem-vindo, <@${interaction.user.id}>.`,
      "",
      "Sua aplicação será realizada neste canal privado.",
      "",
      "Você receberá **uma pergunta por vez**.",
      "Após responder, sua resposta será registrada e a etapa anterior será removida.",
      "",
      "Responda com atenção e utilizando suas próprias palavras.",
      "",
      "**A Zona apenas espera.**",
    ].join("\n"),
  });

  createSession({
    userId: interaction.user.id,
    channelId: channel.id,
    currentQuestion: 0,
    answers: [],
  });

  await sendCurrentQuestion(channel);

  await interaction.editReply(
    `✅ Sua whitelist foi iniciada em <#${channel.id}>.`
  );
}
