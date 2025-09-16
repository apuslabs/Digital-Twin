
import { GoogleGenAI, Chat } from "@google/genai";
import type { GenerateContentResponse } from "@google/genai";

let ai: GoogleGenAI;

// We assume process.env.API_KEY is available in the environment.
try {
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
} catch (error) {
  console.error("Failed to initialize GoogleGenAI. Is the API_KEY set?", error);
}

export const startChatSession = (systemInstruction: string): Chat | null => {
  if (!ai) {
    console.error("GoogleGenAI not initialized.");
    return null;
  }
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
    });
    return chat;
  } catch(error) {
    console.error("Failed to start chat session", error);
    return null;
  }
};

export const sendMessage = async (
    chat: Chat, 
    message: string
): Promise<AsyncGenerator<GenerateContentResponse>> => {
    try {
        const response = await chat.sendMessageStream({ message });
        return response;
    } catch (error) {
        console.error("Error sending message:", error);
        throw new Error("Failed to get response from AI.");
    }
};
