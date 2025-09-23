/**
 * Helper function to parse AO dryrun results
 * @param {Object} result - The result from AO dryrun
 * @returns {Object} Parsed result with status, reference, and data
 */
function parseAOResult(result) {
  if (!result.Messages || result.Messages.length === 0) {
    return {
      success: false,
      error: "No messages found in result",
      status: "error",
      reference: null,
      data: null
    };
  }

  const message = result.Messages[0];
  
  // Get status from tags
  const statusTag = message.Tags?.find(tag => tag.name === "status");
  const status = statusTag ? statusTag.value : "unknown";
  
  // Get reference from tags
  const referenceTag = message.Tags?.find(tag => tag.name === "X-Reference");
  const reference = referenceTag ? referenceTag.value : "unknown";
  
  // Parse the data (it's JSON stringified)
  let parsedData = null;
  try {
    parsedData = JSON.parse(message.Data);
  } catch (e) {
    console.log("Failed to parse Data as JSON, using raw data");
    parsedData = message.Data;
  }
  
  return {
    success: true,
    status: status,
    reference: reference,
    data: parsedData,
    rawMessage: message
  };
}

// Example usage:
export { parseAOResult };

// If running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  // Test with sample data
  const sampleResult = {
    "Messages": [{
      "Target": "1234",
      "Data": "{\"result\":\"Hello there! 👋 \\n\\nHow can I help you today?\"}",
      "Tags": [
        {"value": "ao", "name": "Data-Protocol"},
        {"value": "done", "name": "status"},
        {"value": "donald_trump-1758610847033", "name": "X-Reference"}
      ]
    }]
  };
  
  const parsed = parseAOResult(sampleResult);
  console.log("Parsed Result:", JSON.stringify(parsed, null, 2));
  
  if (parsed.success && parsed.data && parsed.data.result) {
    console.log("\n=== AI Response ===");
    console.log(parsed.data.result);
  }
}