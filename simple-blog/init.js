/**
 * init.js — Initialize the Swarm blog.
 *
 * Run once to:
 *  1. Generate a publisher key
 *  2. Create an empty blog site and upload it
 *  3. Set up the feed and feed manifest
 *  4. Save config to config.json
 *
 * Usage:
 *   node init.js
 */

import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";
import crypto from "crypto";
import { writeFileSync } from "fs";
import { config } from "dotenv";
import { writeSiteFiles } from "./html.js";

config();

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;

// 1. Generate publisher key
const hex = "0x" + crypto.randomBytes(32).toString("hex");
const pk = new PrivateKey(hex);
const owner = pk.publicKey().address();
const topic = Topic.fromString("blog");

console.log("Generated publisher key.");
console.log("Address:", owner.toHex());

// 2. Create initial empty blog
const posts = [];
writeFileSync("posts.json", JSON.stringify(posts, null, 2));
writeSiteFiles(posts);

const upload = await bee.uploadFilesFromDirectory(batchId, "./site", {
  indexDocument: "index.html",
});
console.log("Uploaded empty blog:", upload.reference.toHex());

// 3. Set up feed and manifest
const writer = bee.makeFeedWriter(topic, pk);
await writer.upload(batchId, upload.reference);
console.log("Feed updated at index 0.");

const manifest = await bee.createFeedManifest(batchId, topic, owner);
console.log("Feed manifest created:", manifest.toHex());

// 4. Save config
const cfg = {
  privateKey: pk.toHex(),
  owner: owner.toHex(),
  topic: "blog",
  manifest: manifest.toHex(),
};
writeFileSync("config.json", JSON.stringify(cfg, null, 2));

console.log("\nBlog initialized!");
console.log(`View your blog: ${process.env.BEE_URL}/bzz/${manifest.toHex()}/`);
