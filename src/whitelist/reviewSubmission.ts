import {
  ButtonInteraction,
  EmbedBuilder,
  TextChannel,
} from "discord.js";

const decidedSubmissions = new Set<string>();

export async function handleReviewDecision(
  interaction: ButtonInteraction
) {
  if (!interaction.guild) return;

  // Confirma o clique imediatamente sem mostrar mensagem ao moderador.
  await interaction.deferUpdate();

  const moderatorRoleId = process.env.MODERATOR_ROLE_ID;
  const whitelistRoleId = process.env.WHITELIST_ROLE_ID;
  const approvedChannelId = process.env.APPROVED_CHANNEL_ID;
  const deniedChannelId = process.env.DENIED_CHANNEL_ID;

  if (
    !moderatorRoleId ||
    !whitelistRoleId ||
    !approvedChannelId ||
    !deniedChannelId
  ) {
    await interaction.followUp({
      content: "❌ Configuração da whitelist incompleta.",
      ephemeral: true,
    });
    return;
  }

  try {
    const moderator = await interaction.guild.members.fetch(
      interaction.user.id
    );

    if (!moderator.roles.cache.has(moderatorRoleId)) {
      await interaction.followUp({
        content: "❌ Você não possui permissão para avaliar whitelist.",
        ephemeral: true,
      });
      return;
    }

    const parts = interaction.customId.split(":");
    const action = parts[1];
    const userId = parts[2];

    if (!userId) {
      await interaction.followUp({
        content: "❌ Usuário da whitelist não identificado.",
        ephemeral: true,
      });
      return;
    }

    const decisionKey = `${interaction.message.id}:${userId}`;

    if (decidedSubmissions.has(decisionKey)) {
      await interaction.followUp({
        content: "⚠️ Esta whitelist já foi analisada.",
        ephemeral: true,
      });
      return;
    }

    decidedSubmissions.add(decisionKey);

    try {
      const targetMember = await interaction.guild.members.fetch(userId);

      if (action === "approve") {
        await targetMember.roles.add(
          whitelistRoleId,
          `Whitelist aprovada por ${interaction.user.tag}`
        );

        const approvedChannel =
          await interaction.guild.channels.fetch(approvedChannelId);

        if (approvedChannel instanceof TextChannel) {
          await approvedChannel.send({
            embeds: [
              new EmbedBuilder()
                .setTitle("✅ WHITELIST APROVADA")
                .setDescription(
                  [
                    `**Discord:** <@${userId}>`,
                    `**Aprovado por:** <@${interaction.user.id}>`,
                  ].join("\n")
                )
                .setTimestamp(),
            ],
          });
        }

        await interaction.message.edit({
          embeds: interaction.message.embeds.map((embed) => {
            const updated = EmbedBuilder.from(embed);

            updated.setDescription(
              [
                `**Discord:** <@${userId}>`,
                "",
                "**Status:** ✅ Aprovado",
                `**Moderador:** <@${interaction.user.id}>`,
              ].join("\n")
            );

            return updated;
          }),
          components: [],
        });

        try {
          await targetMember.send(
            [
              "✅ **WHITELIST APROVADA**",
              "",
              "Sua whitelist no Oblivion Stalker foi aprovada.",
              "",
              "Bem-vindo à Zona, Stalker.",
            ].join("\n")
          );
        } catch {}

        return;
      }

      if (action === "deny") {
        const deniedChannel =
          await interaction.guild.channels.fetch(deniedChannelId);

        if (deniedChannel instanceof TextChannel) {
          await deniedChannel.send({
            content: [
              "❌ **WHITELIST REPROVADA**",
              "",
              `Discord: <@${userId}>`,
            ].join("\n"),
          });
        }

        await interaction.message.edit({
          embeds: interaction.message.embeds.map((embed) => {
            const updated = EmbedBuilder.from(embed);

            updated.setDescription(
              [
                `**Discord:** <@${userId}>`,
                "",
                "**Status:** ❌ Reprovado",
                `**Moderador:** <@${interaction.user.id}>`,
              ].join("\n")
            );

            return updated;
          }),
          components: [],
        });

        try {
          await targetMember.send(
            [
              "❌ **WHITELIST REPROVADA**",
              "",
              "Sua whitelist no Oblivion Stalker não foi aprovada.",
              "",
              "Revise as regras e a lore antes de tentar novamente.",
            ].join("\n")
          );
        } catch {}

        return;
      }

      decidedSubmissions.delete(decisionKey);

      await interaction.followUp({
        content: "❌ Ação de whitelist inválida.",
        ephemeral: true,
      });
    } catch (error) {
      decidedSubmissions.delete(decisionKey);

      console.error(
        "❌ Erro ao processar decisão da whitelist:",
        error
      );

      await interaction.followUp({
        content:
          "❌ Não foi possível processar esta decisão. Verifique as permissões e a hierarquia de cargos do bot.",
        ephemeral: true,
      });
    }
  } catch (error) {
    console.error(
      "❌ Erro ao verificar moderador:",
      error
    );

    await interaction.followUp({
      content: "❌ Não foi possível verificar suas permissões.",
      ephemeral: true,
    });
  }
}
