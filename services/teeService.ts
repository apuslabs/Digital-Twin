// TEE Attestation Service
interface TEEAttestationResponse {
  attestation?: string;
  error?: string;
  timestamp?: string;
  provider?: string;
  status?: string;
}

interface TEEAttestationData {
  attestation?: {
    token?: string | unknown;
    raw?: string;
    nonce?: string;
  };
  message?: string;
  error?: string;
  [key: string]: unknown;
}

const TEE_ENDPOINT =
  "https://hb.apus.network/~inference@1.0/completions?tee=true";
export class TEEService {
  private static async requestTEEAttestation(
  ): Promise<TEEAttestationData> {
    const response = await fetch(TEE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt : " ",
        max_tokens: 1,
      }),
    });

    const responseText = await response.text();
    let data: TEEAttestationData = {};

    if (responseText) {
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse TEE response:", parseError);
      }
    }

    if (!response.ok) {
      const message =
        data?.message ||
        data?.error ||
        `TEE API error: ${response.status} ${response.statusText}`;
      throw new Error(message);
    }

    return data;
  }

  private static extractJwtFromArray(payload: unknown): string {
    if (Array.isArray(payload) && payload.length > 0) {
      const first = payload[0];
      if (
        Array.isArray(first) &&
        first.length >= 2 &&
        typeof first[1] === "string"
      ) {
        return first[1];
      }
    }
    return "";
  }

  private static extractJwtToken(attestationData?: {
    token?: string | unknown;
    raw?: string;
  }): string {
    if (!attestationData) {
      return "";
    }

    const { token, raw } = attestationData;
    const tokenPayload = token ?? raw;

    if (Array.isArray(tokenPayload)) {
      const jwt = this.extractJwtFromArray(tokenPayload);
      if (jwt) {
        return jwt;
      }
    }

    if (typeof tokenPayload === "string" && tokenPayload.trim()) {
      try {
        const parsed = JSON.parse(tokenPayload);
        const jwt = this.extractJwtFromArray(parsed);
        if (jwt) {
          return jwt;
        }
      } catch {
        // If token isn't JSON, assume it already contains the JWT string
        if (tokenPayload.startsWith("eyJ")) {
          return tokenPayload;
        }
      }
    }

    if (typeof raw === "string" && raw.startsWith("eyJ")) {
      return raw;
    }

    return "";
  }

  /**
   * Fetch the latest TEE attestation
   * @param sessionId - The session ID for this chat session
   * @returns Promise with attestation data
   */
  static async getAttestation(sessionId: string): Promise<TEEAttestationResponse> {
    try {
      let data: TEEAttestationData | null = null;
      data = await this.requestTEEAttestation();
      if (!data) {
        throw new Error("TEE API returned no data");
      }

      const messageText =
        typeof data.message === "string" ? data.message.toLowerCase() : "";

      if (data.error || messageText.includes("error")) {
        throw new Error(
          data.error || data.message || "TEE responded with an error"
        );
      }

      // Parse the response to extract JWT token
      let jwtToken = this.extractJwtToken(data.attestation);

      if (!jwtToken) {
        jwtToken = this.extractJwtFromArray(data as unknown);
      }

      if (!jwtToken) {
        console.warn("No JWT token found in response:", data);
        jwtToken = JSON.stringify(data.attestation ?? data);
      }

      return {
        attestation: jwtToken,
        timestamp: new Date().toISOString(),
        provider: "NVIDIA TEE",
        status: "VERIFIED"
      };
    } catch (error) {
      console.error("Error fetching TEE attestation:", error);
      return {
        error:
          error instanceof Error
            ? error.message
            : "Failed to fetch TEE attestation",
        timestamp: new Date().toISOString(),
        provider: "NVIDIA TEE",
        status: "ERROR"
      };
    }
  }
}

export default TEEService;
