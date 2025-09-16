interface ApusConfig {
  max_tokens: number;
}

interface ApusRequest {
  reference: string;
  session_id: string;
  prompt: string;
  config: string;
}

interface ApusResponse {
  body?: string;
  error?: string;
  'X-Reference'?: string;
  status?: number;
}

export interface ApusChat {
  sessionId: string;
  reference: string;
  systemInstruction: string;
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>;
}

export interface ApusStreamChunk {
  text: string;
  done?: boolean;
}

const APUS_ENDPOINT = 'https://hb.apus.network/~llamacpp@1.0/chat/serialize~json@1.0';

// Default configuration for APUS
const DEFAULT_CONFIG: ApusConfig = {
  max_tokens: 100
};

// Generate a unique session ID
const generateSessionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `session_${timestamp}_${random}`;
};

// Generate a reference ID (this could be from previous interactions or a default)
const generateReference = (): string => {
  // In a real implementation, this might come from a previous APUS interaction
  // For now, we'll use a mock reference based on the example
  const timestamp = Date.now();
  return `alex-${timestamp}`;
};

// Create a chat session compatible with the existing interface
export const startChatSession = (systemInstruction: string): ApusChat | null => {
  try {
    const sessionId = generateSessionId();
    const reference = generateReference();
    
    const chat: ApusChat = {
      sessionId,
      reference,
      systemInstruction,
      conversationHistory: []
    };
    
    return chat;
  } catch (error) {
    console.error("Failed to start APUS chat session", error);
    return null;
  }
};

// Send message to APUS and return the complete response as a single chunk
export const sendMessage = async (
  chat: ApusChat,
  message: string
): Promise<AsyncGenerator<ApusStreamChunk>> => {
  if (!chat) {
    throw new Error("Chat session not initialized");
  }

  try {
    // Add user message to conversation history
    chat.conversationHistory.push({ role: 'user', content: message });
    
    // Build the full prompt with system instruction and conversation history
    let fullPrompt = `${chat.systemInstruction}\n\n`;
    
    // Add conversation history
    for (const msg of chat.conversationHistory) {
      if (msg.role === 'user') {
        fullPrompt += `Human: ${msg.content}\n`;
      } else {
        fullPrompt += `Assistant: ${msg.content}\n`;
      }
    }
    
    fullPrompt += `Assistant: `;
    console.log("full prompt :", fullPrompt);
    // Prepare the request parameters
    const requestParams: ApusRequest = {
      reference: chat.reference,
      session_id: chat.sessionId,
      prompt: fullPrompt,
      config: JSON.stringify(DEFAULT_CONFIG)
    };

    // Create URL with parameters
    const url = new URL(APUS_ENDPOINT);
    url.searchParams.append('reference', requestParams.reference);
    url.searchParams.append('session_id', requestParams.session_id);
    url.searchParams.append('prompt', requestParams.prompt);
    url.searchParams.append('config', requestParams.config);
    console.log("url", url.toString());
    // Make the request to APUS
    const response = await fetch(url, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`APUS API error: ${response.status} ${response.statusText}`);
    }

    const data: ApusResponse = await response.json();
    
    if (data.error) {
      throw new Error(`APUS error: ${data.error}`);
    }

    // Parse the response from the body field
    let responseText = '';
    if (data.body) {
      try {
        const bodyData = JSON.parse(data.body);
        responseText = bodyData.result || '';
      } catch (e) {
        responseText = data.body;
      }
    }
    
    // Add assistant response to conversation history
    chat.conversationHistory.push({ role: 'assistant', content: responseText });
    
    // Update reference if provided
    if (data['X-Reference']) {
      chat.reference = data['X-Reference'];
    }

    // Return the complete response immediately as a single chunk
    return (async function* () {
      yield { text: responseText, done: false };
      yield { text: '', done: true };
    })();

  } catch (error) {
    console.error("Error sending message to APUS:", error);
    throw new Error("Failed to get response from APUS AI.");
  }
};

// Utility function to send a single message without streaming (for testing)
export const sendSingleMessage = async (
  systemInstruction: string,
  userMessage: string
): Promise<string> => {
  const chat = startChatSession(systemInstruction);
  if (!chat) {
    throw new Error("Failed to create chat session");
  }

  const stream = await sendMessage(chat, userMessage);
  let fullResponse = '';
  
  for await (const chunk of stream) {
    if (chunk.text) {
      fullResponse += chunk.text;
    }
  }
  
  return fullResponse.trim();
};

// Export the chat type for compatibility
export type { ApusChat as Chat };
