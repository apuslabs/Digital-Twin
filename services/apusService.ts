
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
  permanentPrompt: string;
  isFirstMessage: boolean;
}

const APUS_ENDPOINT = 'https://hb.apus.network/~llamacpp@1.0/chat/serialize~json@1.0';

// Default configuration for APUS
const DEFAULT_CONFIG = JSON.stringify({ max_tokens: 3000 });

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
  return `DT-${timestamp}`;
};

// Create a chat session compatible with the existing interface
export const startChatSession = (systemInstruction: string, permanentPrompt: string = ''): ApusChat | null => {
  try {
    const sessionId = generateSessionId();
    const reference = generateReference();
    
    const chat: ApusChat = {
      sessionId,
      reference,
      systemInstruction,
      permanentPrompt,
      isFirstMessage: true
    };
    
    return chat;
  } catch (error) {
    console.error("Failed to start APUS chat session", error);
    return null;
  }
};

// Send message to APUS and return the complete response
export const sendMessage = async (chatSession: ApusChat, message: string, config: string): Promise<any> => {
  try {
    // Validate config
    let validConfig = DEFAULT_CONFIG;
    if (config) {
      try {
        JSON.parse(config);
        validConfig = config;
      } catch (e) {
        console.warn('Invalid config provided, using default:', e);
        validConfig = DEFAULT_CONFIG;
      }
    }
    console.log("Using config:", validConfig);
    // Build the prompt with system instruction on first message only
    let prompt = message;
    
    // Only send system instruction on the first message, combined with permanent prompt if available
    if (chatSession.isFirstMessage) {
      const combinedSystemInstruction = chatSession.permanentPrompt 
        ? `${chatSession.permanentPrompt}\n\n${chatSession.systemInstruction}`
        : chatSession.systemInstruction;
      
      prompt = `${combinedSystemInstruction}\n\n${message}`;
      
      // Mark as no longer first message for subsequent calls
      chatSession.isFirstMessage = false;
    }

    // Build request parameters
    const requestParams = {
      reference: chatSession.reference,
      session_id: chatSession.sessionId,
      prompt: prompt,
      config: validConfig
    };

    const url = new URL(APUS_ENDPOINT);
    url.searchParams.append('reference', requestParams.reference);
    url.searchParams.append('session_id', requestParams.session_id);
    url.searchParams.append('prompt', requestParams.prompt);
    url.searchParams.append('config', requestParams.config);
    console.log("url", url.toString());

    const response = await fetch(url.toString(), {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to send message: ${response.status} ${response.statusText}`);
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
    
    return responseText;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};


// Export the chat type for compatibility
export type { ApusChat as Chat };
