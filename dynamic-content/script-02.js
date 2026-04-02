/**
 * script-02.js — Write, Read, and Update a Feed
 *
 * Demonstrates creating a publisher key, uploading content,
 * writing a reference to a feed, reading it back, then updating
 * the feed with new content and reading the updated reference.
 *
 * Usage:
 *   node script-02.js
 */

import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";
import crypto from "crypto";
import { config } from "dotenv";
config();

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

// --- Create a Publisher Key ---

const hex = "0x" + crypto.randomBytes(32).toString("hex");
const pk = new PrivateKey(hex);
const owner = pk.publicKey().address();

console.log("Private key:", pk.toHex());
console.log("Address:", owner.toHex());

// --- Write and Read a Feed ---

const topic = Topic.fromString("notes");

// Upload content to Swarm
const upload = await bee.uploadFile(batchId, "My first note", "note.txt");
console.log("\nContent hash:", upload.reference.toHex());

// Write the content reference to the feed
const writer = bee.makeFeedWriter(topic, pk);
await writer.upload(batchId, upload.reference);
console.log("Feed updated at index 0");

// Read the latest reference from the feed (retries until indexed)
const reader = bee.makeFeedReader(topic, owner);
const result = await retryFeedRead(() => reader.downloadReference());
console.log("Latest reference:", result.reference.toHex());
console.log("Current index:", result.feedIndex.toBigInt());

// --- Update the Feed ---

// Upload updated content
const upload2 = await bee.uploadFile(batchId, "My updated note", "note.txt");
console.log("\nNew content hash:", upload2.reference.toHex());

// Update the feed — writer auto-discovers the next index
await writer.upload(batchId, upload2.reference);
console.log("Feed updated at index 1");

// Reading the feed now returns the updated reference.
// Pass minFeedIndex so the retry waits for the new entry, not just any entry.
const result2 = await retryFeedRead(
  () => reader.downloadReference(),
  result.feedIndex.toBigInt() + 1n
);
console.log("Latest reference:", result2.reference.toHex());
console.log("Current index:", result2.feedIndex.toBigInt()); // 1n

// --- Retry helper ---

/**
 * Retries a feed read function until it returns an entry at or above
 * minFeedIndex. Logs elapsed time on each attempt and prompts the user
 * to continue or exit every 10 seconds when running interactively.
 *
 * @param {() => Promise<{feedIndex: {toBigInt: () => bigint}, reference: any}>} fn
 * @param {bigint} minFeedIndex  Minimum feed index to accept (default 0n)
 * @returns {Promise<any>}       Resolved value of fn once the index requirement is met
 */
async function retryFeedRead(fn, minFeedIndex = 0n) {
  const RETRY_INTERVAL_MS = 1_000;
  const PROMPT_INTERVAL_MS = 10_000;
  const start = Date.now();
  let lastPrompt = start;

  while (true) {
    try {
      const value = await fn();
      if (value.feedIndex.toBigInt() >= minFeedIndex) {
        if (Date.now() > start + RETRY_INTERVAL_MS) {
          process.stdout.write("\n"); // clear the retrying line
        }
        return value;
      }
      // Got a stale entry — treat as a miss and keep retrying
    } catch {}

    const elapsed = Math.round((Date.now() - start) / 1000);
    process.stdout.write(
      `\rFeed not yet indexed, retrying... (${elapsed}s elapsed)  `
    );

    const now = Date.now();
    if (process.stdin.isTTY && now - lastPrompt >= PROMPT_INTERVAL_MS) {
      lastPrompt = now;
      process.stdout.write(
        `\nStill waiting after ${elapsed}s. Press Enter to keep retrying, or Ctrl+C to exit: `
      );
      await new Promise((resolve) => process.stdin.once("data", resolve));
    }

    await new Promise((r) => setTimeout(r, RETRY_INTERVAL_MS));
  }
}
