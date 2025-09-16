import { message, createDataItemSigner } from "@permaweb/aoconnect";
import { Figure } from '../types';

export interface PromptSubmission {
  data: string;
  contributor?: string;
  timestamp?: number;
}

export interface AOResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Service for sending messages to AO processes using aoconnect
 */
export class AOService {
  private signer: any;

  constructor() {
    // Initialize the signer for signing messages
    this.signer = createDataItemSigner(globalThis.arweaveWallet);
  }

  /**
   * Submit a new prompt to a figure's agent process for AI evaluation
   * @param figure - The figure whose agent will receive the prompt
   * @param promptData - The prompt text to submit
   * @returns Promise with the result of the submission
   */
  async submitPromptForEvaluation(figure: Figure, promptData: string): Promise<AOResponse> {
    try {
      console.log(`Submitting prompt to ${figure.name}'s agent: ${figure.processId}`);
      
      const result = await message({
        process: figure.processId,
        tags: [
          { name: "Action", value: "ReceivePrompt" },
          { name: "Character", value: figure.name },
        ],
        signer: this.signer,
        data: promptData,
      });

      console.log(`Prompt submitted successfully. Message ID: ${result}`);
      
      return {
        success: true,
        messageId: result,
      };
    } catch (error) {
      console.error('Error submitting prompt:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send multiple prompts to the judge process for evaluation
   * @param agentProcessId - The agent process ID that's sending prompts to judge
   * @returns Promise with the result of sending to judge
   */
  async sendPromptsToJudge(agentProcessId: string): Promise<AOResponse> {
    try {
      console.log(`Triggering judge evaluation for agent: ${agentProcessId}`);
      
      const result = await message({
        process: agentProcessId,
        tags: [
          { name: "Action", value: "SendToJudge" },
          { name: "Timestamp", value: Date.now().toString() }
        ],
        signer: this.signer,
        data: "", // No data needed for triggering judge
      });

      console.log(`Judge evaluation triggered. Message ID: ${result}`);
      
      return {
        success: true,
        messageId: result,
      };
    } catch (error) {
      console.error('Error sending to judge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Upload a file content as prompt data
   * @param figure - The figure whose agent will receive the file content
   * @param fileContent - The content of the uploaded file
   * @param fileName - Name of the uploaded file
   * @returns Promise with the result of the submission
   */
  async submitFileForEvaluation(figure: Figure, fileContent: string, fileName: string): Promise<AOResponse> {
    try {
      console.log(`Submitting file "${fileName}" to ${figure.name}'s agent: ${figure.processId}`);
      
      const result = await message({
        process: figure.processId,
        tags: [
          { name: "Action", value: "ReceivePrompt" },
          { name: "Character", value: figure.name },
          { name: "ContentType", value: "file" },
          { name: "FileName", value: fileName },
          { name: "Timestamp", value: Date.now().toString() }
        ],
        signer: this.signer,
        data: fileContent,
      });

      console.log(`File submitted successfully. Message ID: ${result}`);
      
      return {
        success: true,
        messageId: result,
      };
    } catch (error) {
      console.error('Error submitting file:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Check if wallet is connected and ready
   * @returns boolean indicating if wallet is connected
   */
  isWalletConnected(): boolean {
    return typeof globalThis.arweaveWallet !== 'undefined';
  }

  /**
   * Get wallet address if connected
   * @returns Promise with wallet address or null
   */
  async getWalletAddress(): Promise<string | null> {
    try {
      if (!this.isWalletConnected()) {
        return null;
      }
      const address = await globalThis.arweaveWallet.getActiveAddress();
      return address;
    } catch (error) {
      console.error('Error getting wallet address:', error);
      return null;
    }
  }
}

// Export a singleton instance
export const aoService = new AOService();
