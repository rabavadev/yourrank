const PUSHER_APP_KEY = "eb1d5f283081a78b932c";
const PUSHER_WS_URL = `wss://ws-us2.pusher.com/app/${PUSHER_APP_KEY}?protocol=7&client=js&version=8.4.0-rc2&flash=false`;

export function connectKickChat({ chatroomId, onMessage, onOpen, onError, onClose } = {}) {
  const ws = new WebSocket(PUSHER_WS_URL);
  ws.onopen = () => {
    ws.send(JSON.stringify({
      event: "pusher:subscribe",
      data: {
        auth: "",
        channel: `chatrooms.${chatroomId}.v2`,
      },
    }));
    onOpen?.();
  };
  ws.onmessage = (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.event === "pusher:ping") {
        ws.send(JSON.stringify({ event: "pusher:pong", data: {} }));
        return;
      }
      if (message.event === "App\\Events\\ChatMessageEvent") {
        onMessage?.(typeof message.data === "string" ? JSON.parse(message.data) : message.data);
      }
    } catch (error) {
      onError?.(error);
    }
  };
  ws.onerror = onError;
  ws.onclose = onClose;
  return {
    close() {
      try {
        ws.close();
      } catch {}
    },
  };
}

export function computeTrustScore(username, content, timestamp, {
  chatHistory = new Map(),
  recentEntryTimestamps = [],
  pastWinners = new Set(),
} = {}) {
  let score = 75;
  let sybilFlag = false;

  const recentCluster = recentEntryTimestamps.filter((time) => (timestamp - time) < 600).length;
  if (recentCluster >= 3) {
    score -= 35;
    sybilFlag = true;
  } else if (recentCluster >= 1) {
    score -= 10;
  } else {
    score += 10;
  }

  const priorChats = chatHistory.get(username.toLowerCase()) || 0;
  if (priorChats >= 3) score += 15;
  else if (priorChats >= 1) score += 8;
  else score -= 10;

  if (/\d{4,}$/.test(username)) score -= 15;
  if (/^(user|kick|guest|alt|bot|test)\d+/i.test(username)) {
    score -= 25;
    sybilFlag = true;
  }
  if (pastWinners.has(username.toLowerCase())) score -= 35;

  return {
    trustScore: Math.max(10, Math.min(99, score)),
    sybilFlag,
    altReason: sybilFlag ? "Chat activity matches common duplicate-account patterns." : "",
  };
}
