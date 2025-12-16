import OpenAI from "openai";

import { ConversationEvaluationPrompt } from "./prompts";

type ChatHistoryMessage = {
  role: "assistant" | "user";
  content: string;
};

export interface ApusChat {
  systemInstruction: string;
  permanentPrompt: string;
  isFirstMessage: boolean;
  history: ChatHistoryMessage[];
  sessionId: string;
  figureId?: string; // Track which figure this chat is for
}

// Default endpoint for most figures
const openai = new OpenAI({
  apiKey: "APUS_KEY",
  baseURL: "https://hb.apus.network/~inference@1.0/",
  dangerouslyAllowBrowser: true
});

// Special endpoint for AO figure
const openaiAO = new OpenAI({
  apiKey: "APUS_KEY",
  baseURL: "https://hb3.apus.network/~inference@1.0/",
  dangerouslyAllowBrowser: true
});

// Get the appropriate OpenAI client based on figure ID
const getOpenAIClient = (figureId?: string): OpenAI => {
  return figureId === 'ao' ? openaiAO : openai;
};

const DEFAULT_CHAT_MODEL = "Gemma_3_27B";
const DEFAULT_COMPLETION_MODEL = DEFAULT_CHAT_MODEL;
const DEFAULT_COMPLETION_MAX_TOKENS = 200;
const MAX_HISTORY_MESSAGES = 12;

// Generate a unique session ID
const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `session_${timestamp}_${random}`;
};

const trimChatHistory = (session: ApusChat): void => {
  if (session.history.length <= MAX_HISTORY_MESSAGES) {
    return;
  }

  const excessCount = session.history.length - MAX_HISTORY_MESSAGES;
  session.history.splice(0, excessCount);
};

const parseJsonConfig = (config?: string): Record<string, unknown> => {
  if (!config) {
    return {};
  }

  try {
    return JSON.parse(config);
  } catch (error) {
    console.warn("Invalid APUS config provided, ignoring:", error);
    return {};
  }
};

const pickChatOptions = (
  config: Record<string, unknown>
): Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming> => {
  const allowedKeys: Array<keyof OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming> =
    [
      "frequency_penalty",
      "logit_bias",
      "logprobs",
      "max_tokens",
      "n",
      "presence_penalty",
      "seed",
      "stop",
      "temperature",
      "top_logprobs",
      "top_p",
    ];

  const result: Partial<OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming> =
    {};

  for (const key of allowedKeys) {
    const value = config[key as string];
    if (value !== undefined) {
      result[key] = value as never;
    }
  }

  return result;
};

const buildSystemMessage = (session: ApusChat): string | null => {
  const parts = [
    session.permanentPrompt?.trim(),
    session.systemInstruction?.trim(),
  ].filter(Boolean);

  if (!parts.length) {
    return null;
  }

  return parts.join("\n\n");
};

const buildMessagePayload = (
  session: ApusChat,
  userMessage: string
): OpenAI.Chat.Completions.ChatCompletionMessageParam[] => {
  const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];
  const systemContent = buildSystemMessage(session);

  if (systemContent) {
    messages.push({ role: "system", content: systemContent });
  }

  session.history.forEach((msg) => {
    messages.push({ role: msg.role, content: msg.content });
  });

  messages.push({ role: "user", content: userMessage });

  return messages;
};

export const startChatSession = (
  systemInstruction: string,
  permanentPrompt: string = "",
  figureId?: string
): ApusChat | null => {
  try {
    const sessionId = generateSessionId();

    return {
      systemInstruction,
      permanentPrompt,
      isFirstMessage: true,
      history: [],
      sessionId,
      figureId,
    };
  } catch (error) {
    console.error("Failed to start APUS chat session", error);
    return null;
  }
};

export const sendMessage = async (
  chatSession: ApusChat,
  message: string,
  config: string
): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session is not initialized");
  }
  trimChatHistory(chatSession);

  const parsedConfig = parseJsonConfig(config);
  const model =
    typeof parsedConfig.model === "string" && parsedConfig.model.trim()
      ? (parsedConfig.model as string)
      : DEFAULT_CHAT_MODEL;
  const chatOptions = pickChatOptions(parsedConfig);

  const messages = buildMessagePayload(chatSession, message);
  const requestPayload: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming =
  {
    model,
    messages,
    ...chatOptions,
  };
  try {
    const client = getOpenAIClient(chatSession.figureId);
    const response = await client.chat.completions.create(requestPayload);
    const content =
      response.choices?.[0]?.message?.content?.trim() ?? "";

    chatSession.history.push({ role: "user", content: message });
    chatSession.history.push({ role: "assistant", content });
    chatSession.isFirstMessage = false;
    trimChatHistory(chatSession);

    return content;
  } catch (error) {
    console.error("Error in sendMessage:", error);
    throw error;
  }
};

/**
 * Send a message with streaming support.
 * Calls onChunk for each content delta, enabling real-time text display.
 */
export const sendMessageStream = async (
  chatSession: ApusChat,
  message: string,
  config: string,
  onChunk: (content: string) => void
): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session is not initialized");
  }
  trimChatHistory(chatSession);

  const parsedConfig = parseJsonConfig(config);
  const model =
    typeof parsedConfig.model === "string" && parsedConfig.model.trim()
      ? (parsedConfig.model as string)
      : DEFAULT_CHAT_MODEL;
  const chatOptions = pickChatOptions(parsedConfig);

  const messages = buildMessagePayload(chatSession, message);

  try {
    const requestParams: OpenAI.Chat.Completions.ChatCompletionCreateParamsStreaming = {
      ...chatOptions,
      model,
      messages,
      stream: true,
    };

    const client = getOpenAIClient(chatSession.figureId);
    const stream = await client.chat.completions.create(requestParams);

    let fullContent = "";

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content ?? "";
      if (content) {
        fullContent += content;
        onChunk(content);
      }
    }

    chatSession.history.push({ role: "user", content: message });
    chatSession.history.push({ role: "assistant", content: fullContent });
    chatSession.isFirstMessage = false;
    trimChatHistory(chatSession);

    return fullContent;
  } catch (error) {
    console.error("Error in sendMessageStream:", error);
    throw error;
  }
};

export const createConversationEvaluationPrompt = (
  characterName: string,
  conversationData: string
): string => {
  return ConversationEvaluationPrompt
    .replace(/\{\{characterName\}\}/g, characterName)
    .replace(/\{\{conversationData\}\}/g, conversationData);
};

export const evaluate = async (evaluationPrompt: string): Promise<string> => {
  try {
    const completion = await openai.completions.create({
      model: DEFAULT_COMPLETION_MODEL,
      prompt: evaluationPrompt,
      max_tokens: DEFAULT_COMPLETION_MAX_TOKENS,
    });

    return completion.choices?.[0]?.text?.trim() ?? "";
  } catch (error) {
    console.error("Error in evaluate:", error);
    throw error;
  }
};

const extractJsonFromText = (input: string): unknown => {
  if (!input) {
    return { evaluation: "" };
  }

  const fencedMatch = input.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fencedMatch?.[1]?.trim() ?? input.trim();

  try {
    return JSON.parse(candidate);
  } catch {
    return { evaluation: input };
  }
};

export const evaluateConversation = async (
  characterName: string,
  conversationData: string
): Promise<any> => {
  const evaluationPrompt = createConversationEvaluationPrompt(
    characterName,
    conversationData
  );

  const rawResult = await evaluate(evaluationPrompt);
  if (!rawResult) {
    return { evaluation: "" };
  }

  return extractJsonFromText(rawResult);
};

export const formatConversationForEvaluation = (
  messages: Array<{ author: string; content: string }>
): string => {
  return messages
    .map((msg) => `${msg.author}: ${msg.content}`)
    .join("\n\n");
};

export type { ApusChat as Chat };
