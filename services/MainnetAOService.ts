import { connect, createDataItemSigner } from "@permaweb/aoconnect";
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
export class MainnetAOService {
  private request: any;

  constructor() {
    const { request } = connect({
      MODE: "mainnet",
      signer: createDataItemSigner(globalThis.arweaveWallet),
      URL: "https://hb.apus.network",
    });
    this.request = request;
  }

  /**
   * Submit a new prompt to a figure's agent process for AI evaluation
   * @param figure - The figure whose agent will receive the prompt
   * @param promptData - The prompt text to submit
   * @returns Promise with the result of the submission
   */
  async submitPromptForEvaluation(figure: Figure, promptData: string): Promise<AOResponse> {
    try {
      
      const result = await this.request({
        method: "POST",
        path: `/${figure.processId}~process@1.0/push/serialize~json@1.0`,
        target: figure.processId,
        signingFormat: "ANS-104",
        data: promptData,
      });
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
export const mainnetAOService = new MainnetAOService();
