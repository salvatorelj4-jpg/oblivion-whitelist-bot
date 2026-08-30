import {
  Message,
  TextChannel,
} from "discord.js";

import { whitelistQuestions } from "../config/questions";

import {
  deleteSession,
  getSession,
  updateSession,
} from "./sessionStore";

import { sendWhitelistForReview } from "./reviewSubmission";

export async function sendCurrentQuestion(
  channel: TextChannel
) {
  const session = getSession(channel.id);

  if (!session) {
    return;
  }

  const question = whitelistQuestions[session.currentQuestion];

  if (!question) {
    return;
  }

  const questionMessage = await channel.send({
    content: [
      `☢️ **PERGUNTA ${session.currentQuestion + 1}/${whitelistQuestions.length}**`,
      "",
      question,
      "",
      "*Responda abaixo.*",
    ].join("\n"),
  });

  updateSession(channel.id, {
    lastBotMessageId: questionMessage.id,
  });
}

export async function handleWhitelistAnswer(
  message: Message
) {
  if (!message.guild) {
    return;
  }

  if (message.author.bot) {
    return;
  }

  if (!(message.channel instanceof TextChannel)) {
    return;
  }

  const session = getSession(message.channel.id);

  if (!session) {
    return;
  }

  // Somente o dono da whitelist pode responder.
  if (message.author.id !== session.userId) {
    return;
  }

  const answer = message.content.trim();

  if (!answer) {
    return;
  }

  const answers = [...session.answers, answer];

  // Remove a pergunta anterior.
  if (session.lastBotMessageId) {
    try {
      const previousBotMessage =
        await message.channel.messages.fetch(
          session.lastBotMessageId
        );

      await previousBotMessage.delete();
    } catch {
      // A mensagem pode já ter sido removida.
    }
  }

  // Remove a resposta do jogador depois de salvá-la.
  try {
    await message.delete();
  } catch {
    // Continua mesmo que o Discord não permita apagar.
  }

  const nextQuestion = session.currentQuestion + 1;

  // Última pergunta concluída.
  if (nextQuestion >= whitelistQuestions.length) {
    updateSession(message.channel.id, {
      answers,
    });

    try {
      await sendWhitelistForReview({
        client: message.client,
        guildId: message.guild.id,
        userId: session.userId,
        username: message.author.username,
        answers,
      });
    } catch (error) {
      console.error(
        "❌ Erro ao enviar whitelist para análise:",
        error
      );

      await message.channel.send({
        content: [
          "❌ **ERRO AO ENVIAR A WHITELIST**",
          "",
          "Não foi possível encaminhar sua aplicação para a equipe.",
          "",
          "O canal será mantido aberto para que a staff possa verificar o problema.",
        ].join("\n"),
      });

      return;
    }

    await message.channel.send({
      content: [
        "✅ **WHITELIST CONCLUÍDA**",
        "",
        "Todas as suas respostas foram registradas.",
        "",
        "Sua aplicação foi enviada para análise da equipe.",
        "",
        "Você receberá o resultado após a avaliação.",
        "",
        "Este canal será fechado automaticamente em alguns segundos.",
      ].join("\n"),
    });

    deleteSession(message.channel.id);

    const channel = message.channel;

    setTimeout(async () => {
      try {
        await channel.delete(
          "Whitelist concluída e enviada para análise."
        );
      } catch (error) {
        console.error(
          "❌ Erro ao fechar canal da whitelist:",
          error
        );
      }
    }, 5000);

    return;
  }

  // Avança para a próxima pergunta.
  updateSession(message.channel.id, {
    answers,
    currentQuestion: nextQuestion,
    lastBotMessageId: undefined,
    lastUserMessageId: undefined,
  });

  await sendCurrentQuestion(message.channel);
}
