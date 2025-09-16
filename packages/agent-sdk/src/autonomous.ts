import { BitteToolResult } from "@bitte-ai/types";

const BITTE_API_URL =
  "https://ai-runtime-446257178793.europe-west1.run.app/chat";

export interface AgentResponse {
  content: string;
  toolResults: BitteToolResult[];
  messageId: string;
  finishReason: string;
  agentId: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  messageId: string;
}

export interface ChatConfig {
  mode: "debug" | "production";
  agentId: string;
}

export interface ChatPayload {
  id: string;
  accountId: string;
  evmAddress: string;
  suiAddress: string;
  solanaAddress: string;
  messages: ChatMessage[];
  config: ChatConfig;
}

export async function callAgent(
  accountId: string,
  message: string,
  agentId: string,
  evmAddress: string = "",
  suiAddress: string = "",
  solanaAddress: string = "",
): Promise<AgentResponse> {
  const chatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  const payload: ChatPayload = {
    id: chatId,
    accountId,
    evmAddress,
    suiAddress,
    solanaAddress,
    messages: [
      {
        role: "user",
        content: message,
        messageId: Math.random().toString(36).substr(2, 9),
      },
    ],
    config: { mode: "debug", agentId },
  };

  const response = await fetch(BITTE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.BITTE_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Bitte API responded with status: ${response.status}`);
  }

  const text = await response.text();
  const lines = text.split("\n");

  let messageId = "";
  let content = "";
  let finishReason = "";
  let resultAgentId = "";
  const toolResults: {
    toolCallId: string;
    result: { error?: string; data?: unknown };
  }[] = [];

  for (const line of lines) {
    const prefix = line.substring(0, 2);
    const data = line.substring(2);

    switch (prefix) {
      case "f:":
        try {
          const metadata = JSON.parse(data);
          messageId = metadata.messageId || "";
        } catch {}
        break;
      case "0:":
        try {
          content += JSON.parse(data);
        } catch {}
        break;
      case "a:":
        try {
          toolResults.push(JSON.parse(data));
        } catch {}
        break;
      case "e:":
        try {
          const endData = JSON.parse(data);
          finishReason = endData.finishReason || "";
        } catch {}
        break;
      case "8:":
        try {
          const agentData = JSON.parse(data);
          if (Array.isArray(agentData) && agentData[0]?.agentId) {
            resultAgentId = agentData[0].agentId;
          }
        } catch {}
        break;
    }
  }

  return {
    content: content.trim(),
    toolResults: toolResults.map((toolResult) =>
      toolResult.result.error
        ? { error: toolResult.result.error }
        : { data: toolResult.result.data },
    ),
    messageId,
    finishReason,
    agentId: resultAgentId,
  };
}
