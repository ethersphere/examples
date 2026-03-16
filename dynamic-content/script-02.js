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

// Read the latest reference from the feed
const reader = bee.makeFeedReader(topic, owner);
const result = await reader.download();
console.log("Latest reference:", result.reference.toHex());
console.log("Current index:", result.feedIndex.toBigInt());

// --- Update the Feed ---

// Upload updated content
const upload2 = await bee.uploadFile(batchId, "My updated note", "note.txt");
console.log("\nNew content hash:", upload2.reference.toHex());

// Update the feed — writer auto-discovers the next index
await writer.upload(batchId, upload2.reference);
console.log("Feed updated at index 1");

// Reading the feed now returns the updated reference
const result2 = await reader.download();
console.log("Latest reference:", result2.reference.toHex());
console.log("Current index:", result2.feedIndex.toBigInt()); // 1n
