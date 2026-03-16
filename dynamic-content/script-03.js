/**
 * script-03.js — Feed Manifests — Stable URLs
 *
 * Demonstrates creating a feed manifest that provides a permanent
 * URL for your feed. The manifest hash never changes, even as the
 * feed is updated with new content.
 *
 * Usage:
 *   node script-03.js
 */

import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";
import crypto from "crypto";
import { config } from "dotenv";
config();

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

// Set up publisher and feed
const hex = "0x" + crypto.randomBytes(32).toString("hex");
const pk = new PrivateKey(hex);
const owner = pk.publicKey().address();
const topic = Topic.fromString("manifest-demo");
const writer = bee.makeFeedWriter(topic, pk);

// Upload initial content and write to feed
const upload1 = await bee.uploadFile(batchId, "Version 1 content", "page.txt");
await writer.upload(batchId, upload1.reference);
console.log("Uploaded version 1:", upload1.reference.toHex());

// Create a feed manifest (one-time operation)
const manifest = await bee.createFeedManifest(batchId, topic, owner);
console.log("Feed manifest:", manifest.toHex());
console.log(
  `\nAccess via: ${process.env.BEE_URL}/bzz/${manifest.toHex()}/`
);

// Update the feed with new content
const upload2 = await bee.uploadFile(batchId, "Version 2 content", "page.txt");
await writer.upload(batchId, upload2.reference);
console.log("\nUploaded version 2:", upload2.reference.toHex());
console.log(
  "Same URL now serves version 2:",
  `${process.env.BEE_URL}/bzz/${manifest.toHex()}/`
);
