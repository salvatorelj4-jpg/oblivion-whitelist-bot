export type WhitelistSession = {
  userId: string;
  channelId: string;
  currentQuestion: number;
  answers: string[];
  lastBotMessageId?: string;
  lastUserMessageId?: string;
};

const sessions = new Map<string, WhitelistSession>();

export function createSession(session: WhitelistSession) {
  sessions.set(session.channelId, session);
}

export function getSession(channelId: string) {
  return sessions.get(channelId);
}

export function deleteSession(channelId: string) {
  sessions.delete(channelId);
}

export function updateSession(
  channelId: string,
  updates: Partial<WhitelistSession>
) {
  const session = sessions.get(channelId);

  if (!session) {
    return;
  }

  sessions.set(channelId, {
    ...session,
    ...updates,
  });
}
