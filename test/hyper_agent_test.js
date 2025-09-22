import { connect, createSigner } from "@permaweb/aoconnect";
import fs from "node:fs";

const jwk = JSON.parse(fs.readFileSync("wallet.json", "utf-8"));

const processId = "<your genesis_wasm generated process id>";

const { request } = connect({
  MODE: "mainnet",
  URL: "http://localhost:8734",
  signer: createSigner(jwk),
});

const processResult = await request({
  path: `/${processId}~process@1.0/push/serialize~json@1.0`,
  method: "POST",
  target: processId,
  signingFormat: "ANS-104",
});

console.log(processResult);