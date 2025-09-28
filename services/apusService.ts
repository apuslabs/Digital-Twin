
import { ConversationEvaluationPrompt } from './prompts';

interface ApusResponse {
  body?: string;
  error?: string;
  'X-Reference'?: string;
  status?: number;
}

export interface ApusChat {
  sessionId: string;
  systemInstruction: string;
  permanentPrompt: string;
  isFirstMessage: boolean;
}

const APUS_ENDPOINT = 'https://hb.apus.network/~llamacpp@1.0/chat/serialize~json@1.0';
const APUS_COMPLETION_ENDPOINT = 'https://hb.apus.network/~llamacpp@1.0/completion/serialize~json@1.0';

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
    
    const chat: ApusChat = {
      sessionId,
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
const ensureUserPrefix = (content: string): string => {
  const trimmed = content.trim();
  return trimmed.toLowerCase().startsWith("user:") ? trimmed : `User: ${trimmed}`;
};

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
    const userPrompt = ensureUserPrefix(message);
    let prompt = userPrompt;
    
    // Only send system instruction on the first message, combined with permanent prompt if available
    if (chatSession.isFirstMessage) {
      // const combinedSystemInstruction = chatSession.permanentPrompt 
      //   ? `${chatSession.permanentPrompt}\n\n${chatSession.systemInstruction}`
      //   : chatSession.systemInstruction;
      const combinedSystemInstruction = chatSession.systemInstruction;
      prompt = `${combinedSystemInstruction}\n\n${userPrompt}`;
      
        // Mark as no longer first message for subsequent calls
        chatSession.isFirstMessage = false;
    }
    console.log("Final prompt sent to APUS:", prompt);
    
    // Generate a unique reference for this specific message
    const messageReference = generateReference();
    
    // Build request parameters
    const requestParams = {
      reference: messageReference,
      session_id: chatSession.sessionId,
      prompt: prompt,
      config: validConfig
    };
    console.log("reference : ", requestParams.reference);
    console.log("session_id : ", requestParams.session_id);
    const url = new URL(APUS_ENDPOINT);
    url.searchParams.append('reference', requestParams.reference);
    url.searchParams.append('session_id', requestParams.session_id);
    url.searchParams.append('prompt', requestParams.prompt);
    url.searchParams.append('config', requestParams.config);

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
    // Normalize odd leading artifacts sometimes returned by the model
    // - Strip BOM/zero-width no-break space
    // - Remove a leading standalone '.' line
    // - Trim only left side to keep user's intended trailing whitespace/newlines
    if (responseText) {
      // Remove BOM/ZWNBSP if present
      responseText = responseText.replace(/^\uFEFF/, "");
      // Remove a leading line that is just a period
      const lines = responseText.split(/\r?\n/);
      if (lines.length > 0 && lines[0].trim() === '.') {
        lines.shift();
        responseText = lines.join('\n');
      }
      // Avoid accidental extra leading blank lines
      responseText = responseText.replace(/^\s*\n/, '');
    }

    return responseText;
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
};

// Helper function to create evaluation prompt for conversation
export const createConversationEvaluationPrompt = (
  characterName: string, 
  characterBackground: string, 
  conversationData: string
): string => {
  return ConversationEvaluationPrompt
    .replace(/\{\{characterName\}\}/g, characterName)
    .replace(/\{\{characterBackground\}\}/g, characterBackground)
    .replace(/\{\{conversationData\}\}/g, conversationData);
};

// Fixed configuration for evaluation service
const EVALUATION_CONFIG = JSON.stringify({ 
  temperature: 0,
});

// Evaluate conversation quality using completion endpoint
export const evaluate = async (evaluationPrompt: string): Promise<any> => {
  try {
    console.log("Evaluation prompt:", evaluationPrompt);

    // Generate a unique reference for this evaluation
    const reference = `EVAL-${Date.now()}`;

    // Build request parameters for completion endpoint
    const requestParams = {
      reference: reference,
      prompt: evaluationPrompt,
      config: EVALUATION_CONFIG
    };

    const url = new URL(APUS_COMPLETION_ENDPOINT);
    url.searchParams.append('reference', requestParams.reference);
    url.searchParams.append('prompt', requestParams.prompt);
    url.searchParams.append('config', requestParams.config);

    console.log("Evaluation URL:", url.toString());

    const response = await fetch(url.toString(), {
      method: 'POST'
    });

    if (!response.ok) {
      throw new Error(`Failed to evaluate conversation: ${response.status} ${response.statusText}`);
    }

    const data: ApusResponse = await response.json();
    
    if (data.error) {
      throw new Error(`APUS evaluation error: ${data.error}`);
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

    // Try to parse as JSON for structured evaluation results
    try {
      return JSON.parse(responseText);
    } catch (e) {
      // If not JSON, return as plain text
      return { evaluation: responseText };
    }
    
  } catch (error) {
    console.error('Error in evaluate:', error);
    throw error;
  }
};

// Helper function to format conversation messages for evaluation
export const formatConversationForEvaluation = (messages: Array<{author: string, content: string}>): string => {
  return messages
    .map(msg => `${msg.author}: ${msg.content}`)
    .join('\n\n');
};

// High-level function to evaluate a conversation with a character
export const evaluateConversation = async (
  characterName: string,
  characterBackground: string,
  conversationData: string
): Promise<any> => {
  try {
    const evaluationPrompt = createConversationEvaluationPrompt(
      characterName,
      characterBackground,
      conversationData
    );
    
    const result = await evaluate(evaluationPrompt);
    
    // Parse the evaluation result if it's wrapped in markdown
    if (result && result.evaluation && typeof result.evaluation === 'string') {
      try {
        // Extract JSON from markdown code blocks
        const jsonMatch = result.evaluation.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch && jsonMatch[1]) {
          const parsedResult = JSON.parse(jsonMatch[1]);
          console.log('Parsed evaluation result:', parsedResult);
          return parsedResult;
        } else {
          // Try parsing the raw string if no markdown wrapper
          const parsedResult = JSON.parse(result.evaluation);
          return parsedResult;
        }
      } catch (parseError) {
        console.warn('Failed to parse evaluation JSON, using raw result:', parseError);
        return result;
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error in evaluateConversation:', error);
    throw error;
  }
};

// Export the chat type for compatibility
export type { ApusChat as Chat };
