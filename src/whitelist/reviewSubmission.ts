import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

import { whitelistQuestions } from "../config/questions";

type ReviewSubmissionParams = {
  client: Client;
  guildId: string;
  userId: string;
  username: string;
  answers: string[];
};

export async function sendWhitelistForReview({
  client,
  guildId,
  userId,
  username,
  answers,
}: ReviewSubmissionParams) {
  const reviewChannelId = process.env.REVIEW_CHANNEL_ID;

  if (!reviewChannelId) {
    throw new Error("REVIEW_CHANNEL_ID não configurado.");
  }

  const guild = await client.guilds.fetch(guildId);
  const channel = await guild.channels.fetch(reviewChannelId);

  if (!channel || !(channel instanceof TextChannel)) {
    throw new Error("Canal de revisão inválido.");
  }

  const fields = whitelistQuestions.map((question, index) => ({
    name: `${index + 1}. ${question}`.slice(0, 256),
    value: (answers[index] || "Sem resposta").slice(0, 1024),
  }));

  const embed = new EmbedBuilder()
    .setTitle("☢️ NOVA WHITELIST")
    .setDescription(
      [
        `**Discord:** <@${userId}>`,
        `**Usuário:** ${username}`,
        "",
        "**Status:** 🟡 Pendente",
      ].join("\n")
    )
    .addFields(fields)
    .setTimestamp();

  const approveButton = new ButtonBuilder()
    .setCustomId(`whitelist:approve:${userId}`)
    .setLabel("Aprovar")
    .setEmoji("✅")
    .setStyle(ButtonStyle.Success);

  const denyButton = new ButtonBuilder()
    .setCustomId(`whitelist:deny:${userId}`)
    .setLabel("Reprovar")
    .setEmoji("❌")
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    approveButton,
    denyButton
  );

  await channel.send({
    embeds: [embed],
    components: [row],
  });
}
