// TEE Attestation Service
interface TEEAttestationRequest {
  session_id: string;
}

interface TEEAttestationResponse {
  attestation?: string;
  error?: string;
  timestamp?: string;
  provider?: string;
  status?: string;
}

const TEE_ENDPOINT = 'https://hb2.apus.network/~sev_gpu@1.0/generate';

export class TEEService {
  /**
   * Fetch the latest TEE attestation
   * @param sessionId - The session ID for this chat session
   * @returns Promise with attestation data
   */
  static async getAttestation(sessionId: string): Promise<TEEAttestationResponse> {
    try {

      const requestParams: TEEAttestationRequest = {
        session_id: sessionId
      };

      // Create URL with parameters
      const url = new URL(TEE_ENDPOINT);
      url.searchParams.append('session_id', requestParams.session_id);

      const response = await fetch(url, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`TEE API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`TEE error: ${data.error}`);
      }

      // Parse the response to extract JWT token
      let jwtToken = '';
      
      if (Array.isArray(data) && data.length > 0) {
        // Response format: [["JWT", "token"], {...}]
        const firstElement = data[0];
        if (Array.isArray(firstElement) && firstElement.length >= 2 && firstElement[0] === 'JWT') {
          jwtToken = firstElement[1];
        }
      }

      if (!jwtToken) {
        console.warn('No JWT token found in response:', data);
        jwtToken = JSON.stringify(data);
      }

      return {
        attestation: jwtToken,
        timestamp: new Date().toISOString(),
        provider: 'APUS NVIDIA TEE',
        status: 'VERIFIED'
      };

    } catch (error) {
      console.error('Error fetching TEE attestation:', error);
      return {
        error: error instanceof Error ? error.message : 'Failed to fetch TEE attestation',
        timestamp: new Date().toISOString(),
        provider: 'APUS NVIDIA TEE',
        status: 'ERROR'
      };
    }
  }
}

export default TEEService;