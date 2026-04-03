/**
 * add-author.js — Add a new author to the multi-author blog.
 *
 * This script:
 *  1. Generates a new key for the author
 *  2. Uploads an empty initial blog page for them
 *  3. Creates their feed and feed manifest
 *  4. Appends their entry to authors.json and re-uploads to the index feed
 *  5. Updates config.json so the author can use add-post.js
 *
 * Run update-index.js afterwards to refresh the homepage with the new author.
 *
 * Usage:
 *   node add-author.js <name>
 *
 * Example:
 *   node add-author.js charlie
 */

import { Bee, Topic, PrivateKey } from "@ethersphere/bee-js";
import crypto from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { config } from "dotenv";
config();

const [,, nameArg] = process.argv;
if (!nameArg) {
  console.error("Usage: node add-author.js <name>");
  process.exit(1);
}

const authorName = nameArg.toLowerCase();
const authorLabel = authorName.charAt(0).toUpperCase() + authorName.slice(1);

const bee = new Bee(process.env.BEE_URL);
const batchId = process.env.BATCH_ID;
const cfg = JSON.parse(readFileSync("config.json", "utf-8"));

if (cfg[authorName]) {
  console.error(`Author "${authorName}" already exists in config.json.`);
  process.exit(1);
}

// --- Step 1: Generate a key for the new author ---
const hex = "0x" + crypto.randomBytes(32).toString("hex");
const authorKey = new PrivateKey(hex);
const authorOwner = authorKey.publicKey().address();
const authorTopic = Topic.fromString(`${authorName}-posts`);

console.log(`Adding author: ${authorLabel}`);
console.log(`Address: ${authorOwner.toHex()}`);

// --- Step 2: Upload initial empty page ---
const html = generateAuthorHTML(authorLabel, []);
const upload = await bee.uploadFile(batchId, html, "index.html", {
  contentType: "text/html",
});
console.log("Uploaded initial page:", upload.reference.toHex());

// --- Step 3: Create feed and manifest ---
const writer = bee.makeFeedWriter(authorTopic, authorKey);
await writer.upload(batchId, upload.reference);

const manifest = await bee.createFeedManifest(batchId, authorTopic, authorOwner);
console.log("Feed manifest:", manifest.toHex());

// --- Step 4: Append to authors.json and re-upload to index feed ---
const authors = JSON.parse(readFileSync("authors.json", "utf-8"));

if (authors.find((a) => a.name.toLowerCase() === authorName)) {
  console.error(`Author "${authorName}" already exists in authors.json.`);
  process.exit(1);
}

authors.push({
  name: authorLabel,
  topic: `${authorName}-posts`,
  owner: authorOwner.toHex(),
  feedManifest: manifest.toHex(),
});
const authorsJson = JSON.stringify(authors, null, 2);
writeFileSync("authors.json", authorsJson);

const indexUpload = await bee.uploadFile(batchId, authorsJson, "authors.json", {
  contentType: "application/json",
});
const adminKey = new PrivateKey(cfg.admin.privateKey);
const indexTopic = Topic.fromString(cfg.topics.index);
const indexWriter = bee.makeFeedWriter(indexTopic, adminKey);
await indexWriter.upload(batchId, indexUpload.reference);
console.log("Index feed updated.");

// --- Step 5: Update config.json ---
cfg[authorName] = {
  privateKey: authorKey.toHex(),
  owner: authorOwner.toHex(),
};
cfg.topics[authorName] = `${authorName}-posts`;
cfg.manifests[authorName] = manifest.toHex();
writeFileSync("config.json", JSON.stringify(cfg, null, 2));

console.log(`\nAuthor "${authorLabel}" added! (${authors.length} authors total)`);
console.log(`Their feed: ${process.env.BEE_URL}/bzz/${manifest.toHex()}/`);
console.log(`Run update-index.js to refresh the homepage.`);

function generateAuthorHTML(name, posts) {
  const items = posts
    .map(
      (p) => `
    <div style="border:1px solid #ddd; padding:12px; margin:8px 0; border-radius:4px;">
      <h2 style="margin:0 0 4px 0;">${p.title}</h2>
      <small style="color:#888;">${p.date}</small>
      <p>${p.body}</p>
    </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${name}'s Blog</title></head>
<body style="max-width:680px; margin:40px auto; font-family:sans-serif;">
  <h1>${name}'s Blog</h1>
  <p>${posts.length} post${posts.length !== 1 ? "s" : ""}</p>
  ${items || "<p><em>No posts yet.</em></p>"}
</body>
</html>`;
}
