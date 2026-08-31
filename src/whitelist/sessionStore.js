const sessions = new Map();

function createSession(session) {
  sessions.set(session.channelId, session);
}

function getSession(channelId) {
  return sessions.get(channelId);
}

function deleteSession(channelId) {
  sessions.delete(channelId);
}

function updateSession(
  channelId,
  updates
) {
  const session =
    sessions.get(channelId);

  if (!session) {
    return;
  }

  sessions.set(channelId, {
    ...session,
    ...updates,
  });
}

module.exports = {
  createSession,
  getSession,
  deleteSession,
  updateSession,
};
