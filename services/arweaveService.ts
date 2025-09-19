// Arweave Service for fetching permanent prompts
interface ArweaveData {
  prompt?: string;
  content?: string;
  data?: any;
}

export class ArweaveService {
  /**
   * Fetch permanent prompt from Arweave
   * @param txId - The Arweave transaction ID
   * @returns Promise with the prompt content
   */
  static async fetchPermanentPrompt(txId: string): Promise<string> {
    try {
      console.log('Fetching permanent prompt from Arweave:', txId);

      const response = await fetch(`https://arweave.net/${txId}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/plain, application/json, */*'
        }
      });

      if (!response.ok) {
        throw new Error(`Arweave fetch error: ${response.status} ${response.statusText}`);
      }

      // Try to get as text first
      const contentType = response.headers.get('content-type');
      let content = '';

      if (contentType && contentType.includes('application/json')) {
        // If it's JSON, try to extract prompt field
        const data: ArweaveData = await response.json();
        content = data.prompt || data.content || JSON.stringify(data);
      } else {
        // Otherwise get as text
        content = await response.text();
      }

      console.log('Fetched permanent prompt:', content.substring(0, 100) + '...');
      return content.trim();

    } catch (error) {
      console.error('Error fetching permanent prompt from Arweave:', error);
      // Return empty string on error so it doesn't break the chat
      return '';
    }
  }
}

export default ArweaveService;