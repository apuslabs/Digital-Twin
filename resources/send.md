import { message, createDataItemSigner } from "@permaweb/aoconnect";

// The only 2 mandatory parameters here are process and signer
await message({
  /*
    The arweave TxID of the process, this will become the "target".
    This is the process the message is ultimately sent to.
  */
  process: "process-id",
  // Tags that the process will use as input.
  tags: [
    { name: "Your-Tag-Name-Here", value: "your-tag-value" },
    { name: "Another-Tag", value: "another-value" },
  ],
  // A signer function used to build the message "signature"
  signer: createDataItemSigner(globalThis.arweaveWallet),
  /*
    The "data" portion of the message.
    If not specified a random string will be generated
  */
  data: "any data",
})
  .then(console.log)
  .catch(console.error);