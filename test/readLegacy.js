import { result,message,createDataItemSigner } from "@permaweb/aoconnect";
import { readFileSync } from "fs";

let jwk;
try {
  jwk = JSON.parse(readFileSync("wallet.json"), "utf-8");
} catch (e) {
  console.error("Error reading wallet.json:", e);
  process.exit(1);
}

const mid = await message({
  process: "bI6_qOobuHJBHMEubTLv3lmLHUfK043S4-kN0q_wt3E",
  tags: [{ name: "Action", value: "Get-Task" }],
  signer: createDataItemSigner(jwk),
});

console.log(mid);

const res = await result({
  process: "bI6_qOobuHJBHMEubTLv3lmLHUfK043S4-kN0q_wt3E",
  message: mid,
});

console.log(res);

let result_ = JSON.parse(res.Messages?.[0]?.Data || "{}");

console.log("Result:   \n");
console.log(result_.prompt);