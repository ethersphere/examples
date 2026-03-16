/**
 * script-01.js — The Immutability Problem
 *
 * Demonstrates that every upload to Swarm produces a unique hash.
 * Even a small change in content results in a completely different reference.
 *
 * Usage:
 *   node script-01.js
 */

import { Bee } from "@ethersphere/bee-js";
import { config } from "dotenv";
config();

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

const upload1 = await bee.uploadFile(
  batchId,
  "Hello Swarm - version 1",
  "note.txt"
);
console.log("Version 1:", upload1.reference.toHex());

const upload2 = await bee.uploadFile(
  batchId,
  "Hello Swarm - version 2",
  "note.txt"
);
console.log("Version 2:", upload2.reference.toHex());
