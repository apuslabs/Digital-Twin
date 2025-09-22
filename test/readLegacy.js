import { result } from "@permaweb/aoconnect";

let { Messages, Spawns, Output, Error } = await result({
  // the arweave TxID of the message
  message: "kVX6Rnnv3HZU7e0sZYsTkWpo04mSjdXK9FKDTfnhfV8",
  // the arweave TxID of the process
  process: "lcCDXWe4-id9pI7iMklNp3RvNdfA95Fm-gBx1yngVco",
});
console.log("Messages:", Messages);
console.log("Spawns:", Spawns);
console.log("Output:", Output);
console.log("Error:", Error);