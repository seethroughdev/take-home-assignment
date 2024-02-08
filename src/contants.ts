import OpenAI from "openai";

/* --------------------------------- EVENTS --------------------------------- */

export const EVT_USER_MESSAGE = "user-message";
export const EVT_COMPLETION_CHUNK = "completion-chunk";

/* ---------------------------------- HTTP ---------------------------------- */

export const SOCKET_URI = "/api/socket";

/* ---------------------------------- DATA ---------------------------------- */

export const DEFAULT_MESSAGES: OpenAI.ChatCompletionMessage[] = [
  {
    role: "system",
    content: "You are a ping pong machine",
  },
  {
    role: "user",
    content: "Ping?",
  },
  {
    role: "assistant",
    content: "Pong!",
  },
];
