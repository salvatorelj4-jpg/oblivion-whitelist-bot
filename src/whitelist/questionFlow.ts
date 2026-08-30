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

  const message = await channel.send({
    content: [
      `☢️ **PERGUNTA ${session.currentQuestion + 1}/${whitelistQuestions.length}**`,
      "",
      question,
      "",
      "*Responda abaixo.*",
    ].join("\n"),
  });

  updateSession(channel.id, {
    lastBotMessageId: message.id,
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

  if (!message.channel.isTextBased()) {
    return;
  }

  const session = getSession(message.channel.id);

  if (!session) {
    return;
  }

  if (message.author.id !== session.userId) {
    return;
  }

  const answer = message.content.trim();

  if (!answer) {
    return;
  }

  const answers = [...session.answers, answer];

  // Apaga a pergunta anterior.
  if (session.lastBotMessageId) {
    try {
      const previousBotMessage =
        await message.channel.messages.fetch(
          session.lastBotMessageId
        );

      await previousBotMessage.delete();
    } catch {
      // Ignora se já tiver sido removida.
    }
  }

  // Apaga a resposta do jogador.
  try {
    await message.delete();
  } catch {
    // Ignora caso não seja possível apagar.
  }

  const nextQuestion = session.currentQuestion + 1;

  if (nextQuestion >= whitelistQuestions.length) {
    updateSession(message.channel.id, {
      answers,
    });

    await message.channel.send({
      content: [
        "✅ **WHITELIST CONCLUÍDA**",
        "",
        "Todas as suas respostas foram registradas.",
        "",
        "Sua aplicação será enviada para análise da equipe.",
        "",
        "Este canal será fechado automaticamente.",
      ].join("\n"),
    });

    // Aqui vamos adicionar no próximo passo:
    // envio para o canal da staff
    // aprovação/reprovação
    // fechamento do canal

    deleteSession(message.channel.id);

    return;
  }

  updateSession(message.channel.id, {
    answers,
    currentQuestion: nextQuestion,
    lastBotMessageId: undefined,
    lastUserMessageId: undefined,
  });

  if (message.channel instanceof TextChannel) {
    await sendCurrentQuestion(message.channel);
  }
}
