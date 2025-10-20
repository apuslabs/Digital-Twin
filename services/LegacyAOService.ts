import { message, createDataItemSigner, dryrun } from "@permaweb/aoconnect";
import { Figure } from '../types';
import { JudgePrompt } from './prompts';

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

export interface QueryResult {
  success: boolean;
  status: string;
  reference: string;
  data?: any;
  error?: string;
  message?: string;
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
      const reference = `${figure.id}-${Date.now()}`;
       
      // Combine judge prompt with character-specific information and user's prompt data
      const judgePromptWithData = JudgePrompt
        .replace('{{characterName}}', figure.name)
        .replace('{{characterBackground}}', figure.systemPrompt)
        .replace('{{promptData}}', promptData);
      
      const result = await message({
        process: figure.processId,
        tags: [
          { name: "Action", value: "ReceivePrompt" },
          { name: "Character", value: figure.name },
          { name: "X-Reference", value: reference },
        ],
        signer: this.signer,
        data: judgePromptWithData,
      });

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
   * Parse AO dryrun results
   * @param result - The result from AO dryrun
   * @returns Parsed result with status, reference, and data
   */
  private parseAOResult(result: any): QueryResult {
    if (!result.Messages || result.Messages.length === 0) {
      return {
        success: false,
        error: "No messages found in result",
        status: "error",
        reference: "unknown",
        data: null
      };
    }

    const message = result.Messages[0];
    
    // Get status from tags
    const statusTag = message.Tags?.find((tag: any) => tag.name === "status");
    let status = statusTag ? statusTag.value : "unknown";
    
    // Get reference from tags
    const referenceTag = message.Tags?.find((tag: any) => tag.name === "X-Reference");
    const reference = referenceTag ? referenceTag.value : "unknown";
    
    // Parse the data (it's JSON stringified)
    let parsedData = null;
    try {
      parsedData = JSON.parse(message.Data);
      
      // If the data contains AI evaluation results, parse them
      if (parsedData && parsedData.result) {
        const evaluationResult = this.parseEvaluationResult(parsedData.result);
        if (evaluationResult) {
          parsedData.evaluation = evaluationResult;
        }
      }
    } catch (e) {
      parsedData = message.Data;
      // When JSON parsing fails, it likely means the task is still processing
      status = "processing";
    }
    
    return {
      success: true,
      status: status,
      reference: reference,
      data: parsedData
    };
  }

  /**
   * Parse AI evaluation result from JSON data
   * @param resultText - The result text containing JSON in markdown format
   * @returns Parsed evaluation with score and reasoning, or null if parsing fails
   */
  private parseEvaluationResult(resultText: string): { score: number; reasoning: string } | null {
    try {
      // Extract JSON from markdown code block
      const jsonMatch = resultText.match(/```json\n([\s\S]*?)\n```/);
      
      if (jsonMatch && jsonMatch[1]) {
        const evaluationData = JSON.parse(jsonMatch[1]);
        return {
          score: evaluationData.score || 0,
          reasoning: evaluationData.reasoning || "No reasoning provided"
        };
      }
      return null;
    } catch (error) {
      console.error("Failed to parse evaluation result:", error);
      return null;
    }
  }

  /**
   * Query the result of a submitted task using dryrun
   * @param processId - The process ID to query (can be agent or worker)
   * @param reference - The reference ID of the task to query
   * @returns Promise with the parsed task result
   */
  async queryTaskResult(processId: string, reference: string): Promise<QueryResult> {
    try {
      
      const result = await dryrun({
        process: processId,
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
      });

      
      // Parse the result using the helper function
      const parsed = this.parseAOResult(result);
      
      // Add user-friendly messages based on status
      if (!parsed.success) {
        return parsed;
      }
      
      if (parsed.status !== "done") {
        return {
          ...parsed,
          message: `Task is still processing. Status: ${parsed.status}. Please try querying again in a moment.`
        };
      }
      
      return parsed;
    } catch (error) {
      console.error('Error querying task result:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        status: "error",
        reference: reference
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
export const legacyAOService = new LegacyAOService();
export const aoService = legacyAOService;
