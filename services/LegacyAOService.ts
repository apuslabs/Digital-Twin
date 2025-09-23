import { message, createDataItemSigner, dryrun } from "@permaweb/aoconnect";
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
  reference?: string;
}

/**
 * LEGACY Service for sending messages to AO processes using aoconnect message function
 */
export class LegacyAOService {
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
      const reference = `${figure.id}-${Date.now()}`;
      const result = await message({
        process: figure.processId,
        tags: [
          { name: "Action", value: "ReceivePrompt" },
          { name: "Character", value: figure.name },
          { name: "X-Reference", value: reference },
        ],
        signer: this.signer,
        data: promptData,
      });

      console.log(`Prompt submitted successfully. Message ID: ${result}`);
      
      return {
        success: true,
        messageId: result,
        reference: reference,
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
   * Query the result of a submitted task using dryrun
   * @param processId - The process ID to query (can be agent or worker)
   * @param reference - The reference ID of the task to query
   * @returns Promise with the task result
   */
  async queryTaskResult(processId: string, reference: string): Promise<any> {
    try {
      console.log(`Querying task result for reference: ${reference} from process: ${processId}`);
      
      const result = await dryrun({
        process: processId,
        data: '',
        tags: [
          {
            name: "Action",
            value: "Query-Task-Result"
          },
          {
            name: "X-Reference", 
            value: reference
          }
        ],
        anchor: Date.now().toString(), // Use timestamp as anchor
      });

      console.log(`Task result query completed for reference: ${reference}`);
      return result;
    } catch (error) {
      console.error('Error querying task result:', error);
      throw error;
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
export const legacyAOService = new LegacyAOService();
export const aoService = legacyAOService;
