
import { message, createDataItemSigner, dryrun } from "@permaweb/aoconnect";
import { parseAOResult } from "./parseAOResult.js";

const result = await dryrun({
  process: "bI6_qOobuHJBHMEubTLv3lmLHUfK043S4-kN0q_wt3E",
  tags: [
    {
      name: "Action",
      value: "Query-Task-Result"
    },
    {
      name: "X-Reference", 
      value: "donald_trump-1758610847033"
    }
  ],
});

console.log(`Raw Result: ${JSON.stringify(result)}`);
console.log("\n" + "=".repeat(50));

// Parse the result using helper function
const parsed = parseAOResult(result);

if (parsed.success) {
  console.log(`Status: ${parsed.status}`);
  console.log(`Reference: ${parsed.reference}`);
  
  if (parsed.data && parsed.data.result) {
    console.log("\n=== AI RESPONSE ===");
    console.log(parsed.data.result);
  } else {
    console.log("\n=== RAW DATA ===");
    console.log(JSON.stringify(parsed.data, null, 2));
  }
} else {
  console.log(`Error: ${parsed.error}`);
}